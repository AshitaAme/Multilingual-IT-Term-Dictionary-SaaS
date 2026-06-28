'use server';

import { getSavedTerm } from '@/shared/lib/db/mutations/saved-term.mutations';

export async function checkSavedTermAction(termId: string | undefined) {
  if (!termId || typeof termId !== 'string')
    return { success: false, error: 'Invalid input' };

  try {
    const res = await getSavedTerm(termId);
    return { success: true, data: !!res };
  } catch (err) {
    console.error('[checkSaveAction] Check saved term failed: ', err);
    return { success: false, error: 'Check saved term failed failed' };
  }
}
