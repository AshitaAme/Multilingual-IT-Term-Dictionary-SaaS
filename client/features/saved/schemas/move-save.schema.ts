import { ServerTranslator } from '@/shared/utils/action-wrappers';
import z from 'zod';

export const createMoveSaveSchema = (t: ServerTranslator) => {
  return z.object({
    moveTo: z
      .string()
      .min(1, { message: t ? t('invalidBook') : 'Invalid book' }),
    ids: z
      .array(z.string())
      .min(1, { message: t ? t('selectEmpty') : 'Must select over 1 item' }),
  });
};

export type MoveSave = z.infer<ReturnType<typeof createMoveSaveSchema>>;
