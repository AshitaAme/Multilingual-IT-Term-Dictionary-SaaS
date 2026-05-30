import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { savedTerms } from '../schemas/dictionary-schema';

export async function upsertSavedTerm(values: {
  userId: string;
  termId: string;
}) {
  const [result] = await db
    .insert(savedTerms)
    .values(values)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function deleteSavedTerm(values: {
  userId: string;
  termId: string;
}) {
  const [result] = await db
    .delete(savedTerms)
    .where(
      and(
        eq(savedTerms.userId, values.userId),
        eq(savedTerms.termId, values.termId),
      ),
    )
    .returning();

  return result;
}
