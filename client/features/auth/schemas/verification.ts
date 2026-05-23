import { z } from 'zod';

export const VerificationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),

  verificationToken: z
    .string()
    .length(6, { message: 'Code must be 6 digits' })
    .regex(/^\d+$/, { message: 'Verification code must contain only numbers' }),
});

export type VerificationInput = z.infer<typeof VerificationSchema>;
