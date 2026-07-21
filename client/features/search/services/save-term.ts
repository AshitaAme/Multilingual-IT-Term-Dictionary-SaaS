import { db } from '@/shared/lib/db/db';
import {
  reviewCards,
  savedBookTerms,
  savedTerms,
} from '@/shared/lib/db/schemas/dictionary.schema';

export interface SaveTerm {
  savedTermId: string;
  userId: string;
  savedBookId: string;
  termId: string;
  name: string;
  text: string;
}

export async function saveTerms(data: SaveTerm[]) {
  if (data.length === 0) return;

  return await db.transaction(async (tx) => {
    const savedTermsData = data.map(
      ({ savedTermId, userId, termId, name, text }) => ({
        id: savedTermId,
        userId,
        termId,
        name,
        text,
      }),
    );

    const insertSavedTerms = tx.insert(savedTerms).values(savedTermsData);
    const savedBookTermsData = data.map(({ savedBookId, savedTermId }) => ({
      savedBookId,
      savedTermId,
    }));

    const insertSavedBookTerms = tx
      .insert(savedBookTerms)
      .values(savedBookTermsData);

    const enrollReview = false;
    const reviewCardsData = enrollReview
      ? data.map(({ savedTermId }) => ({
          savedTermId,
        }))
      : [];
    const insertReviewCards = enrollReview
      ? tx.insert(reviewCards).values(reviewCardsData).onConflictDoNothing()
      : Promise.resolve(null);

    await Promise.all([
      insertSavedTerms,
      insertSavedBookTerms,
      insertReviewCards,
    ]);
  });
}
