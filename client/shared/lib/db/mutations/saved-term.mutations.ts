import { eq } from 'drizzle-orm';
import { db } from '../db';
import { savedTerms } from '../schemas/dictionary.schema';

export type SaveTermInput = typeof savedTerms.$inferInsert;

export async function getSavedTerm(termId: string) {
  const [result] = await db
    .select()
    .from(savedTerms)
    .where(eq(savedTerms.termId, termId));
  return result;
}

export async function saveTerm(saveTerm: SaveTermInput) {
  await db.insert(savedTerms).values(saveTerm);
}
