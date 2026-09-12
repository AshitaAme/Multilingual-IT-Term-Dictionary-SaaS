import z from 'zod';

export const TermTextFormSchema = z.object({
  translations: z.array(
    z.object({
      name: z.string(),
      lang: z.string(),
      def: z.string(),
    }),
  ),
});

export type TermTextFormInput = z.infer<typeof TermTextFormSchema>;
