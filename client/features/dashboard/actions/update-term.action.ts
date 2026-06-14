import { upsertTerm } from '@/shared/lib/db/mutations/term.mutations';
import { TermFormInput, TermFormSchema } from '../schemas/term-form.schema';
import { replaceTermTranslations } from '@/shared/lib/db/mutations/term-translation.mutations';
import { replaceTermTags } from '@/shared/lib/db/mutations/term-tag.mutations';

export async function updateTermAction(data: TermFormInput) {
  // 1. Zod validation
  const parsed = TermFormSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: 'Term form data parse failed',
    };

  const { slug, langInfos, tagInfos, status } = parsed.data;

  // 2. Update term
  const termId = crypto.randomUUID();
  const termPayload = {
    id: termId,
    slug,
    status,
  };

  try {
    await upsertTerm(termPayload);
  } catch (err) {
    console.error(`[updateTermAction] Term update failed`, err);
    return { success: false, error: 'Term update failed' };
  }

  // 3. Update language and tag information
  const termTranslationPayload = {
    termId,
    inputs: langInfos.map((langInfo) => ({
      ...langInfo,
      termId,
    })),
  };

  const termTagPayload = {
    termId,
    tagIds: tagInfos.map((tagInfo) => tagInfo.tagId),
  };

  try {
    await Promise.all([
      replaceTermTranslations(termTranslationPayload),
      replaceTermTags(termTagPayload),
    ]);
  } catch (err) {
    console.error(`[updateTermAction] failed`, err);
    return {
      success: false,
      error: 'Language or tag information update failed',
    };
  }

  // 4. success
  return { success: true };
}
