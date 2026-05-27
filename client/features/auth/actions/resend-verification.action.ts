'use server';

import { AppError } from '@/shared/errors/errors';
import {
  ResendVerificationInput,
  ResendVerificationSchema,
} from '../schemas/verification';
import { resendVerification } from '../services/resend-verification';

export async function resendVerificationAction(data: ResendVerificationInput) {
  // 1. Zod validation
  const parsed = ResendVerificationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  // 2. Resend verification
  try {
    await resendVerification(parsed.data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Server error, please try again later' };
  }

  // 3.success
  console.log(resendVerificationAction.name, 'success');
  return { success: true };
}
