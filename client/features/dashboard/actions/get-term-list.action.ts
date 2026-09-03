'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';

async function getTermListActionRaw(t: ServerTranslator, page: number) {
  if (!page || page <= 0)
    return {
      success: false,
      error: t ? t('invalidPageNum') : 'Invalid page number',
    };
  try {
    const res = await getTermList(page);
  } catch (err) {
    console.warn('[getTermListAction] Get term list failed', err);
    return {
      success: false,
      error: t ? t('getTermListFailed') : 'Get term list failed',
    };
  }
}

export const getTermListAction = withTranslations(
  'dashboard.error',
  getTermListActionRaw,
);
