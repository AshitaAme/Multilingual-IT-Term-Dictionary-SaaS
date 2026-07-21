import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createSaveTermSchema = (t: Translator = DEFAULT_TRANSLATOR) =>
  z
    .array(
      z.object({
        savedBookId: z.string(),
        termId: z.string({ required_error: t('termInfo.error.invalidTermId') }),
        name: z.string(),
        text: z.string(),
      }),
    )
    .min(0, { message: 'Empty list' });

export type SaveTermInput = z.infer<ReturnType<typeof createSaveTermSchema>>;
