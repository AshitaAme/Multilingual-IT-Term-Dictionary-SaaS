import { db } from '../db';
import { savedBooks } from '../schemas/dictionary.schema';
import { and, count, eq } from 'drizzle-orm';

export async function hasSavedBook(name: string, userId: string) {
  const [result] = await db
    .select({ total: count() })
    .from(savedBooks)
    .where(and(eq(savedBooks.name, name), eq(savedBooks.userId, userId)));
  return result.total >= 1;
}

export async function getSavedBooks(userId: string) {
  const result = await db
    .select({ id: savedBooks.id, name: savedBooks.name })
    .from(savedBooks)
    .where(eq(savedBooks.userId, userId));
  return result;
}

export async function upsertSavedBook(
  name: string,
  userId: string,
  bookId: string,
) {
  const [result] = await db
    .insert(savedBooks)
    .values({ id: bookId, name, userId })
    .onConflictDoUpdate({
      target: [savedBooks.id],
      set: {
        name,
      },
    })
    .returning();
  return result.id;
}

export async function deleteSavedBook(bookId: string) {
  await db.delete(savedBooks).where(eq(savedBooks.id, bookId));
}
