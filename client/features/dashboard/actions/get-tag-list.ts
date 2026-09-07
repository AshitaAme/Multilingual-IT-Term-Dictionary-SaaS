'use server';

import { ServerTranslator } from '@/shared/utils/action-wrappers';

async function getTagListActionRaw(t: ServerTranslator) {
  try {
    const res = await getTagListAction();
  } catch (err) {
    console.warn('[getTagListAction] Get tag list failed: ', err);
    return {
      success: false,
      error: t ? t('getTagListFailed') : 'Get tag list failed',
    };
  }
}
