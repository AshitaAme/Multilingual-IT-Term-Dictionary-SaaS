import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createSaveTermSchema = (t: Translator = DEFAULT_TRANSLATOR) =>
  z.object({
    userId: z.string({ required_error: t('termInfo.error.invalidUserId') }),
    termId: z.string({ required_error: t('termInfo.error.invalidTermId') }),
  });

export type SaveTermInput = z.infer<ReturnType<typeof createSaveTermSchema>>;
