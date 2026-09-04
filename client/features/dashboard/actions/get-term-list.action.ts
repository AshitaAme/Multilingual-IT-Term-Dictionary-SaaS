'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';
import { getTermList } from '../services/get-term-list';
import {
  createTermListQuerySchema,
  TermListQuery,
} from '../schemas/term-list-query.schema';

async function getTermListActionRaw(t: ServerTranslator, data: TermListQuery) {
  // 1. Zod validation
  const termListQuerySchema = createTermListQuerySchema(t);
  const parsed = termListQuerySchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };
  const { page, query } = parsed.data;

  // 2. Get term list
  try {
    const res = await getTermList(page, query);

    // 3. Success
    return { success: true, data: res };
  } catch (err) {
    console.warn('[getTermListAction] Get term list failed', err);
    return {
      success: false,
      error: t ? t('getTermListFailed') : 'Get term list failed',
    };
  }
}

export const getTermListAction = withTranslations(
  'dashboard.error',
  getTermListActionRaw,
);
