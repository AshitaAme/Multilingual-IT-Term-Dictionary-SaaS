import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createSaveTermSchema = (t: Translator = DEFAULT_TRANSLATOR) =>
  z.object({
    termId: z.string({ required_error: t('termInfo.error.invalidTermId') }),
    name: z.string(),
    text: z.string(),
  });

export type SaveTermInput = z.infer<ReturnType<typeof createSaveTermSchema>>;
