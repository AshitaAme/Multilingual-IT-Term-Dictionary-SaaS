import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';
import { and, eq } from 'drizzle-orm';

export async function unsaveTerm(userId: string, termId: string) {
  return await db.transaction(async (tx) => {
    await tx
      .delete(savedTerms)
      .where(and(eq(savedTerms.userId, userId), eq(savedTerms.termId, termId)));
    await tx
      .delete(reviewCards)
      .where(
        and(eq(reviewCards.userId, userId), eq(reviewCards.termId, termId)),
      );
  });
}
