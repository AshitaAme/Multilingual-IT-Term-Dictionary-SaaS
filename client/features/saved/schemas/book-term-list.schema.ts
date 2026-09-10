import z from 'zod';

export const bookTermListSchema = z.array(
  z.object({
    name: z.string(),
    text: z.string(),
    savedTermId: z.string(),
    reviewCard: z
      .object({
        stability: z.number(),
        difficulty: z.number(),
        state: z.string(),
        step: z.number(),
        nextReviewAt: z.coerce.date(),
        lastReviewAt: z.coerce.date().nullable(),
      })
      .nullable(),
  }),
);
