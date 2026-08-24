import { ServerTranslator } from '@/shared/utils/action-wrappers';
import z from 'zod';

export const createTermTextSchema = (t: ServerTranslator) => {
  return z.object({
    savedTermId: z.string(),
    text: z.string().max(1000, {
      message: t ? t('textOverLength') : 'Text is over length (1000)',
    }),
  });
};

export type TermText = z.infer<ReturnType<typeof createTermTextSchema>>;
