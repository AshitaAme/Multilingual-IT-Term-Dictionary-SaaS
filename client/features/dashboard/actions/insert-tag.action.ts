import {
  getTagBySlug,
  upsertTag,
} from '@/shared/lib/db/mutations/tag.mutations';
import { TagFormInput, TagFormSchema } from '../schemas/tag-form.schema';
import { insertTagTranslations } from '@/shared/lib/db/mutations/tag-translation.mutations';

export async function insertTagAction(data: TagFormInput) {
  //1. Zod validation
  const parsed = TagFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: 'Tag form data parse failed' };
  const { slug, color, langInfos } = parsed.data;

  //2. Check existence
  const res = await getTagBySlug(slug);
  if (!res) return { success: false, error: 'Tag already exists' };

  //3. Insert tag
  const tagId = crypto.randomUUID();
  const tagPayload = {
    id: tagId,
    slug,
    color,
  };

  try {
    await upsertTag(tagPayload);
  } catch (err) {
    console.error('[insertTagAction] Tag insert failed: ', err);
    return { success: false, error: 'Tag insert failed' };
  }

  //4. Insert tag language information
  const tagTranslationPayload = langInfos.map((langInfo) => ({
    tagId,
    ...langInfo,
  }));

  try {
    await insertTagTranslations(tagTranslationPayload);
  } catch (err) {
    console.error(
      '[insertTagAction} Tag language information insert failed: ',
      err,
    );
    return {
      success: false,
      error: 'Tag language information insert failed',
      err,
    };
  }

  //5. Success
  return { success: true };
}
