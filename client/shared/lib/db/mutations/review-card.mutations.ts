import { db } from '../db';
import { reviewCards } from '../schemas/dictionary.schema';

export async function addReview(savedTermIds: string[]) {
  const payload = savedTermIds.map((id) => ({ savedTermId: id }));
  await db.insert(reviewCards).values(payload);
}
