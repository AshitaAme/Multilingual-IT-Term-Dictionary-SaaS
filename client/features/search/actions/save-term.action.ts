'use server';

import { saveTerm } from '../services/save-term';
import { SaveTermInput, SaveTermSchema } from '../schemas/save-term.schema';

export async function saveTermAction(data: SaveTermInput) {
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
