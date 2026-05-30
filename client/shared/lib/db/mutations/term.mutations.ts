import { db } from '../db';
import { terms } from '../schemas/dictionary.schema';

export async function upsertTerm(values: {
  slug: string;
  status?: 'draft' | 'published';
  createdBy?: string;
}) {
  const [term] = await db
    .insert(terms)
    .values(values)
    .onConflictDoUpdate({
      target: terms.slug,
      set: {
        status: values.status,
        updatedAt: new Date(),
      },
    })
    .returning();

  return term;
}
