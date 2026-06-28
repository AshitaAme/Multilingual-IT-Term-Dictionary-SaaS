'use server';

import { auth } from '@/shared/lib/auth/auth';
import { deleteSavedTerm } from '@/shared/lib/db/mutations/saved-term.mutations';

export async function unsaveTermAction(termId: string | undefined) {
  if (!termId || typeof termId !== 'string')
    return { success: false, error: 'Invalid input' };

  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return { success: false, error: 'User not found' };

  try {
    await deleteSavedTerm(termId, userId);
    return { success: true };
  } catch (err) {
    console.error('[unsaveTermAction] Unsave term failed: ', err);
    return { success: false, error: 'Unsave term failed' };
  }
}
