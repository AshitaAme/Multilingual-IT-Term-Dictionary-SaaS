import { kv } from '@/shared/lib/redis';
import { VerificationInput } from '../schemas/verification';
import { PendingUserSchema } from '../schemas/pending-user';
import { AppError, NotFoundError } from '@/shared/lib/errors';
import { insertUser } from './insert-user';

export async function verifySignup({
  email,
  verificationToken,
}: VerificationInput) {
  // 1. Get pending user from Redis
  const key = `auth:signup:${email}`;
  const pendingUserJSON = await kv.get<unknown>(key);
  const pendingUser = PendingUserSchema.safeParse(pendingUserJSON);

  // 2. Check its existence
  if (!pendingUser.success) {
    throw new NotFoundError('Verification session expired or does not exist');
  }

  // 3. Check if verification token matches
  if (verificationToken != pendingUser.data.verificationToken) {
    throw new AppError('Invalid verification code');
  }

  // 4. Insert data into database
  const userData = {
    email: pendingUser.data.email,
    name: pendingUser.data.name,
    password: pendingUser.data.hashedPassword,
    emailVerified: new Date(),
  };
  await insertUser(userData);

  // 5. Delete pending user in Redis
  await kv.del(key);
}
