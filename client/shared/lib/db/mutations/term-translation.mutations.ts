import { eq, sql, asc, gt } from 'drizzle-orm';
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

export async function replaceTermTranslations({
  termId,
  inputs,
}: {
  termId: string;
  inputs: TermTranslationInput[];
}) {
  return await db.transaction(async (tx) => {
    await tx
      .delete(termTranslations)
      .where(eq(termTranslations.termId, termId));

    if (inputs.length === 0) return [];

    await tx.insert(termTranslations).values(inputs);
  });
}

export async function getTermList(page: number) {
  const results = await db
    .select({
      termId: termTranslations.termId,
      languageCode: termTranslations.languageCode,
      name: termTranslations.name,
    })
    .from(termTranslations)
    .orderBy(asc(termTranslations.termId))
    .limit(100)
    .offset((page - 1) * 100);
  return results;
}
