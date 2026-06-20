'use server';

import { getLanguageCode } from '@/shared/utils/utils';
import { getSearchList } from '../services/get-search-list';
import { getLocale } from 'next-intl/server';

export async function getSearchListAction(page: number) {
  // 1. Parameter validation
  if (!Number.isInteger(page) || page < 1)
    return { success: false, error: 'Invalid input' };

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
    const list = await getSearchList(page, languageCode || 'en');
    return { success: true, data: list };
  } catch (err) {
    console.error('[getTermListAction] Term list fetch failed: ', err);
    return { success: false, error: 'Term list fetch failed' };
  }
}
