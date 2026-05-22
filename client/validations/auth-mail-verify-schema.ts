import { z } from 'zod';

export const authMailVerifySchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),

  verificationCode: z
    .string()
    .length(6, { message: 'Code must be 6 digits' })
    .regex(/^\d+$/, { message: 'Verification code must contain only numbers' }),
});

export type AuthMailVerifyInput = z.infer<typeof authMailVerifySchema>;
