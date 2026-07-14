'use server';

import { saveTerm } from '../services/save-term';
import {
  createUpsertSaveSchema,
  UpsertSaveInput,
} from '../schemas/save-term.schema';
import { getTranslations } from 'next-intl/server';

export async function saveTermAction(data: UpsertSaveInput) {
  // 1. Get i18n translator
  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Get i18n translator failed: ', err);
  }
  // 2. Zod validation
  const SaveTermSchema = createUpsertSaveSchema(t);
  const parsed = SaveTermSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { userId, termId, name, text } = parsed.data;

  // 3. Save term
  try {
    await saveTerm(userId, termId, name, text);

    // 4. Success
    return { success: true };
  } catch (err) {
    console.error('[saveTermAction] Save term failed: ', err);
    return { success: false, error: 'Save term failed' };
  }
}
