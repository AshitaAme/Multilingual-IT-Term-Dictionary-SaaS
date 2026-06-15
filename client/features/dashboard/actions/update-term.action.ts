import { upsertTerm } from '@/shared/lib/db/mutations/term.mutations';
import { TermFormInput, TermFormSchema } from '../schemas/term-form.schema';
import { replaceTermTranslations } from '@/shared/lib/db/mutations/term-translation.mutations';
import { replaceTermTags } from '@/shared/lib/db/mutations/term-tag.mutations';
import { checkAdminAction } from '@/features/auth';

export async function updateTermAction(data: TermFormInput) {
  // 1. Check role
  const res = await checkAdminAction();
  if (!res.success) return res;

  // 2. Zod validation
  const parsed = TermFormSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: 'Term form data parse failed',
    };

  const { slug, langInfos, tagInfos, status } = parsed.data;

  // 3. Update term
  const termPayload = {
    slug,
    status,
  };

  let termId;
  try {
    const res = await upsertTerm(termPayload);
    termId = res.id;
  } catch (err) {
    console.error(`[updateTermAction] Term update failed`, err);
    return { success: false, error: 'Term update failed' };
  }

  // 4. Update language and tag information
  const termTranslationPayload = {
    termId,
    inputs: langInfos.map((langInfo) => ({
      ...langInfo,
      termId,
    })),
  };

  const termTagPayload = {
    termId,
    inputs: tagInfos.map((tagInfo) => ({
      termId,
      tagId: tagInfo.tagId,
    })),
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

  // 5. success
  return { success: true };
}
