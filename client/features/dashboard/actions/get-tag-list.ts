'use server';

import {
  ServerTranslator,
  withTranslations,
} from '@/shared/utils/action-wrappers';
import { getTagList } from '../services/get-tag-list';

async function getTagListActionRaw(t: ServerTranslator) {
  try {
    const res = await getTagList();
    return { success: false, data: res };
  } catch (err) {
    console.warn('[getTagListAction] Get tag list failed: ', err);
    return {
      success: false,
      error: t ? t('getTagListFailed') : 'Get tag list failed',
    };
  }
}

export const getTagListAction = withTranslations(
  'dashboard.error',
  getTagListActionRaw,
);
