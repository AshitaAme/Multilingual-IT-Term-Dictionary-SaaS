'use server';

import { getTranslations } from 'next-intl/server';
import { createAddBookSchema, AddBook } from '../schemas/add-book.schema';
import { insertSavedBook } from '@/shared/lib/db/mutations/saved-book.mutations';
import { auth } from '@/shared/lib/auth/auth';

export async function addBookAction(data: AddBook) {
  let userId;
  try {
    const session = await auth();
    userId = session?.user.id;
    if (!userId) return { success: false, error: 'User not found' };
  } catch (err) {
    console.error('[addBookAction] User not found', err);
    return { success: false, error: 'User not found' };
  }

  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Get i18n translator failed: ', err);
  }

  const SavedBookSchema = createAddBookSchema(t);
  const parsed = SavedBookSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { name } = parsed.data;

  try {
    const savedBookId = await insertSavedBook(name, userId);
    return { success: true, data: savedBookId };
  } catch (err) {
    console.error('[addSavedBookAction] Add saved book failed: ', err);
    return { success: false, error: 'Add saved book failed' };
  }
}
