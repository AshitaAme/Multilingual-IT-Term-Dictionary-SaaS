import { eq, sql } from 'drizzle-orm';
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

export async function replaceTagTranslations({
  tagId,
  inputs,
}: {
  tagId: string;
  inputs: TagTranslationInput[];
}) {
  return await db.transaction(async (tx) => {
    await tx.delete(tagTranslations).where(eq(tagTranslations.tagId, tagId));
    if (inputs.length === 0) return;
    await tx.insert(tagTranslations).values(inputs);
  });
}
