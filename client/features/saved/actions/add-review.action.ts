'use server';

import { addReview } from '@/shared/lib/db/mutations/review-card.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';
import { toReviewCard } from '../types/review-card';
import { getTranslations } from 'next-intl/server';

export async function addReviewAction(savedTermIds: string[]) {
  // 1. Get i18n Translator
  let t;
  try {
    t = await getTranslations('saved.errors');
  } catch (err) {
    console.warn('Fetch translator failed: ', err);
  }

  // 2. Zod validation
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success)
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 3. Add review
  try {
    const res = await addReview(parsed.data);

    // 4. Map reviewCard to savedTermId
    const map = new Map();
    res.forEach((card) => map.set(card.savedTermId, toReviewCard(card)));

    // 5. Success
    return { success: true, data: map };
  } catch (error) {
    console.error('[addReviewAction] Add review failed: ', error);
    return {
      success: false,
      error: t ? t('addReviewFailed') : 'Add review failed',
    };
  }
}
