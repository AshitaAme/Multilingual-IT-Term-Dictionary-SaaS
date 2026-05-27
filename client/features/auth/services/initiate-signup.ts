import { kv } from '@/shared/lib/redis/redis';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { PendingUserSchema } from '../schemas/pending-user';
import { findUserByEmail } from './find-user-by-email';
import { CredentialsInput } from '../schemas/credentials';
import { sendVerificationEmail } from '../../../shared/lib/email/send-verification-email';
import { ConflictError, RateLimitError } from '@/shared/errors/errors';

export async function initiateSignup({
  name,
  email,
  password,
}: CredentialsInput) {
  // 1. Asynchronously get user data from database and redis
  const key = `auth:signup:${email}`;
  const [activeUser, pendingUserJSON] = await Promise.all([
    findUserByEmail(email),
    kv.get<unknown>(key),
  ]);

  // 2. Check database for active user
  if (activeUser) {
    throw new ConflictError('Account already exists');
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
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomInt(100000, 1000000).toString();
  const payload = {
    name,
    email,
    hashedPassword,
    verificationToken,
    createdAt: Date.now(),
  };

  await kv.set(key, payload, { ex: 600 });

  // 5. Send email verification to the user
  await sendVerificationEmail(email, verificationToken);
}
