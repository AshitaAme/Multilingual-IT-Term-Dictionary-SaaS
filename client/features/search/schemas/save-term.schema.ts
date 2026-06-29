import z from 'zod';

export const SaveTermSchema = z.object({
  userId: z.string({ required_error: 'User not found' }),
  termId: z.string({ required_error: 'Term not found' }),
});

export type SaveTermInput = z.infer<typeof SaveTermSchema>;
