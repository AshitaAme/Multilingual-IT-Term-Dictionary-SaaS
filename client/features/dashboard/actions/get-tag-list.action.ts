'use server';

import { getTagList } from '../services/get-tag-list';

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
    const data = await getTagList(languageCode.trim());
    return { success: true, data };
  } catch (err) {
    console.error(
      `[getTagListAction] Failed to fetch tags for language [${languageCode}]`,
      err,
    );
    return { success: false, error: 'An unexpected database error occurred' };
  }
}
