'use server';

import { CredentialsInput, CredentialsSchema } from '../schemas/credentials';
import { initiateSignup } from '../services/initiate-signup';
import { AppError } from '@/shared/errors/errors';

export async function initiateSignupAction(data: CredentialsInput) {
  // 1. Zod validation
  const parsed = CredentialsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid Input' };
  }

  // 1.1 Name in schema is optional, so deal with it here
  if (!parsed.data.name) {
    return { success: false, error: 'Name is required' };
  }

  // 2. Initiate Signup
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
