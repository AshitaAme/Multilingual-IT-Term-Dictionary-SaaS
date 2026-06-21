import z from 'zod';

export const SearchListQuerySchema = z.object({
  page: z.number(),
  query: z.string().max(30),
});

export type SearchListQuery = z.infer<typeof SearchListQuerySchema>;
