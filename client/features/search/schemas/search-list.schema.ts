import { ServerTranslator } from '@/shared/utils/action-wrappers';
import z from 'zod';

export const createSearchListSchema = (t: ServerTranslator) => {
  const translationSchema = z.object({
    languageCode: z.string(),
    name: z.string(),
    definition: z.string().nullable(),
  });

  const tagSchema = z.object({
    name: z.string(),
    color: z.string(),
  });

  return z.array(
    z.object({
      termId: z.string(),
      displayName: z.string(),
      saved: z.boolean(),
      translations: z.array(translationSchema),
      tags: z.array(tagSchema),
    }),
  );
};

export type SearchList = z.infer<ReturnType<typeof createSearchListSchema>>;
