'use server';

import { AppError } from '@/shared/lib/errors';
import { CredentialsInput, CredentialsSchema } from '../schemas/credentials';
import { initiateResetPassword } from '../services/initiate-reset-password';

export async function initiateResetPasswordAction(data: CredentialsInput) {
  // 1. Zod validation
  const parsed = CredentialsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid Input' };
  }

  // 2. Initiate ResetPassword
  try {
    console.log('reset_password_action:', parsed.data);
    await initiateResetPassword(parsed.data);
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
