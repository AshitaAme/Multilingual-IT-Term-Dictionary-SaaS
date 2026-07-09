import { getTranslations } from 'next-intl/server';
import { createAddBookSchema, AddBook } from '../schemas/saved-book.schema';
import { insertSavedBook } from '@/shared/lib/db/mutations/saved-book.mutations';

export async function addBookAction(data: AddBook) {
  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Get i18n translator failed: ', err);
  }

  const SavedBookSchema = createAddBookSchema(t);
  const parsed = SavedBookSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { name, userId } = parsed.data;

  try {
    const savedBookId = await insertSavedBook(name, userId);
    return { success: true, data: savedBookId };
  } catch (err) {
    console.error('[addSavedBookAction] Add saved book failed: ', err);
    return { success: false, error: 'Add saved book failed' };
  }
}
