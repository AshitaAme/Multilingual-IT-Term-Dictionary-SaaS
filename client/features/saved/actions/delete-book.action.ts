'use server';

import { deleteSavedBook } from '@/shared/lib/db/mutations/saved-book.mutations';
import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';

async function deleteBookActionRaw(t: ServerTranslator, bookId: string) {
  // 1. Param validation
  if (!bookId || typeof bookId !== 'string')
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 2. Delete saved book
  try {
    await deleteSavedBook(bookId);

    // 3. Success
    return { success: true };
  } catch (err) {
    console.error('[deleteBookAction] Delete book failed', err);
    return {
      success: false,
      error: t ? t('deleteBookFailed') : 'Delete book failed',
    };
  }
}

export const deleteBookAction = withTranslations(
  'saved.errors',
  deleteBookActionRaw,
);
