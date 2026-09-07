'use server';

import { getTagList } from '@/features/dashboard/services/get-tag-list';

export async function getTagListAction() {
  // 1. Get tag list
  try {
    const res = await getTagList();

    // 2. Success
    return { success: true, data: res };
  } catch (err) {
    console.error('[getTagListAction] Fetch tag list failed: ', err);
    return { success: false, error: 'Fetch tag list failed' };
  }
}
