'use server';

import { getBookTermList } from '../services/get-book-term-list';

export async function getBookTermListAction(bookId: string) {
  if (!bookId || typeof bookId !== 'string')
    return { success: false, error: 'Book not found' };

  try {
    const res = await getBookTermList(bookId);

    return { success: true, data: res };
  } catch (err) {
    console.error('[getBookTermListAction] Fetch book term list failed: ', err);
    return { success: false, error: 'Fetch book term list failed' };
  }
}
