import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';

type InsertSavedTerm = typeof savedTerms.$inferInsert;

export async function saveTerms(data: InsertSavedTerm[]) {
  return await db.transaction(async (tx) => {
    const [result] = await tx.insert(savedTerms).values(data).returning();

    const enrollReview = true;
    if (enrollReview) {
      await tx.insert(reviewCards).values({ savedTermId: result.id });
    }
  });
}
