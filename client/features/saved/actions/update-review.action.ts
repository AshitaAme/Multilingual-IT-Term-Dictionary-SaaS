'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';
import {
  createUpdateReviewSchema,
  UpdateReview,
} from '../schemas/update-review.schema';
import { updateReview } from '../services/update-review';

async function updateReviewRaw(t: ServerTranslator, data: UpdateReview) {
  // 1. Zod validation
  const updateReviewSchema = createUpdateReviewSchema(t);
  const parsed = updateReviewSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: t ? parsed.error.message : '' };
  const { savedTermId, rating } = parsed.data;

  // 2. Update Review
  try {
    await updateReview(savedTermId, rating);

    // 3. Success
    return { success: true };
  } catch (err) {
    console.error('[updateReviewAction] Update review failed', err);
    return {
      success: false,
      error: t ? t('updateReviewFailed') : 'Update review failed',
    };
  }
}

export const updateReviewAction = withTranslations(
  'saved.errors',
  updateReviewRaw,
);
