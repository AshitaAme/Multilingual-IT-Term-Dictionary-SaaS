import { ServerTranslator } from '@/shared/utils/action-wrappers';
import z from 'zod';

export const createUpsertBookSchema = (t: ServerTranslator) => {
  return z.object({
    name: z
      .string()
      .max(20, t ? t('bookNameOverLength') : 'Book name is over length (20)'),
    bookId: z.string().min(1, t ? t('invalidBook') : 'Invalid book'),
  });
};

export type UpsertBook = z.infer<ReturnType<typeof createUpsertBookSchema>>;
