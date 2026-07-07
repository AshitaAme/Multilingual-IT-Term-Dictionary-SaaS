import { db } from '../db';
import { savedBooks } from '../schemas/dictionary.schema';
import { count, sql, eq } from 'drizzle-orm';

export async function getSavedBooks(userId: string) {
  const result = await db
    .select({ id: savedBooks.id, name: savedBooks.name })
    .from(savedBooks)
    .where(eq(savedBooks.userId, userId));
  return result;
}
