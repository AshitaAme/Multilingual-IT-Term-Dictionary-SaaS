'use server';

import { saveTerms as saveTerm } from '../services/save-term';
import {
  createSaveTermSchema,
  SaveTermInput,
} from '../schemas/save-term.schema';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/shared/lib/auth/auth';

export async function saveTermAction(data: SaveTermInput) {
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

  // 3. Zod validation
  const SaveTermSchema = createSaveTermSchema(t);
  const parsed = SaveTermSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.message };
  const payload = parsed.data.map((t) => ({ ...t, userId }));

  // 4. Save term
  try {
    await saveTerm(payload);

    // 4. Success
    return { success: true };
  } catch (err) {
    console.error('[saveTermAction] Save term failed: ', err);
    return { success: false, error: 'Save term failed' };
  }
}
