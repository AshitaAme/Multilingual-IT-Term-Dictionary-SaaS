import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedBookTerms,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';

export interface SaveTerm {
  userId: string;
  savedBookId: string;
  termId: string;
  name: string;
  text: string;
}

export async function saveTerms(data: SaveTerm[]) {
  if (data.length === 0) return;

  return await db.transaction(async (tx) => {
    // 1. Insert saved terms
    const savedTermsData = data.map(({ userId, termId, name, text }) => ({
      userId,
      termId,
      name,
      text,
    }));
    const savedTermList = await tx
      .insert(savedTerms)
      .values(savedTermsData)
      .returning();

    // 2. Relate saved terms and saved book
    const savedBookId = data[0].savedBookId;
    const savedBookTermsData = savedTermList.map((t) => ({
      savedBookId,
      savedTermId: t.id,
    }));
    const insertSavedBookTerms = tx
      .insert(savedBookTerms)
      .values(savedBookTermsData);

    // 3. Enroll Review
    const enrollReview = false;
    const reviewCardsData = enrollReview
      ? savedTermList.map((t) => ({ savedTermId: t.id }))
      : [];
    const insertReviewCards = enrollReview
      ? tx.insert(reviewCards).values(reviewCardsData).onConflictDoNothing()
      : Promise.resolve(null);

    await Promise.all([insertSavedBookTerms, insertReviewCards]);
  });
}
