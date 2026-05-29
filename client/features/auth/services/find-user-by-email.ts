import { db } from '@/shared/lib/db/db';
import { users } from '@/shared/lib/db/schemas/user-schema';
import { eq } from 'drizzle-orm';

export async function findUserByEmail(email: string) {
  return await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then((res) => res[0]);
}
