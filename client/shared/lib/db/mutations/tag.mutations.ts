import { sql } from 'drizzle-orm';
import { db } from '../db';
import { tags } from '../schemas/dictionary.schema';

export type TagInput = typeof tags.$inferInsert;

export async function upsertTag(values: TagInput) {
  const [result] = await db
    .insert(tags)
    .values(values)
    .onConflictDoUpdate({
      target: tags.slug,
      set: {
        color: values.color,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

export async function upsertTags(values: TagInput[]) {
  const result = await db
    .insert(tags)
    .values(values)
    .onConflictDoUpdate({
      target: tags.slug,
      set: {
        color: sql`excluded.color`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}
