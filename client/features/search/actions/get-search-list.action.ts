'use server';

import { getSearchList } from '../services/get-search-list';
import { getTranslations } from 'next-intl/server';
import {
  createSearchListQuerySchema,
  SearchListQuery,
} from '../schemas/search-list-query.schema';
import { getLanguageCode } from '@/shared/utils/utils';
import { auth } from '@/shared/lib/auth/auth';

export async function getSearchListAction(data: SearchListQuery) {
  // 1. Get i18n translator
  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Fetch i18n translator failed: ', err);
  }

  // 2. Zod validation
  const SearchListQuerySchema = createSearchListQuerySchema(t);
  const parsed = SearchListQuerySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { page, query } = parsed.data;

  // 3. Get language Code
  const languageCode = getLanguageCode(data.locale);

  // 4. Get userId
  let userId;
  try {
    const session = await auth();
    userId = session?.user.id;
  } catch (err) {
    console.warn('[checkSavedTermAction] Fetch userId failed: ', err);
  }

  // 4. Get search list
  const payload = {
    page,
    userLang: languageCode || 'en',
    query,
    userId: userId || '',
  };
  try {
    const list = await getSearchList(payload);

    // 5. Success
    return { success: true, data: list };
  } catch (err) {
    console.error('[getSearchListAction] Term list fetch failed: ', query, err);
    return { success: false, error: 'Items list fetch failed' };
  }
}
