'use server';

import { auth } from '@/shared/lib/auth/auth';
import { getSavedBooks } from '@/shared/lib/db/mutations/saved-book.mutations';

export async function getSavedBooksAction() {
  let userId;
  try {
    const session = await auth();
    userId = session?.user.id;
    if (!userId) return { success: false, error: 'User not found' };
  } catch (err) {
    console.error('[getSavedBooksAction] User not found', err);
    return { success: false, error: 'User not found' };
  }

  try {
    const res = await getSavedBooks(userId);
    return { success: true, data: res };
  } catch (err) {
    console.error('[getSavedBooks] Fetch saved books failed: ', err);
    return { success: false, error: 'Fetch saved books failed' };
  }
}
