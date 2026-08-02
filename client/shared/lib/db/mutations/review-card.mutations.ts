import { inArray } from 'drizzle-orm';
import { db } from '../db';
import { reviewCards } from '../schemas/dictionary.schema';

export async function addReview(savedTermIds: string[]) {
  const payload = savedTermIds.map((id) => ({ savedTermId: id }));
  const result = await db
    .insert(reviewCards)
    .values(payload)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteReview(savedTermIds: string[]) {
  await db
    .delete(reviewCards)
    .where(inArray(reviewCards.savedTermId, savedTermIds));
}
