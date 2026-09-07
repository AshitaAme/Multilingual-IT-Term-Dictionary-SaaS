import { db } from '@/shared/lib/db/db';
import {
  tags,
  tagTranslations,
} from '@/shared/lib/db/schemas/dictionary.schema';
import { inArray } from 'drizzle-orm';
import { TagFormInput } from '../schemas/tag-form.schema';
import { mapGetOrInsert } from '@/shared/utils/utils';

export async function getTagList() {
  const tagListRaw = await db
    .select({ slug: tags.slug, color: tags.color, id: tags.id })
    .from(tags);

  const tagMap = new Map<string, [string, string]>(); // tagId, [slug, color]
  const tagIds = tagListRaw.map((t) => {
    tagMap.set(t.id, [t.slug, t.color]);
    return t.id;
  });

  const tagListMap = new Map<string, TagFormInput>();
  const tagTranslationList = await db
    .select()
    .from(tagTranslations)
    .where(inArray(tagTranslations.tagId, tagIds));

  tagTranslationList.forEach((t) => {
    const { tagId, languageCode, name } = t;
    const [slug, color] = tagMap.get(tagId)!;
    const item = mapGetOrInsert(tagListMap, tagId, {
      slug,
      color,
      langInfoList: [],
    });
    item.langInfoList.push({ languageCode, name });
  });

  return tagIds.map((tagId) => {
    const [slug, color] = tagMap.get(tagId)!;
    const item = mapGetOrInsert(tagListMap, tagId, {
      slug,
      color,
      langInfoList: [],
    });
    return item;
  });
}
