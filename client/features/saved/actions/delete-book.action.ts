'use server';

import { deleteSavedBook } from '@/shared/lib/db/mutations/saved-book.mutations';
import {
  ServerTranslator,
  withTranslations,
} from '@/shared/lib/i18n/server-translations';

async function deleteBookActionRaw(t: ServerTranslator, bookId: string) {
  if (!bookId || typeof bookId !== 'string')
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  try {
    await deleteSavedBook(bookId);
    return { success: true };
  } catch (err) {
    console.error('[deleteBookAction] Delete book failed', err);
    return {
      success: false,
      error: t ? t('deleteFailed') : 'Delete book failed',
    };
  }
}

// 导出包装后的 action
export const deleteBookAction = withTranslations(
  'saved.errors',
  deleteBookActionRaw,
);
