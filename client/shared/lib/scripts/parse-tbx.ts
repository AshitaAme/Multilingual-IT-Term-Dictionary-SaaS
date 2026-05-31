import * as fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import path from 'node:path';
import { ParseError } from '@/shared/errors/errors';
import { ParsedTerm } from './transfer-tbx';

export function parseTbx(filePath: string): ParsedTerm[] {
  const xml = fs.readFileSync(filePath, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    trimValues: true,
    // Force these nodes to always parse as arrays, even when only one element exists
    isArray: (tagName) =>
      ['termEntry', 'langSet', 'ntig', 'descrip'].includes(tagName),
  });

  const root = parser.parse(xml);
  const termEntries: TermEntry[] = root?.martif?.text?.body?.termEntry ?? [];
  if (termEntries.length === 0) {
    throw new ParseError(`${parseTbx.name}: Empty tbx file or parse failed`);
  }

  return parseMSTerm(termEntries);
}

export function parseMSTerm(termEntries: TermEntry[]) {
  const res: ParsedTerm[] = [];
  const log: string[] = [];

  for (const termEntry of termEntries) {
    const parsedTerm: ParsedTerm = {
      source: '',
      sourceLang: '',
      target: '',
      targetLang: '',
    };

    if (!termEntry.langSet) continue;
    let index = -1;
    for (const langSet of termEntry.langSet) {
      index++;
      const lang = langSet['@_xml:lang'];
      // Skip the entire entry if any langSet has no term
      if (!langSet.ntig) break;

      // Extract term value from the first valid ntig
      for (const ntig of langSet.ntig) {
        const termGrp = ntig.termGrp;
        if (!termGrp.term) break;
        const termValue = termGrp.term['#text'];
        if (!termValue) break;

        if (index === 0) {
          parsedTerm.source = termValue;
          parsedTerm.sourceLang = lang;
        } else {
          parsedTerm.target = termValue;
          parsedTerm.targetLang = lang;
        }
      }

      // Extract definition if present
      const descrips = langSet.descripGrp?.descrip;
      if (!descrips) continue;
      for (const descrip of descrips) {
        if (descrip['@_type'] === 'definition') {
          parsedTerm.sourceDefinition = descrip['#text'];
        }
      }
    }

    // Only include entries with both source and target populated
    if (
      parsedTerm.source.trim() &&
      parsedTerm.target.trim() &&
      parsedTerm.targetLang.trim()
    ) {
      res.push(parsedTerm);
      log.push(`Success: ${termEntry.id} ${JSON.stringify(parsedTerm)}`);
    } else {
      log.push(`Failure: ${termEntry.id} ${JSON.stringify(parsedTerm)}`);
    }
  }

  const logPath = path.join(__dirname, 'logs/MS-Tbx.log');
  fs.writeFileSync(logPath, log.join('\n'));
  if (!res || res.length === 0) {
    throw new Error(`${parseMSTerm.name}: Parse Failed`);
  }
  return res;
}

interface Descrip {
  '@_type': string;
  '#text'?: string;
}

interface DescripGrp {
  descrip?: Descrip[]; // Multiple descrip entries allowed
}

interface Ntig {
  termGrp: TermGrp;
}

interface TermGrp {
  term: Term;
  termNote?: TermNote[];
}

interface Term {
  '@_id'?: string;
  '#text'?: string;
}

interface TermNote {
  '@_type'?: string;
  '#text'?: string;
}

interface LangSet {
  '@_xml:lang': string;
  ntig?: Ntig[];
  descripGrp?: DescripGrp; // At most one per langSet
}

interface TermEntry {
  id: string;
  langSet?: LangSet[];
}
