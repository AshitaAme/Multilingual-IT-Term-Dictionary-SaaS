import { ServerTranslator } from '@/shared/utils/action-wrappers';
import z from 'zod';

export const createUpdateReviewSchema = (t: ServerTranslator) => {
  return z.object({
    savedTermId: z.string().min(1, t ? t('invalidTermId') : ''),
    rating: z
      .number({
        required_error: t ? t('ratingRequired') : '',
        invalid_type_error: t ? t('invalidRating') : '',
      })
      .int()
      .min(1, t ? t('invalidRating') : '')
      .max(4, t ? t('invalidRating') : ''),
  });
};

export type UpdateReview = z.infer<ReturnType<typeof createUpdateReviewSchema>>;
