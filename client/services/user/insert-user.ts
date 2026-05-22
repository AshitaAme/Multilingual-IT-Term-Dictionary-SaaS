import { db } from '@/db';
import { users } from '@/db/schema';

type UserInsert = typeof users.$inferInsert;

export async function insertUser(data: UserInsert) {
  return await db.insert(users).values(data);
}
