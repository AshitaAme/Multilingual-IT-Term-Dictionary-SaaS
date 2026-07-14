'use server';

import { hasSavedTerm } from '@/shared/lib/db/mutations/saved-term.mutations';
import { getTranslations } from 'next-intl/server';
import {
  QuerySaveInput,
  createQuerySaveSchema,
} from '../schemas/check-save.schema';

export async function checkSavedTermAction(data: QuerySaveInput) {
  // 1. Get i18n translator
  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Get i18n translator failed: ', err);
  }

  // 2. Zod validation
  const QuerySaveSchema = createQuerySaveSchema(t);
  const parsed = QuerySaveSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { userId, termId } = parsed.data;

  // 3. Check saved term
  try {
    const res = await hasSavedTerm(userId, termId);

    // 4. Success
    return { success: true, data: res };
  } catch (err) {
    console.error('[checkSaveAction] Check saved term failed: ', err);
    return { success: false, error: 'Check saved term failed failed' };
  }
}
