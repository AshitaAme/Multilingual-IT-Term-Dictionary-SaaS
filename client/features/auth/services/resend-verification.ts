import { REDIS_KEYS } from '@/shared/lib/icons/redis/redis-keys';
import { PendingUserSchema } from '../schemas/pending-user';
import { kv } from '@/shared/lib/icons/redis/redis';
import { NotFoundError, RateLimitError } from '@/shared/errors/errors';
import crypto from 'node:crypto';
import { sendVerificationEmail } from '@/shared/lib/email/send-verification-email';
import { ResendVerificationInput } from '../schemas/verification';

export async function resendVerification({ email }: ResendVerificationInput) {
  // 1. Get last verification request from Redis
  const key = REDIS_KEYS.auth.resetPassword(email);
  const pendingUserJSON = await kv.get<unknown>(key);
  const pendingUser = PendingUserSchema.safeParse(pendingUserJSON);

  // 2. Check existence
  if (!pendingUser.success) {
    throw new NotFoundError(`Code expired or doesn't exist`);
  }

  // 3. Check time interval
  const oneMin = 1000 * 60 * 1;
  if (Date.now() - pendingUser.data.createdAt < oneMin) {
    throw new RateLimitError('Try too often');
  }

  // 4. Create new verification info
  const newVerificationToken = crypto.randomInt(100000, 1000000).toString();

  const newPayload = {
    ...pendingUser.data,
    verificationToken: newVerificationToken,
    createdAt: Date.now(),
  };

  // 5. Set new verification info to Redis
  await kv.set(key, newPayload, { ex: 600 });

  // 6. Resend email
  await sendVerificationEmail(email, newVerificationToken);
}
