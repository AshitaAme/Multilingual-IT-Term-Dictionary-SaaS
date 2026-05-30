import { kv } from '@/shared/lib/redis/redis';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { PendingUserSchema } from '../schemas/pending-user';
import { CredentialsInput } from '../schemas/credentials';
import { sendVerificationEmail } from '@/shared/lib/email/send-verification-email';
import { NotFoundError, RateLimitError } from '@/shared/errors/errors';
import { REDIS_KEYS } from '@/shared/lib/redis/redis-keys';
import { getUserByEmail } from '@/shared/lib/db/mutations/user.mutations';

export async function initiateResetPassword({
  email,
  password: newPassword,
}: CredentialsInput) {
  // 1. Asynchronously get user data from database and redis
  const key = REDIS_KEYS.auth.resetPassword(email);
  const [activeUser, pendingUserJSON] = await Promise.all([
    getUserByEmail(email),
    kv.get<unknown>(key),
  ]);

  // 2. Check database for active user
  if (!activeUser) {
    throw new NotFoundError(`Account doesn't exist`);
  }

  // 3. Check redis for pending user
  const pendingUser = PendingUserSchema.safeParse(pendingUserJSON);
  if (pendingUser.success) {
    // 3.1 As exists, check if the last request is within one minute
    const oneMin = 1000 * 60 * 1;
    if (Date.now() - pendingUser.data.createdAt < oneMin) {
      throw new RateLimitError('Try too often');
    }
  }

  // 4. Create a pending user in redis
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const verificationToken = crypto.randomInt(100000, 1000000).toString();
  const payload = {
    name: activeUser.name,
    email,
    hashedPassword,
    verificationToken,
    createdAt: Date.now(),
  };

  console.log('initiate_reset_password:', payload);

  await kv.set(key, payload, { ex: 600 });

  // 5. Send email verification to the user
  await sendVerificationEmail(email, verificationToken);
}
