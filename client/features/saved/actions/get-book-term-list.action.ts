'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';
import { getBookTermList } from '../services/get-book-term-list';

export async function getBookTermListActionRaw(
  t: ServerTranslator,
  bookId: string,
) {
  // 1. Param validation
  if (!bookId || typeof bookId !== 'string')
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 2. Get book term list
  try {
    const res = await getBookTermList(bookId);

    // 3. Success
    return { success: true, data: res };
  } catch (err) {
    console.error('[getBookTermListAction] Fetch book term list failed: ', err);
    return {
      success: false,
      error: t ? t('getBookTermListFailed') : 'Get book term list failed',
    };
  }
}

export const getBookTermListAction = withTranslations(
  'saved.errors',
  getBookTermListActionRaw,
);
