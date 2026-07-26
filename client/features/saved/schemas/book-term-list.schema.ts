import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createBookTermListSchema = (
  t: Translator = DEFAULT_TRANSLATOR,
) => {
  return z.object({
    bookId: z.string(),
    query: z.string(),
    page: z.number(),
  });
};

export type BookTermListInput = z.infer<
  ReturnType<typeof createBookTermListSchema>
>;
