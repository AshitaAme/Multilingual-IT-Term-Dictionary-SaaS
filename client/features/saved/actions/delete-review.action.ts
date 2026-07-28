'use server';

import { deleteReview } from '@/shared/lib/db/mutations/review-card.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';

export async function deleteReviewAction(savedTermIds: string[]) {
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  try {
    await deleteReview(savedTermIds);
    return { success: true };
  } catch (error) {
    console.error('[deleteReview] Delete review failed: ', error);
    return { success: true, error: 'Delete review failed' };
  }
}
