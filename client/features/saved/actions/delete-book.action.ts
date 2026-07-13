'use server';

import { deleteSavedBook } from '@/shared/lib/db/mutations/saved-book.mutations';

export async function deleteBookAction(bookId: string) {
  if (!bookId || typeof bookId !== 'string')
    return { success: false, error: 'Invalid input' };

  try {
    await deleteSavedBook(bookId);
    return { success: true };
  } catch (err) {
    console.error('[deleteBookAction] Delete book failed', err);
    return { success: false, error: 'Delete book failed' };
  }
}
