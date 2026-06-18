'use server';

import { AUTH_ERRORS } from '@/shared/constants/constants';
import { auth } from '@/shared/lib/auth/auth';
import { getUserById } from '@/shared/lib/db/mutations/user.mutations';

export async function checkAdminAction() {
  try {
    const session = await auth();
    const userId = session?.user.id;
    if (!userId) return { success: false, error: AUTH_ERRORS.AUTH_REQUIRED };

    const user = await getUserById(userId);
    if (user?.role !== 'admin')
      return { success: false, error: AUTH_ERRORS.ADMIN_ONLY };
    console.log('[checkAdminAction] Success: ', user);
    return { success: true, data: { user: session.user } };
  } catch (err) {
    console.error('[checkAdminAction] Session or Role retrieval failed: ', err);
    return { success: false, error: AUTH_ERRORS.AUTH_FAILURE };
  }
}
