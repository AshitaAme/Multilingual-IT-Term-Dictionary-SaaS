import { db } from '../db';
import { termTranslations } from '../schemas/dictionary-schema';

export async function upsertTermTranslation(values: {
  termId: string;
  languageCode: string;
  name: string;
  definition?: string;
  createdBy?: string;
}) {
  const [result] = await db
    .insert(termTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [termTranslations.termId, termTranslations.languageCode],
      set: {
        name: values.name,
        definition: values.definition,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}
