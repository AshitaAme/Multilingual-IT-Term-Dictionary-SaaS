import { db } from '../db';
import { tagTranslations } from '../schemas/dictionary.schema';

export async function upsertTagTranslation(values: {
  tagId: string;
  languageCode: string;
  name: string;
}) {
  const [result] = await db
    .insert(tagTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [tagTranslations.tagId, tagTranslations.languageCode],
      set: {
        name: values.name,
      },
    })
    .returning();

  return result;
}
