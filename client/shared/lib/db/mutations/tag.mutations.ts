import { count, sql, eq } from 'drizzle-orm';
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

export async function insertTags(values: TagInput[]) {
  const result = await db
    .insert(tags)
    .values(values)
    .onConflictDoUpdate({
      target: tags.slug,
      set: {
        slug: sql`${tags.slug}`, // Same value inserted. Use this for returning conflict data.
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

export async function countTags() {
  const result = await db.select({ count: count() }).from(tags);
  return result[0].count;
}

export async function getTagBySlug(slug: string) {
  const result = await db.select().from(tags).where(eq(tags.slug, slug));
  return result[0];
}
