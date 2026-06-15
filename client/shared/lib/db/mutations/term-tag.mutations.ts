import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { termTags } from '../schemas/dictionary.schema';

export type TermTagInput = typeof termTags.$inferInsert;

export async function insertTermTag(values: TermTagInput) {
  await db.insert(termTags).values(values);
}

export async function insertTermTags(values: TermTagInput[]) {
  await db.insert(termTags).values(values);
}

export async function deleteTermTag(values: TermTagInput) {
  await db
    .delete(termTags)
    .where(
      and(eq(termTags.termId, values.termId), eq(termTags.tagId, values.tagId)),
    )
    .returning();
}

export async function replaceTermTags({
  termId,
  inputs,
}: {
  termId: string;
  inputs: TermTagInput[];
}) {
  return await db.transaction(async (tx) => {
    await tx.delete(termTags).where(eq(termTags.termId, termId));

    if (inputs.length === 0) return [];

    return await tx.insert(termTags).values(inputs).returning();
  });
}
