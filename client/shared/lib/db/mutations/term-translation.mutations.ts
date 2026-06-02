import { sql } from 'drizzle-orm';
import { db } from '../db';
import { termTranslations } from '../schemas/dictionary.schema';

export type TermTranslationInput = typeof termTranslations.$inferInsert;

export async function insertTermTranslations(values: TermTranslationInput[]) {
  await db.insert(termTranslations).values(values).onConflictDoNothing();
}

export async function upsertTermTranslation(values: TermTranslationInput) {
  await db
    .insert(termTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [termTranslations.termId, termTranslations.languageCode],
      set: {
        name: values.name,
        definition: values.definition,
        updatedAt: new Date(),
      },
    });
}

export async function upsertTermTranslations(values: TermTranslationInput[]) {
  await db
    .insert(termTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [termTranslations.termId, termTranslations.languageCode],
      set: {
        name: sql`excluded.name`,
        definition: sql`excluded.definition`,
        updatedAt: new Date(),
      },
    });
}
