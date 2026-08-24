'use server';

import { getSavedBooks } from '@/shared/lib/db/mutations/saved-book.mutations';
import {
  ServerTranslator,
  withAuthAndTranslations,
} from '@/shared/utils/action-wrappers';
import { Session } from 'next-auth';

export async function getSavedBooksActionRaw(
  session: Session | null,
  t: ServerTranslator,
) {
  // 1. Check existence of user
  const userId = session?.user.id;
  if (!userId)
    return { success: false, error: t ? t('userNotFound') : 'User not found' };

  // 2. Get saved books
  try {
    const res = await getSavedBooks(userId);

    // 3. Success
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
