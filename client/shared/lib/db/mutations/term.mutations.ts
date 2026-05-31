import { sql } from 'drizzle-orm';
import { db } from '../db';
import { terms } from '../schemas/dictionary.schema';

export type TermInput = typeof terms.$inferInsert;

export async function TermInput(values: TermInput) {
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
