'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';
import { createTermTextSchema, TermText } from '../schemas/term-text.schema';
import { updateTermText } from '@/features/search/services/save-term-text';

export async function updateTermTextActionRaw(
  t: ServerTranslator,
  data: TermText,
) {
  // 1. Zod validation
  const termTextSchema = createTermTextSchema(t);
  const parsed = termTextSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { savedTermId, text } = parsed.data;

  // 2. Save term text
  try {
    await updateTermText(savedTermId, text);
    // 3. Success
    return { success: true };
  } catch (err) {
    console.error('[updateTermTextAction] Update term text failed: ', err);
    return {
      success: false,
      error: t ? t('updateTermTextFailed') : 'Update term text failed',
    };
  }
}

export const updateTermTextAction = withTranslations(
  'saved.errors',
  updateTermTextActionRaw,
);
