import { ParsedTerm } from '../scripts/transfer-tbx';
/** Preferred tag vocabulary; reused across prompts for consistency */
const PRESET_TAGS = [
  'computerArchitecture',
  'frontend',
  'backend',
  'ai',
  'data',
  'cloudService',
  'git',
  'nextjs',
];

/** Constructs the enrichment prompt for a single term */
export function buildPrompt(term: ParsedTerm): string {
  const defInstruction = term.sourceDefinition
    ? `translate this definition to ${term.targetLang}: "${term.sourceDefinition}"`
    : 'omit this field (do not include it in the response)';

  const lines = [
    'You are a terminology enrichment assistant. Return a JSON object with these fields:',
    `- targetDefinition: ${defInstruction}`,
    `- sourceTags: array of 3-5 tags in ${term.sourceLang} for the term "${term.source}"`,
    `- targetTags: translate sourceTags to ${term.targetLang}`,
    '',
    'Preferred tags (use these when they fit, exact spelling):',
    PRESET_TAGS.join(', '),
    '',
    `Source (${term.sourceLang}): ${term.source}`,
    `Target (${term.targetLang}): ${term.target}`,
    '',
    'Rules:',
    '- Prefer tags from the preferred list above; only add custom tags if none of them fit',
    '- sourceTags and targetTags must be arrays of strings',
    `- All values must be proper ${term.sourceLang}/${term.targetLang}, no placeholders`,
    '- Respond ONLY with raw JSON, no markdown, no extra fields',
  ];

  return lines.join('\n');
}
