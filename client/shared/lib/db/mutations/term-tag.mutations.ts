import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { termTags } from '../schemas/dictionary.schema';

export async function upsertTermTag(values: { termId: string; tagId: string }) {
  const [result] = await db
    .insert(termTags)
    .values(values)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function deleteTermTag(values: { termId: string; tagId: string }) {
  const [result] = await db
    .delete(termTags)
    .where(
      and(eq(termTags.termId, values.termId), eq(termTags.tagId, values.tagId)),
    )
    .returning();

  return result;
}

export async function replaceTermTags(values: {
  termId: string;
  tagIds: string[];
}) {
  return await db.transaction(async (tx) => {
    await tx.delete(termTags).where(eq(termTags.termId, values.termId));

    if (values.tagIds.length === 0) return [];

    return await tx
      .insert(termTags)
      .values(values.tagIds.map((tagId) => ({ termId: values.termId, tagId })))
      .returning();
  });
}
