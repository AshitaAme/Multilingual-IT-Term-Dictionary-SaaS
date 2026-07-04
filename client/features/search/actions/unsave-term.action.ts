'use server';

import { unsaveTerm } from '../services/unsave-term';
import {
  createSaveTermSchema,
  SaveTermInput,
} from '../schemas/save-term.schema';
import { getTranslations } from 'next-intl/server';

export async function unsaveTermAction(data: SaveTermInput) {
  // 1. Get i18n translator
  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Get i18n translator failed: ', err);
  }

  // 2. Zod validation
  const SaveTermSchema = createSaveTermSchema(t);
  const parsed = SaveTermSchema.safeParse(data);
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
