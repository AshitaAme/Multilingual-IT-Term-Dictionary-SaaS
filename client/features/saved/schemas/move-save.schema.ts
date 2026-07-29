import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createMoveSaveSchema = (t: Translator = DEFAULT_TRANSLATOR) => {
  return z.object({
    bookId: z.string().min(1, { message: 'Invalid current book id' }),
    moveTo: z.string().min(1, { message: 'Invalid move-to book id' }),
    ids: z.array(z.string()).min(1, { message: 'Must be over 1 item' }),
  });
};

export type MoveSave = z.infer<ReturnType<typeof createMoveSaveSchema>>;
