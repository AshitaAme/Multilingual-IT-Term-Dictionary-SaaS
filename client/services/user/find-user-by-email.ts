import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function findUserByEmail(email: string) {
  return await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then((res) => res[0]);
}
