import { DEFAULT_TRANSLATOR, Translator } from '@/shared/types/translator';
import z from 'zod';

export const createSavedBooksSchema = (t: Translator = DEFAULT_TRANSLATOR) => {
  const SavedTermSchema = z.object({
    id: z.string(),
  });
  return z.object({
    ids: z.array(z.string()),
    savedTerms: z.array(z.string()),
  });
};
