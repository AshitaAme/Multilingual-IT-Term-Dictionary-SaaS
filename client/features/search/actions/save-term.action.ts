import { getSession } from 'next-auth/react';

export async function saveTermAction(termId: string | undefined) {
  if (!termId || typeof termId !== 'string')
    return { success: false, error: 'Invalid input' };

  const session = await getSession();
  const userId = session?.user.id;

  try {
    saveTerm(termId);
    return { success: true };
  } catch (err) {
    console.error('[saveTermAction] Save term failed: ', err);
    return { success: false, error: 'Save term failed' };
  }
}
