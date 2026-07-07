'use server';

import { getSavedBooks } from '@/shared/lib/db/mutations/saved-book.mutations';

export async function getSavedBooksAction(userId: string) {
  if (!userId || typeof userId !== 'string')
    return { success: false, error: 'User not found' };

  try {
    const res = await getSavedBooks(userId);
    return { success: true, data: res };
  } catch (err) {
    console.error('[getSavedBooks] Fetch saved books failed: ', err);
    return { success: false, error: 'Fetch saved books failed' };
  }
}
