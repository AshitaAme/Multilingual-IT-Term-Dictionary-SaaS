'use server';

import {
  BookTermListInput,
  createBookTermListSchema,
} from '../schemas/book-term-list.schema';
import { getBookTermList } from '../services/get-book-term-list';

export async function getBookTermListAction(data: BookTermListInput) {
  const BookTermListSchema = createBookTermListSchema();
  const parsed = BookTermListSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const res = await getBookTermList(parsed.data);

    return { success: true, data: res };
  } catch (err) {
    console.error('[getBookTermListAction] Fetch book term list failed: ', err);
    return { success: false, error: 'Fetch book term list failed' };
  }
}
