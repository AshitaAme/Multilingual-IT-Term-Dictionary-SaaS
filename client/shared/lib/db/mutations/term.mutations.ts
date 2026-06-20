import { sql, count, eq } from 'drizzle-orm';
import { db } from '../db';
import { terms } from '../schemas/dictionary.schema';

export type TermInput = typeof terms.$inferInsert;

export async function upsertTerm(values: TermInput) {
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

export async function insertTerms(values: TermInput[]) {
  const term = await db
    .insert(terms)
    .values(values)
    .onConflictDoUpdate({
      target: terms.slug,
      set: {
        slug: sql`${terms.slug}`, // Same value inserted. Use this for returning conflict data.
      },
    })
    .returning();

  return term;
}

export async function upsertTerms(values: TermInput[]) {
  const term = await db
    .insert(terms)
    .values(values)
    .onConflictDoUpdate({
      target: terms.slug,
      set: {
        status: sql`excluded.status`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return term;
}

export async function getTermCount() {
  const result = await db.select({ count: count() }).from(terms);
  return result[0].count;
}

export async function getTermBySlug(slug: string) {
  const result = await db.select().from(terms).where(eq(terms.slug, slug));
  return result[0];
}
