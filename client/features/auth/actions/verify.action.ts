'use server';

import { VerificationInput, VerificationSchema } from '../schemas/verification';
import { verifySignup } from '../services/verify-signup';
import { AppError } from '@/shared/lib/errors';

export async function verifyAction(data: VerificationInput) {
  // 1. Zod validation
  const parsed = VerificationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: 'Invalid Input' };
  }

  // 2. Verify
  console.log('verify start');
  try {
    await verifySignup(parsed.data);
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }

    console.error(error);
    return { success: false, error: 'Server error, please try again later' };
  }
  console.log('success!');
  return { success: true };
}
