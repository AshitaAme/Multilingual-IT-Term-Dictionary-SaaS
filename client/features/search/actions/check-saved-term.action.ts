'use server';

import { auth } from '@/shared/lib/auth/auth';
import { getSavedTerm } from '@/shared/lib/db/mutations/saved-term.mutations';
import { getTranslations } from 'next-intl/server';

export async function checkSavedTermAction(termId: string) {
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

  // 3. Check saved term
  try {
    const res = await getSavedTerm(userId, termId);

    // 4. Success
    return { success: true, data: res };
  } catch (err) {
    console.error('[checkSaveAction] Check saved term failed: ', err);
    return { success: false, error: 'Check saved term failed failed' };
  }
}
