'use server';

import { unsaveTerm } from '../services/unsave-term';
import { getTranslations } from 'next-intl/server';
import {
  createQuerySaveSchema,
  QuerySaveInput,
} from '../schemas/check-save.schema';

export async function unsaveTermAction(data: QuerySaveInput) {
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

  // 3. Unsave term
  try {
    await unsaveTerm(userId, termId);

    // 4. Success
    return { success: true };
  } catch (err) {
    console.error('[unsaveTermAction] Unsave term failed: ', err);
    return { success: false, error: 'Unsave term failed' };
  }
}
