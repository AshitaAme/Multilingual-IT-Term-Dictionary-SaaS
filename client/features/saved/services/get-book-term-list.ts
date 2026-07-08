import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedBookTerms,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';
import { eq } from 'drizzle-orm';

export async function getBookTermList(bookId: string) {
  const result = await db
    .select({
      name: savedTerms.name,
      text: savedTerms.text,
      reviewCard: {
        stability: reviewCards.stability,
        difficulty: reviewCards.difficulty,
        state: reviewCards.state,
        step: reviewCards.step,
        nextReviewAt: reviewCards.nextReviewAt,
        lastReviewAt: reviewCards.lastReviewAt,
      },
    })
    .from(savedBookTerms)
    .innerJoin(savedTerms, eq(savedBookTerms.savedTermId, savedTerms.id))
    .leftJoin(reviewCards, eq(reviewCards.savedTermId, savedTerms.id))
    .where(eq(savedBookTerms.savedBookId, bookId));

  return result;
}
