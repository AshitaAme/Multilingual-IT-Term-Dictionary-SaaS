'use server';

import { addReview } from '@/shared/lib/db/mutations/review-card.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';
import { toReviewCard } from '../types/review-card';

export async function addReviewAction(savedTermIds: string[]) {
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  try {
    const res = await addReview(parsed.data);
    const map = new Map();
    res.forEach((card) => map.set(card.savedTermId, toReviewCard(card)));
    return { success: true, data: map };
  } catch (error) {
    console.error('[addReviewAction] Add review failed: ', error);
    return { success: false, error: 'Add review failed' };
  }
}
