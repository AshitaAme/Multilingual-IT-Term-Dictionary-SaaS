'use server';

import {
  getTermBySlug,
  upsertTerm,
} from '@/shared/lib/db/mutations/term.mutations';
import { TermFormInput, TermFormSchema } from '../schemas/term-form.schema';
import { insertTermTranslations } from '@/shared/lib/db/mutations/term-translation.mutations';
import { insertTermTags } from '@/shared/lib/db/mutations/term-tag.mutations';
import { checkAdminAction } from '@/features/auth';

export async function insertTermAction(data: TermFormInput) {
  // 1. Check role
  const res = await checkAdminAction();
  if (!res.success) return res;

  // 2. Zod validation
  const parsed = TermFormSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: '[insertTermAction] Term form data parse failed',
    };

  const { slug, langInfos, tagInfos, status } = parsed.data;

  // 3. Check existence
  try {
    const term = await getTermBySlug(slug);
    if (term) return { success: false, error: 'Term already exists' };
  } catch (err) {
    console.error('[insertTermAction] Get term failed', err);
    return { success: false, error: 'Get term failed' };
  }

  // 4. Insert term
  const termId = crypto.randomUUID();
  const termPayload = {
    id: termId,
    slug: slug,
    status,
    createdBy: res.data?.user.id,
  };
  await upsertTerm(termPayload);

  // 5. Insert language and tag information
  const termTranslationPayload = langInfos.map((langInfo) => ({
    termId,
    ...langInfo,
  }));

  const termTagPayload = tagInfos.map((tagInfo) => ({
    termId: termId,
    tagId: tagInfo.tagId,
  }));

  try {
    await Promise.all([
      insertTermTranslations(termTranslationPayload),
      insertTermTags(termTagPayload),
    ]);
  } catch (err) {
    console.error(`[updateTermAction] failed`, err);
    return {
      success: false,
      error: 'Language or tag information update failed',
    };
  }

  // 6. success
  return { success: true };
}
