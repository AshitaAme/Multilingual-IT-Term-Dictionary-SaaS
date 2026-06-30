'use server';

import { getSavedTerm } from '@/shared/lib/db/mutations/saved-term.mutations';
import { SaveTermInput, SaveTermSchema } from '../schemas/save-term.schema';

export async function checkSavedTermAction(data: SaveTermInput) {
  const parsed = SaveTermSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { userId, termId } = parsed.data;

  try {
    const res = await getSavedTerm(userId, termId);
    console.log(res);
    return { success: true, data: !!res };
  } catch (err) {
    console.error('[checkSaveAction] Check saved term failed: ', err);
    return { success: false, error: 'Check saved term failed failed' };
  }
}
