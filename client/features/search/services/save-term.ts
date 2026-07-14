import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';

export async function saveTerm(
  userId: string,
  termId: string,
  name: string,
  text: string,
) {
  return await db.transaction(async (tx) => {
    const [result] = await tx
      .insert(savedTerms)
      .values({ userId, termId, name, text })
      .returning();

    const enrollReview = true;
    if (enrollReview) {
      await tx.insert(reviewCards).values({ savedTermId: result.id });
    }
  });
}
