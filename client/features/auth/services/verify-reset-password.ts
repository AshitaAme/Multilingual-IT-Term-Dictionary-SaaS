import { kv } from '@/shared/lib/icons/redis/redis';
import { VerificationInput } from '../schemas/verification';
import { PendingUserSchema } from '../schemas/pending-user';
import { AppError, NotFoundError } from '@/shared/errors/errors';
import { REDIS_KEYS } from '@/shared/lib/icons/redis/redis-keys';
import { updateUserByEmail } from '@/shared/lib/db/mutations/user.mutations';

export async function verifyResetPassword({
  email,
  verificationToken,
}: VerificationInput) {
  // 1. Get pending user from Redis
  const key = REDIS_KEYS.auth.resetPassword(email);
  const pendingUserJSON = await kv.get<unknown>(key);
  const pendingUser = PendingUserSchema.safeParse(pendingUserJSON);

  console.log('verify-reset-password:pendingUser:', pendingUser);

  // 2. Check its existence
  if (!pendingUser.success) {
    throw new NotFoundError(`Code expired or doesn't exist`);
  }

  console.log(
    'verify-reset-password:',
    verificationToken != pendingUser.data.verificationToken,
  );
  // 3. Check if verification token matches
  if (verificationToken != pendingUser.data.verificationToken) {
    throw new AppError('Invalid verification code');
  }

  // 4. Insert data into database
  const userData = {
    email: pendingUser.data.email,
    password: pendingUser.data.hashedPassword,
  };
  await updateUserByEmail(userData);

  // 5. Delete pending user in Redis
  await kv.del(key);
}
