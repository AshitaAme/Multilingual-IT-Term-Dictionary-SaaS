'use server';

import { getTranslations } from 'next-intl/server';
import {
  createUpsertBookSchema,
  UpsertBook,
} from '../schemas/upsert-book.schema';
import { auth } from '@/shared/lib/auth/auth';
import {
  hasSavedBook,
  upsertSavedBook,
} from '@/shared/lib/db/mutations/saved-book.mutations';

export async function upsertBookAction(data: UpsertBook) {
  let userId;
  try {
    const session = await auth();
    userId = session?.user.id;
    if (!userId) return { success: false, error: 'User not found' };
  } catch (err) {
    console.error('[upsertBookAction] User not found', err);
    return { success: false, error: 'User not found' };
  }

  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Get i18n translator failed: ', err);
  }

  const SavedBookSchema = createUpsertBookSchema(t);
  const parsed = SavedBookSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { name, bookId } = parsed.data;

  try {
    const existent = await hasSavedBook(name, userId);
    if (existent) return { success: false, error: 'Already exists' };
  } catch (err) {
    console.error(
      '[upsertSavedBookAction] Check saved book existence failed',
      err,
    );
    return { success: false, error: 'Check saved book existence failed' };
  }

  try {
    const savedBookId = await upsertSavedBook(name, userId, bookId);
    return { success: true, data: savedBookId };
  } catch (err) {
    console.error('[upsertSavedBookAction] Upsert saved book failed: ', err);
    return { success: false, error: 'Upsert saved book failed' };
  }
}
