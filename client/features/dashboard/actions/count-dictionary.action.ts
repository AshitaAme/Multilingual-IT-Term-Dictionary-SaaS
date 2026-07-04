'use server';

import { countTags } from '@/shared/lib/db/mutations/tag.mutations';
import { getTermCount } from '@/shared/lib/db/mutations/term.mutations';

export async function countDictionary() {
  try {
    const [termCount, tagCount] = await Promise.all([
      getTermCount(),
      countTags(),
    ]);
    return {
      success: true,
      data: { termCount: termCount, tagCount: tagCount },
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(`[${countDictionary}]: ${err.message}`);
      return { success: false, error: 'Count dictionary failed' };
    }

    console.log(`[${countDictionary}]: Unknown error`);
    return { success: false, error: 'Unknown error' };
  }
}
