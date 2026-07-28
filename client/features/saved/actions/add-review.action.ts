'use server';

import { addReview } from '@/shared/lib/db/mutations/review-card.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';

export async function addReviewAction(savedTermIds: string[]) {
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  try {
    await addReview(parsed.data);
  } catch (error) {
    console.error('[addReviewAction] Add review failed: ', error);
    return { success: false, error: '[addReviewAction] Add review failed' };
  }
}
