import { z } from 'zod';

export const CredentialsSchema = z.object({
  name: z
    .string()
    .trim()
    .max(16)
    .min(1, { message: 'Name is required' })
    .optional(), // Optional, so that sign in form could use

  email: z
    .string()
    .email({
      message: 'Invalid email format',
    })
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, {
      message: 'Password must be at least 6 characters',
    })
    .max(36, {
      message: 'Password must be at most 36 characters',
    }),
});

export type CredentialsInput = z.infer<typeof CredentialsSchema>;
