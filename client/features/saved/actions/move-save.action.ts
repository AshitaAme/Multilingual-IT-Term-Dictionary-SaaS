'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';
import { createMoveSaveSchema, MoveSave } from '../schemas/move-save.schema';
import { getBookIdByTerm } from '../services/get-book-id-by-term';
import { moveSave } from '../services/move-save';

export async function moveSaveActionRaw(t: ServerTranslator, data: MoveSave) {
  // 1. Zod validation
  const MoveSaveSchema = createMoveSaveSchema(t);
  const parsed = MoveSaveSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: t ? t('invalidInput') : 'Invalid input' };

  // 2. Check origin and destination (should not be equal)
  try {
    const bookIds = await getBookIdByTerm(data.ids);
    const res = bookIds.filter(({ bookId }) => bookId === data.moveTo);
    if (res.length !== 0)
      return {
        success: false,
        error: t ? t('sameBookMoveForbidden') : `Cannot move to the same book`,
      };
  } catch (err) {
    console.error('[moveSaveAction] Get book id failed: ', err);
    return {
      success: false,
      error: t ? t('moveSaveFailed') : 'Move saved term failed',
    };
  }

  // 3. Move terms to new book
  try {
    await moveSave(data);

    // 4. Success
    return { success: true };
  } catch (err) {
    console.error('[moveSaveAction] Move saved term failed: ', err);
    return {
      success: false,
      error: t ? t('moveSaveFailed') : 'Move saved term failed',
    };
  }
}

export const moveSaveAction = withTranslations(
  'saved.errors',
  moveSaveActionRaw,
);
