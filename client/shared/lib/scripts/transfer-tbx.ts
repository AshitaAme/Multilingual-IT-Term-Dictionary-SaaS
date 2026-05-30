import { getSession } from 'next-auth/react';
import { db } from '../db/db';
import { terms } from '../db/schemas/dictionary-schema';
import { ParsedTerm, parseTbx } from './parse-tbx';

export async function transferTbx(filePath: string) {
  const parsedTerms: ParsedTerm[] = parseTbx(filePath);
  const session = await getSession();
  const userId = session?.user.id;
  if (!parsedTerms) return;

  for (const parsedTerm of parsedTerms) {
    const { source, target, targetLang, definition } = parsedTerm;
    const slug = source.trim().toLowerCase().replace(/\s+/g, '-');
    const termPayload = {
      slug,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const termId = await insertTerm(termPayload);
  }
}
