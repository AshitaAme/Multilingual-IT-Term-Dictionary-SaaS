'use server';

import { saveTerm } from '../services/save-term';
import {
  createSaveTermSchema,
  SaveTermInput,
} from '../schemas/save-term.schema';
import { getTranslations } from 'next-intl/server';

export async function saveTermAction(data: SaveTermInput) {
  const t = await getTranslations('search');
  const SaveTermSchema = createSaveTermSchema(t);
  const parsed = SaveTermSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { userId, termId } = parsed.data;

  try {
    await saveTerm(userId, termId, true);
    return { success: true };
  } catch (err) {
    console.error('[saveTermAction] Save term failed: ', err);
    return { success: false, error: 'Save term failed' };
  }
}
