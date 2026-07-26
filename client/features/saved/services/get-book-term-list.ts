import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedBookTerms,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';
import { eq, asc, desc, ilike, and } from 'drizzle-orm';
import { BookTermListInput } from '../schemas/book-term-list.schema';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';

export async function getBookTermList(data: BookTermListInput) {
  const { bookId, query, page } = data;

  const result = await db
    .select({
      name: savedTerms.name,
      text: savedTerms.text,
      termId: savedTerms.termId,
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
    .where(
      and(
        eq(savedBookTerms.savedBookId, bookId),
        query ? ilike(savedTerms.name, query) : undefined,
      ),
    )
    .offset((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .orderBy(desc(savedTerms.createdAt));

  return result;
}
