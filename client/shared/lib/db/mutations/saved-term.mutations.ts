import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { savedTerms } from '../schemas/dictionary.schema';

export async function getSavedTerm(termId: string, userId: string) {
  const [result] = await db
    .select()
    .from(savedTerms)
    .where(and(eq(savedTerms.termId, termId), eq(savedTerms.termId, userId)));
  return result;
}

export async function saveTerm(termId: string, userId: string) {
  await db.insert(savedTerms).values({ termId, userId });
}

export async function deleteSavedTerm(termId: string, userId: string) {
  await db
    .delete(savedTerms)
    .where(and(eq(savedTerms.termId, termId), eq(savedTerms.userId, userId)));
}
