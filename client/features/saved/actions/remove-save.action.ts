'use server';

import { deleteSavedTermById } from '@/shared/lib/db/mutations/saved-term.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';
import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';

export async function removeSaveActionRaw(
  t: ServerTranslator,
  savedTermIds: string[],
) {
  // 1. Zod validation
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success)
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 2. Delete saved term
  try {
    await deleteSavedTermById(savedTermIds);

    // 3. Success
    return { success: true };
  } catch (error) {
    console.error('[removeSaveAction] Remove saved term failed: ', error);
    return {
      success: false,
      error: t ? t('removeSaveFailed') : 'Remove saved term failed',
    };
  }
}

export const removeSaveAction = withTranslations(
  'saved.errors',
  removeSaveActionRaw,
);
