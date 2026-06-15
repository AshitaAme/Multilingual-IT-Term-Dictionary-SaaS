import {
  getTermBySlug,
  upsertTerm,
} from '@/shared/lib/db/mutations/term.mutations';
import { TermFormInput, TermFormSchema } from '../schemas/term-form.schema';
import { insertTermTranslations } from '@/shared/lib/db/mutations/term-translation.mutations';
import { insertTermTags } from '@/shared/lib/db/mutations/term-tag.mutations';

export async function insertTermAction(data: TermFormInput) {
  //1. Zod validation
  const parsed = TermFormSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: '[insertTermAction] Term form data parse failed',
    };

  const { slug, langInfos, tagInfos, status, createdBy } = parsed.data;

  //2. Check existence
  try {
    const term = await getTermBySlug(slug);
    if (term) return { success: false, error: 'Term already exists' };
  } catch (err) {
    console.error('[insertTermAction] Get term failed', err);
    return { success: false, error: 'Get term failed' };
  }

  //3. Insert term
  const termId = crypto.randomUUID();
  const termPayload = {
    id: termId,
    slug: slug,
    status,
    createdBy,
  };
  await upsertTerm(termPayload);

  // 4. Insert language and tag information
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

  // 5. success
  return { success: true };
}
