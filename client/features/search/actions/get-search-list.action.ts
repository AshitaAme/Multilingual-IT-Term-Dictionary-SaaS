'use server';

import { getSearchList } from '../services/get-search-list';
import { getTranslations } from 'next-intl/server';
import {
  createSearchListQuerySchema,
  SearchListQuery,
} from '../schemas/search-list-query.schema';
import { getLanguageCode } from '@/shared/utils/utils';

export async function getSearchListAction(data: SearchListQuery) {
  // 1. Zod validation
  const t = await getTranslations('search');
  const SearchListQuerySchema = createSearchListQuerySchema(t);
  const parsed = SearchListQuerySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { page, query } = parsed.data;

  // 3. Get search list
  const languageCode = getLanguageCode(data.locale);
  try {
    const list = await getSearchList(page, languageCode || 'en', query);
    return { success: true, data: list };
  } catch (err) {
    console.error('[getSearchListAction] Term list fetch failed: ', query, err);
    return { success: false, error: 'Items list fetch failed' };
  }
}
