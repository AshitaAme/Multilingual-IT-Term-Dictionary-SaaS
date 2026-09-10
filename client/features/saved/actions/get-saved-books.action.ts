'use server';

import { getSavedBooks } from '@/shared/lib/db/mutations/saved-book.mutations';
import { redis } from '@/shared/lib/icons/redis/redis';
import {
  ServerTranslator,
  withAuthAndTranslations,
} from '@/shared/utils/action-wrappers';
import { Session } from 'next-auth';
import { savedBookSchema } from '../schemas/saved-book.schema';

export async function getSavedBooksActionRaw(
  session: Session | null,
  t: ServerTranslator,
) {
  // 1. Check existence of user
  const userId = session?.user.id;
  if (!userId)
    return { success: false, error: t ? t('userNotFound') : 'User not found' };

  // 2. Try redis cache
  const key = `saved:books:${userId}`;
  const cache = await redis.get(key);
  const parsedCache = savedBookSchema.safeParse(cache);
  if (parsedCache.success) {
    return { success: true, data: parsedCache.data };
  } else {
    console.warn(
      '[getSavedBooksAction] Non-existent cache or parse failed: ',
      parsedCache.error.message,
    );
  }

  // 3. Get saved books
  try {
    const res = await getSavedBooks(userId);
    await redis.set(key, res, { ex: 30 * 60 });

    // 4. Success
    return { success: true, data: res };
  } catch (err) {
    console.error('[getSavedBooks] Get saved books failed: ', err);
    return {
      success: false,
      error: t ? t('getSavedBooksFailed') : 'Get saved books failed',
    };
  }
}

export const getSavedBooksAction = withAuthAndTranslations(
  'saved.errors',
  getSavedBooksActionRaw,
);
