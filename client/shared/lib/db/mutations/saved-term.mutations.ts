import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { savedTerms } from '../schemas/dictionary.schema';

export async function getSavedTerm(userId: string, termId: string) {
  const [result] = await db
    .select()
    .from(savedTerms)
    .where(and(eq(savedTerms.userId, userId), eq(savedTerms.termId, termId)));
  return result;
}

export async function deleteSavedTerm(userId: string, termId: string) {
  await db
    .delete(savedTerms)
    .where(and(eq(savedTerms.userId, userId), eq(savedTerms.termId, termId)));
}
