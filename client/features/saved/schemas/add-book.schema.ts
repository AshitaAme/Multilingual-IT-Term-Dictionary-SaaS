import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createAddBookSchema = (t: Translator = DEFAULT_TRANSLATOR) => {
  return z.object({
    name: z.string().max(20, 'Name is too long'),
  });
};

export type AddBook = z.infer<ReturnType<typeof createAddBookSchema>>;
