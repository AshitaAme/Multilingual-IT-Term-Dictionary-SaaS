import { db } from '@/shared/lib/db/db';
import { users } from '@/shared/lib/db/schemas/user-schema';

type UserInsert = typeof users.$inferInsert;

export async function insertUser(data: UserInsert) {
  return await db.insert(users).values(data);
}
