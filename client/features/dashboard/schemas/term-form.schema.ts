import z from 'zod';

export const LangInfoSchema = z.object({
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

export const TermFormSchema = z.object({
  slug: z.string().min(1, { message: 'Slug is required.' }),
  tagIds: z
    .array(z.string().min(1, { message: 'Tag cannot be empty.' }))
    .min(1, { message: 'At least one tag is required.' }),
  // FIX: Pass the schema object directly, do not wrap it in z.object() again
  langInfos: z
    .array(LangInfoSchema)
    .min(2, { message: 'At least one language definition is required.' }),
});

// TypeScript type inference
export type TermFormInput = z.infer<typeof TermFormSchema>;
