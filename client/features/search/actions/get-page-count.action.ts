'use server';
import { getTermCount } from '@/shared/lib/db/mutations/term.mutations';

export async function getPageCount() {
  try {
    const termCount = await getTermCount();
    const pageCount = termCount / 100 + 1;
    return { success: true, data: pageCount };
  } catch (err) {
    console.error('[getPageCount] Page count fetch failed: ', err);
    return { success: false, error: 'Page count fetch failed' };
  }
}
