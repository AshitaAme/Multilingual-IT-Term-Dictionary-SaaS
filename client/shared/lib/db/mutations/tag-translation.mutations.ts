import { sql } from 'drizzle-orm';
import { db } from '../db';
import { tagTranslations } from '../schemas/dictionary.schema';

export type TagTranslationInput = typeof tagTranslations.$inferInsert;

export async function insertTagTranslations(values: TagTranslationInput[]) {
  await db.insert(tagTranslations).values(values).onConflictDoNothing();
}

export async function upsertTagTranslation(values: TagTranslationInput) {
  await db
    .insert(tagTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [tagTranslations.tagId, tagTranslations.languageCode],
      set: {
        name: values.name,
      },
    })
    .returning();
}

export async function upsertTagTranslations(values: TagTranslationInput[]) {
  await db
    .insert(tagTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [tagTranslations.tagId, tagTranslations.languageCode],
      set: {
        name: sql`excluded.name`,
      },
    });
}
