import { db } from '@/shared/lib/db/db';
import { users } from '@/shared/lib/db/schema';
import { eq } from 'drizzle-orm';

type UserUpdate = typeof users.$inferInsert;

export async function updateUser(id: string, data: UserUpdate) {
  return await db.update(users).set(data).where(eq(users.id, id));
}
