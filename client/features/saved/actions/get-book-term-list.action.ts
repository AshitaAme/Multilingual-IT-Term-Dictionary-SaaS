'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';
import { getBookTermList } from '../services/get-book-term-list';
import { redis } from '@/shared/lib/icons/redis/redis';
import { bookTermListSchema } from '../schemas/book-term-list.schema';

export async function getBookTermListActionRaw(
  t: ServerTranslator,
  bookId: string,
) {
  // 1. Param validation
  if (!bookId || typeof bookId !== 'string')
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 2. Try redis cache
  const key = `saved:bookTermList:${bookId}`;
  const cache = await redis.get(key);
  const parsedCache = bookTermListSchema.safeParse(cache);
  if (parsedCache.success) {
    return { success: true, data: parsedCache.data };
  } else {
    console.warn(
      '[getBookTermListAction] Non-existent cache or parse failed: ',
      parsedCache.error.message,
    );
  }

  // 3. Get book term list
  try {
    const res = await getBookTermList(bookId);
    await redis.set(key, res);

    // 4. Success
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
