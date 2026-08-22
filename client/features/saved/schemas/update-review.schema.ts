import { ServerTranslator } from '@/shared/utils/action-wrappers';
import z from 'zod';

export const createUpdateReviewSchema = (t: ServerTranslator) => {
  return z.object({
    savedTermId: z.string().min(1, t ? t('validation.required') : ''),
    rating: z
      .number({
        required_error: t ? t('validation.required') : '',
        invalid_type_error: t ? t('validation.invalidType') : '',
      })
      .int()
      .min(1, t ? t('validation.ratingRange') : '')
      .max(4, t ? t('validation.ratingRange') : ''),
  });
};

export type UpdateReview = z.infer<ReturnType<typeof createUpdateReviewSchema>>;
