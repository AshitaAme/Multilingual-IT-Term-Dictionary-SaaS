'use server';

import { getSearchList } from '../services/get-search-list';
import {
  createSearchListQuerySchema,
  SearchListQuery,
} from '../schemas/search-list-query.schema';
import {
  ServerTranslator,
  withAuthAndLocaleAndTranslations,
} from '@/shared/utils/action-wrappers';
import { Session } from 'next-auth';
import { redis } from '@/shared/lib/icons/redis/redis';
import { createSearchListSchema } from '../schemas/search-list.schema';

export async function getSearchListActionRaw(
  session: Session | null,
  l: string,
  t: ServerTranslator,
  data: SearchListQuery,
) {
  // 1. Zod validation
  const searchListQuerySchema = createSearchListQuerySchema(t);
  const parsed = searchListQuerySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { page, query } = parsed.data;

  // 2. Prepare params
  const payload = {
    page,
    userLang: l,
    query,
    userId: session?.user.id || '',
  };

  // 3. Try redis cache
  const key = `search:list:${JSON.stringify(payload)}`;
  const cache = await redis.get(key);
  const searchListSchema = createSearchListSchema(t);
  const cacheParsed = searchListSchema.safeParse(cache);
  if (cacheParsed.success) {
    const cachedList = cacheParsed.data;
    return { success: true, data: cachedList };
  } else {
    console.warn(
      '[getSearchListAction] Non-existent redis cache or parse failed: ',
      cacheParsed.error.message,
    );
  }

  // 4. Get list from db
  try {
    const list = await getSearchList(payload);
    const ttlSec = 30 * 60;
    await redis.set(key, list, { ex: ttlSec });

    // 5. Success
    return { success: true, data: list };
  } catch (err) {
    console.error('[getSearchListAction] Term list fetch failed: ', query, err);
    return { success: false, error: 'Items list fetch failed' };
  }
}

export const getSearchListAction = withAuthAndLocaleAndTranslations(
  'search.errors',
  getSearchListActionRaw,
);
