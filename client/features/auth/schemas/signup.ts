import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().trim().max(16).min(1, { message: 'Name is required' }),

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
    .max(36),
});

export type SignupInput = z.infer<typeof SignupSchema>;
