'use server';

import { addReview } from '@/shared/lib/db/mutations/review-card.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';
import { toReviewCard } from '../types/review-card';
import { Translator, withTranslations } from '@/shared/utils/action-wrappers';

export async function addReviewActionRaw(
  t: Translator,
  savedTermIds: string[],
) {
  // 1. Zod validation
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success)
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 2. Add review
  try {
    const res = await addReview(parsed.data);

    // 3. Map reviewCard to savedTermId
    const map = new Map();
    res.forEach((card) => map.set(card.savedTermId, toReviewCard(card)));

    // 4. Success
    return { success: true, data: map };
  } catch (error) {
    console.error('[addReviewAction] Add review failed: ', error);
    return {
      success: false,
      error: t ? t('addReviewFailed') : 'Add review failed',
    };
  }
}

export const addReviewAction = withTranslations(
  'saved.errors',
  addReviewActionRaw,
);
