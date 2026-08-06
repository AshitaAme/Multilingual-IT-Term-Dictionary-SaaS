'use server';

import {
  createUpsertBookSchema,
  UpsertBook,
} from '../schemas/upsert-book.schema';
import {
  hasSavedBook,
  upsertSavedBook,
} from '@/shared/lib/db/mutations/saved-book.mutations';
import {
  ServerTranslator,
  withAuthAndTranslations,
} from '@/shared/utils/action-wrappers';
import { Session } from 'next-auth';

export async function upsertBookActionRaw(
  session: Session | null,
  t: ServerTranslator,
  data: UpsertBook,
) {
  // 1. Check existence of user
  const userId = session?.user.id;
  if (!userId)
    return { success: false, error: t ? t('userNotFound') : 'User not found' };

  // 2. Zod validation
  const SavedBookSchema = createUpsertBookSchema(t);
  const parsed = SavedBookSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { name, bookId } = parsed.data;

  // 3. Check existence of book
  try {
    const existent = await hasSavedBook(name, userId);
    if (existent)
      return {
        success: false,
        error: t ? t('bookExists') : 'Book already exists',
      };
  } catch (err) {
    console.error(
      '[upsertSavedBookAction] Check saved book existence failed',
      err,
    );
    return {
      success: false,
      error: t ? t('checkBookFailed') : 'Check saved book existence failed',
    };
  }

  try {
    await upsertSavedBook(name, userId, bookId);
    return { success: true };
  } catch (err) {
    console.error('[upsertSavedBookAction] Upsert saved book failed: ', err);
    return {
      success: false,
      error: t ? t('upsertBookFailed') : 'Upsert saved book failed',
    };
  }
}

export const upsertBookAction = withAuthAndTranslations(
  'saved.errors',
  upsertBookActionRaw,
);
