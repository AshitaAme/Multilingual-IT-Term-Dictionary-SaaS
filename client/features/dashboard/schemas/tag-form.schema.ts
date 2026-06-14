import z from 'zod';

const LangInfoSchema = z.object({
  languageCode: z.string().min(1).max(15),
  name: z.string().min(1).max(15),
});

export const TagFormSchema = z.object({
  slug: z.string().min(1).max(15),
  color: z.string().min(1).max(30),
  langInfos: z
    .array(LangInfoSchema)
    .min(2)
    .refine(
      (items) => {
        const codes = items.map((i) => i.languageCode);
        return new Set(codes).size === codes.length;
      },
      { message: 'languageCode must be unique' },
    ),
});

export type TagFormInput = z.infer<typeof TagFormSchema>;
