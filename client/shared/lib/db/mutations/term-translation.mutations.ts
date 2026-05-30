import { db } from '../db';
import { termTranslations } from '../schemas/dictionary.schema';

type upsertTermTranslationInput = typeof termTranslations.$inferInsert;

export async function upsertTermTranslation(
  values: upsertTermTranslationInput,
) {
  await db
    .insert(termTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [termTranslations.termId, termTranslations.languageCode],
      set: {
        name: values.name,
        definition: values.definition,
        updatedAt: values.updatedAt,
      },
    });
}
