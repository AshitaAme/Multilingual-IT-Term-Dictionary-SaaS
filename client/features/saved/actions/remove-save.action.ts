'use server';

import {
  deleteSavedTerm,
  deleteSavedTermById,
} from '@/shared/lib/db/mutations/saved-term.mutations';
import { StringArraySchema } from '../schemas/string-array.schema';

export async function removeSaveAction(savedTermIds: string[]) {
  const parsed = StringArraySchema.safeParse(savedTermIds);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  try {
    await deleteSavedTermById(savedTermIds);
    return { success: true };
  } catch (error) {
    console.error('[removeSaveAction] Remove saved term failed: ', error);
    return { success: false, error: 'Remove saved term failed' };
  }
}
