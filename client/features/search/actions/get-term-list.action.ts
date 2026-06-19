'use server';

import { getTermList } from '@/shared/lib/db/mutations/term-translation.mutations';

export async function getTermListAction(page: number) {
  if (!Number.isInteger(page) || page < 1)
    return { success: false, error: 'Invalid input' };
  try {
    const list = await getTermList(page);
    return { success: true, data: list };
  } catch (err) {
    console.error('[getTermListAction] Term list fetch failed: ', err);
    return { success: false, error: 'Term list fetch failed' };
  }
}
