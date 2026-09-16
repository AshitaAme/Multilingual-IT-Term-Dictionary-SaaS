import z from 'zod';

export const TermTextSchema = z.array(
  z.object({
    name: z.string(),
    lang: z.string(),
    def: z.string(),
  }),
);

export const TermTextFormSchema = z.object({
  translations: TermTextSchema,
});

export type TermTextFormInput = z.infer<typeof TermTextFormSchema>;
