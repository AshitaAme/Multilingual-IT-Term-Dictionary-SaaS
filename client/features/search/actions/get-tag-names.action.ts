'use server';

import { getTagTranslationList } from '@/shared/lib/db/mutations/tag-translation.mutations';
import { withLocale } from '@/shared/utils/action-wrappers';

export async function getTagNamesActionRaw(l: string) {
  // 1. Get tag list
  try {
    const res = await getTagTranslationList(l);
    const data = res.map((t) => t.name);

    // 2. Success
    return { success: true, data };
  } catch (err) {
    console.error('[getTagListAction] Fetch tag list failed: ', err);
    return { success: false, error: 'Fetch tag list failed' };
  }
}

export const getTagNamesAction = withLocale(getTagNamesActionRaw);
