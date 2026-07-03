import { Translator } from '@/shared/types/translator';
import z from 'zod';
import { MAX_SEARCH_LIST_QUERY_LENGTH } from '../constants/search.constants';

export const createSearchListQuerySchema = (t: Translator) =>
  z.object({
    page: z.number(),
    query: z.string().max(MAX_SEARCH_LIST_QUERY_LENGTH, {
      message: t('searchList.error.queryTooLong'),
    }),
    locale: z.string().optional(),
  });

export type SearchListQuery = z.infer<
  ReturnType<typeof createSearchListQuerySchema>
>;
