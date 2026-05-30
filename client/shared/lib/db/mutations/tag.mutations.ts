import { db } from '../db';
import { tags } from '../schemas/dictionary-schema';

export async function upsertTag(values: { slug: string; color?: string }) {
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
