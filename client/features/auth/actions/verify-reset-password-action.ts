'use server';

import { VerificationInput, VerificationSchema } from '../schemas/verification';
import { AppError } from '@/shared/lib/errors';
import { verifyResetPassword } from '../services/verify-reset-password';

export async function verifyResetPasswordAction(data: VerificationInput) {
  // 1. Zod validation
  const parsed = VerificationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: 'Invalid Input' };
  }

  // 2. Verify
  console.log('verify start');
  try {
    await verifyResetPassword(parsed.data);
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }

    console.error(error);
    return { success: false, error: 'Server error, please try again later' };
  }

  // 3. Success
  console.log('success!');
  return { success: true };
}
