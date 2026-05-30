import { getSession } from 'next-auth/react';
import { ParsedTerm, parseTbx } from './parse-tbx';
import { upsertTerm } from '../db/mutations/term.mutations';
import { upsertTermTranslation } from '../db/mutations/term-translation.mutations';
import { AICleanTerm, CleanedTerm } from '../ai/AI-enrich-term';

interface TermPayload {
  slug: string;
  createdBy: string;
}

interface TermTranslationPayload {
  termId: string;
  languageCode: string;
  name: string;
  definition: string;
  createdBy: string;
}

interface tagPayload {
  slug: string;
  color: string;
}

interface tagTranslationPayload {
  tagId: string;
  languageCode: string;
  name: string;
}

interface termTagPayload {
  termId: string;
  tagId: string;
}

export async function transferTbx(filePath: string) {
  const parsedTerms: ParsedTerm[] = parseTbx(filePath);
  const CleanedTerms: CleanedTerm[] = await AICleanTerm(parsedTerms);
  const session = await getSession();
  const userId = session?.user.id;
  if (!parsedTerms) return;
}
