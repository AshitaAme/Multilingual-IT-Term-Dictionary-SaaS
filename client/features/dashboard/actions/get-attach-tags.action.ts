'use server';

import { getTagTranslationList } from '@/shared/lib/db/mutations/tag-translation.mutations';
import { withLocale } from '@/shared/utils/action-wrappers';

async function getAttachTagsActionRaw(l: string) {
  try {
    const data = await getTagTranslationList(l);
    return { success: true, data };
  } catch (err) {
    console.error(
      `[getTagListAction] Failed to fetch tags for language [${l}]`,
      err,
    );
    return { success: false, error: 'An unexpected database error occurred' };
  }
}

export const getAttachTagsAction = withLocale(getAttachTagsActionRaw);
