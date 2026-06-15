import { upsertTag } from '@/shared/lib/db/mutations/tag.mutations';
import { TagFormInput, TagFormSchema } from '../schemas/tag-form.schema';
import { replaceTagTranslations } from '@/shared/lib/db/mutations/tag-translation.mutations';

export async function updateTagAction(data: TagFormInput) {
  //1. Zod validation
  const parsed = TagFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: 'Tag form parse failed' };

  // 2. Update tag
  const { slug, color, langInfos } = parsed.data;
  const tagPayload = {
    slug,
    color,
  };

  let tagId;
  try {
    const res = await upsertTag(tagPayload);
    tagId = res.id;
  } catch (err) {
    console.error('[updateTagAction] Tag update failed: ', err);
    return { success: false, error: 'Tag update failed' };
  }

  // 3. Update tag language information
  const tagTranslationPayload = {
    tagId,
    inputs: langInfos.map((langInfo) => ({
      tagId,
      ...langInfo,
    })),
  };

  try {
    await replaceTagTranslations(tagTranslationPayload);
  } catch (err) {
    console.error(
      '[updateTagAction] Tag language information update failed: ',
      err,
    );
    return { success: false, error: 'Tag language information update failed' };
  }

  // 4. Success
  return { success: true };
}
