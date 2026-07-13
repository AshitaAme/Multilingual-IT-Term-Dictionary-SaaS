import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createUpsertBookSchema = (t: Translator = DEFAULT_TRANSLATOR) => {
  return z.object({
    name: z.string().max(20, 'Name is too long'),
    bookId: z.string().min(1),
  });
};

export type UpsertBook = z.infer<ReturnType<typeof createUpsertBookSchema>>;
