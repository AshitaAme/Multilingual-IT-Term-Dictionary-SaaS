import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';

export async function saveTerm(
  userId: string,
  termId: string,
  enrollReview: boolean,
) {
  return await db.transaction(async (tx) => {
    await tx.insert(savedTerms).values({ userId, termId });
    if (enrollReview) await tx.insert(reviewCards).values({ userId, termId });
  });
}
