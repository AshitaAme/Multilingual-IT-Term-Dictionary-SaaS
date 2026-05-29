import { db } from '@/shared/lib/db/db';
import { users } from '@/shared/lib/db/schemas/user-schema';
import { eq } from 'drizzle-orm';

type UserUpdate = typeof users.$inferInsert;

export async function updateUserByEmail(data: UserUpdate) {
  console.log('updateUserByEmail:', data);
  return await db.update(users).set(data).where(eq(users.email, data.email));
}
