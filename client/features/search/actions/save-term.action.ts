'use server';

import { auth } from '@/shared/lib/auth/auth';
import { saveTerm } from '../services/save-term';

export async function saveTermAction(termId: string | undefined) {
  if (!termId || typeof termId !== 'string')
    return { success: false, error: 'Invalid input' };

  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return { success: false, error: 'User not found' };

  try {
    await saveTerm(userId, termId, true);
    return { success: true };
  } catch (err) {
    console.error('[saveTermAction] Save term failed: ', err);
    return { success: false, error: 'Save term failed' };
  }
}
