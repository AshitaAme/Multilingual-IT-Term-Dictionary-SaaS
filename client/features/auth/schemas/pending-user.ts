import z from 'zod';

export const PendingUserSchema = z.object({
  name: z.string().trim().max(16).min(1),
  email: z.string().email().toLowerCase().trim(),
  hashedPassword: z.string(),
  verificationToken: z.string(),
  createdAt: z.number(),
});

export type PendingUser = z.infer<typeof PendingUserSchema>;
