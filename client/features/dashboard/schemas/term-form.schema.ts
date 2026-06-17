import z from 'zod';

const LangInfoSchema = z.object({
  languageCode: z.string().min(1, { message: 'Language code is required.' }),
  name: z
    .string()
    .min(1, { message: 'Language name cannot be empty.' })
    .max(30, { message: 'Language name cannot exceed 30 characters.' }),
  definition: z
    .string()
    .min(1, { message: 'Definition cannot be empty.' })
    .max(100, { message: 'Definition cannot exceed 100 characters.' }),
});

const TagInfoSchema = z.object({
  tagId: z.string().min(1, { message: 'Tag cannot be empty.' }),
  name: z.string(),
});

export const TermFormSchema = z.object({
  slug: z.string().min(1, { message: 'Slug is required.' }),
  tagInfos: z
    .array(TagInfoSchema)
    .min(1, { message: 'At least one tag is required.' }),
  // FIX: Pass the schema object directly, do not wrap it in z.object() again
  langInfos: z
    .array(LangInfoSchema)
    .min(2, { message: 'At least one language definition is required.' })
    .refine(
      (items) => {
        const codes = items.map((i) => i.languageCode);
        return new Set(codes).size === codes.length;
      },
      { message: 'Language code must be unique' },
    ),
  status: z.enum(['published', 'draft']),
});

// TypeScript type inference
export type TermFormInput = z.infer<typeof TermFormSchema>;
export type TagInfoInput = z.infer<typeof TagInfoSchema>;
