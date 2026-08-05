'use server';

import { getSavedBooks } from '@/shared/lib/db/mutations/saved-book.mutations';
import {
  Translator,
  withAuthAndTranslations,
} from '@/shared/utils/action-wrappers';
import { Session } from 'next-auth';

export async function getSavedBooksActionRaw(
  session: Session | null,
  t: Translator,
) {
  const userId = session?.user.id;
  if (!userId)
    return { success: false, error: t ? t('userNotFound') : 'User not found' };
  try {
    const res = await getSavedBooks(userId);
    return { success: true, data: res };
  } catch (err) {
    console.error('[getSavedBooks] Get saved books failed: ', err);
    return {
      success: false,
      error: t ? t('getSavedBooksFailed') : 'Get saved books failed',
    };
  }
}

export const getSavedBooksAction = withAuthAndTranslations(
  'saved.errors',
  getSavedBooksActionRaw,
);
