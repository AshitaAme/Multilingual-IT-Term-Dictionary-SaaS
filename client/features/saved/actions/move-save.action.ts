'use server';

import { createMoveSaveSchema, MoveSave } from '../schemas/move-save.schema';
import { getBookIdByTerm } from '../services/get-book-id-by-term';
import { moveSave } from '../services/move-save';

export async function moveSaveAction(data: MoveSave) {
  const MoveSaveSchema = createMoveSaveSchema();
  const parsed = MoveSaveSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  try {
    const bookIds = await getBookIdByTerm(data.ids);
    const res = bookIds.filter(({ bookId }) => bookId === data.moveTo);
    if (res.length !== 0)
      return { success: false, error: `Can't move to same book` };
  } catch (err) {
    console.error('[moveSaveAction] Validate book id failed: ', err);
    return { success: false, error: 'Move saved term failed' };
  }

  try {
    await moveSave(data);
    return { success: true };
  } catch (err) {
    console.error('[moveSaveAction] Move saved term failed: ', err);
    return { success: false, error: 'Move saved term failed' };
  }
}
