import {
  getTagBySlug,
  upsertTag,
} from '@/shared/lib/db/mutations/tag.mutations';
import { TagFormInput, TagFormSchema } from '../schemas/tag-form.schema';
import { insertTagTranslations } from '@/shared/lib/db/mutations/tag-translation.mutations';
import { checkAdminAction } from '@/features/auth';

export async function insertTagAction(data: TagFormInput) {
  // 1. Check role of user
  const res = await checkAdminAction();
  if (!res.success) return res;

  // 2. Zod validation
  const parsed = TagFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: 'Tag form data parse failed' };
  const { slug, color, langInfos } = parsed.data;

  // 3. Check existence
  const tag = await getTagBySlug(slug);
  if (!tag) return { success: false, error: 'Tag already exists' };

  // 4. Insert tag
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

  // 5. Insert tag language information
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

  // 6. Success
  return { success: true };
}
