'use server';

import { getLanguageCode } from '@/shared/utils/utils';
import { getSearchList } from '../services/get-search-list';
import { getLocale } from 'next-intl/server';
import {
  SearchListQuery,
  SearchListQuerySchema,
} from '../schemas/search-list-query.schema';

export async function getSearchListAction(data: SearchListQuery) {
  // 1. Zod validation
  const parsed = SearchListQuerySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid input' };
  const { page, query } = parsed.data;

  // 2. Get language code
  let languageCode;
  try {
    const locale = await getLocale();
    languageCode = getLanguageCode(locale);
  } catch (err) {
    console.warn('[getSearchListAction] Locale fetch failed: ', err);
  }

  // 3. Get search list
  try {
    const list = await getSearchList(page, languageCode || 'en', query);
    return { success: true, data: list };
  } catch (err) {
    console.error('[getSearchListAction] Term list fetch failed: ', query, err);
    return { success: false, error: 'Items list fetch failed' };
  }
}
