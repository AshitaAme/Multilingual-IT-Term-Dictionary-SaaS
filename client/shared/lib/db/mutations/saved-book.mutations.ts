import { s } from '@upstash/redis';
import { db } from '../db';
import { savedBooks } from '../schemas/dictionary.schema';
import { eq } from 'drizzle-orm';

export async function getSavedBooks(userId: string) {
  const result = await db
    .select({ id: savedBooks.id, name: savedBooks.name })
    .from(savedBooks)
    .where(eq(savedBooks.userId, userId));
  return result;
}

export async function insertSavedBook(name: string, userId: string) {
  const [result] = await db
    .insert(savedBooks)
    .values({ name, userId })
    .returning();
  return result.id;
}

export async function deleteSavedBook(bookId: string) {
  await db.delete(savedBooks).where(eq(savedBooks.id, bookId));
}
