'use server';

import { unsaveTerm } from '../services/unsave-term';
import { SaveTermInput, SaveTermSchema } from '../schemas/save-term.schema';

export async function unsaveTermAction(data: SaveTermInput) {
  const parsed = SaveTermSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const { userId, termId } = parsed.data;
  try {
    await unsaveTerm(userId, termId);
    return { success: true };
  } catch (err) {
    console.error('[unsaveTermAction] Unsave term failed: ', err);
    return { success: false, error: 'Unsave term failed' };
  }
}
