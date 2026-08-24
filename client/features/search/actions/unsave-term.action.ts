'use server';

import { getTranslations } from 'next-intl/server';
import { auth } from '@/shared/lib/auth/auth';
import { deleteSavedTerm } from '@/shared/lib/db/mutations/saved-term.mutations';

export async function unsaveTermAction(termId: string) {
  // 1. Get userId
  let userId;
  try {
    const session = await auth();
    userId = session?.user.id;
    if (!userId) return { success: false, error: 'User not found' };
  } catch (err) {
    console.error('[saveTermAction] Get user id failed:', err);
    return { success: false, error: 'User not found' };
  }

  // 2. Get i18n translator
  let t;
  try {
    t = await getTranslations('search');
  } catch (err) {
    console.warn('[checkSavedTermAction] Get i18n translator failed: ', err);
  }

  // 3. Unsave term
  try {
    await deleteSavedTerm(userId, termId);

    // 4. Success
    return { success: true };
  } catch (err) {
    console.error('[unsaveTermAction] Unsave term failed: ', err);
    return { success: false, error: 'Unsave term failed' };
  }
}
