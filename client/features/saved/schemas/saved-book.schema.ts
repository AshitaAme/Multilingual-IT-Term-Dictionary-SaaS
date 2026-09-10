import z from 'zod';

export const savedBookSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
  }),
);
