import { ServerTranslator } from '@/shared/utils/action-wrappers';
import z from 'zod';

export const createTermListQuerySchema = (t: ServerTranslator) => {
  return z.object({
    page: z.number().int(),
    query: z.string(),
  });
};

export type TermListQuery = z.infer<
  ReturnType<typeof createTermListQuerySchema>
>;
