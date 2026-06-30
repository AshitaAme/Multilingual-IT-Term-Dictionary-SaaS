'use server';

export async function getTagListAction(query: string) {
  if (!query || typeof query !== 'string')
    return { success: false, error: 'Invalid query' };
  try {
    const res = getTagList(query);
    return { success: true, data: res };
  } catch (err) {
    console.error('[getTagListAction] Fetch tag list failed: ', err);
    return { success: false, error: 'Fetch tag list failed' };
  }
}
