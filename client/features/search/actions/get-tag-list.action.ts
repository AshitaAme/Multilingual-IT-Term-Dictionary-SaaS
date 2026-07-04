'use server';

import { getTagTranslationList as getTagList } from '@/shared/lib/db/mutations/tag-translation.mutations';
import { getLanguageCode } from '@/shared/utils/utils';
import { getLocale } from 'next-intl/server';

export async function getTagListAction() {
  // 1. Get language code
  let locale;
  try {
    locale = await getLocale();
  } catch (err) {
    console.warn('[getTagListAction] Fetch locale failed: ', err);
  }
  const lang = getLanguageCode(locale);

  // 2. Get tag list
  try {
    const res = await getTagList(lang);
    const data = res.map((t) => t.name);

    // 3. Success
    return { success: true, data };
  } catch (err) {
    console.error('[getTagListAction] Fetch tag list failed: ', err);
    return { success: false, error: 'Fetch tag list failed' };
  }
}
