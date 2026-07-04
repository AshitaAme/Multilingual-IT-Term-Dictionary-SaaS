'use server';

import { getTagTranslationList } from '@/shared/lib/db/mutations/tag-translation.mutations';

export async function getTagListAction(languageCode: string) {
  if (
    !languageCode ||
    typeof languageCode !== 'string' ||
    !languageCode.trim()
  ) {
    return { success: false, error: 'Invalid or missing language code' };
  }

  if (languageCode.length > 35) {
    return { success: false, error: 'Language code is too long' };
  }

  try {
    const data = await getTagTranslationList(languageCode.trim());
    return { success: true, data };
  } catch (err) {
    console.error(
      `[getTagListAction] Failed to fetch tags for language [${languageCode}]`,
      err,
    );
    return { success: false, error: 'An unexpected database error occurred' };
  }
}
