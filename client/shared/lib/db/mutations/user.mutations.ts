import { db } from '@/shared/lib/db/db';
import { users } from '@/shared/lib/db/schemas/user.schema';
import { eq } from 'drizzle-orm';

export async function getUserByEmail(email: string) {
  return await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then((res) => res[0]);
}
type UserInsert = typeof users.$inferInsert;

export async function insertUser(data: UserInsert) {
  return await db.insert(users).values(data);
}

type UserUpdate = typeof users.$inferInsert;

export async function updateUserByEmail(data: UserUpdate) {
  console.log('updateUserByEmail:', data);
  return await db.update(users).set(data).where(eq(users.email, data.email));
}
