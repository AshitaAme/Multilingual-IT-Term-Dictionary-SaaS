import { db } from '@/shared/lib/db/db';
import { tagTranslations } from '@/shared/lib/db/schemas/dictionary.schema';
import { asc, eq } from 'drizzle-orm';

export async function getTagList(languageCode: string) {
  const list = await db
    .select({
      tagId: tagTranslations.tagId,
      name: tagTranslations.name,
      languageCode: tagTranslations.languageCode,
    })
    .from(tagTranslations)
    .where(eq(tagTranslations.languageCode, languageCode))
    .orderBy(asc(tagTranslations.name));
  return list;
}
