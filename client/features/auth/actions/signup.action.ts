'use server';

import { SignupInput, SignupSchema } from '../schemas/signup';
import { initiateSignup } from '../services/initiate-signup';
import { AppError } from '@/shared/lib/errors';

export async function signupAction(data: SignupInput) {
  // 1. Zod validation
  const parsed = SignupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid Input' };
  }

  // 2. Database operations
  try {
    await initiateSignup(parsed.data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }

    console.error(error);
    return { success: false, error: 'Server error, please try again later' };
  }

  // 3. Success
  return { success: true };
}
