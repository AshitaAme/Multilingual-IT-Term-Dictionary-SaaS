'use server';

import { deleteReview } from '@/shared/lib/db/mutations/review-card.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';
import { Translator, withTranslations } from '@/shared/utils/action-wrappers';

export async function deleteReviewActionRaw(
  t: Translator,
  savedTermIds: string[],
) {
  // 1. Zod validation
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success)
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 2. Delete review
  try {
    await deleteReview(savedTermIds);

    // 3. Success
    return { success: true };
  } catch (error) {
    console.error('[deleteReview] Delete review failed: ', error);
    return {
      success: true,
      error: t ? t('deleteReviewFailed') : 'Delete review failed',
    };
  }
}

export const deleteReviewAction = withTranslations(
  'saved.errors',
  deleteReviewActionRaw,
);
