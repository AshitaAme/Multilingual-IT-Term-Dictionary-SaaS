import z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createTermFormSchema = (t: Translator) => {
  const LangInfoSchema = z.object({
    languageCode: z
      .string()
      .min(1, { message: t('termForm.error.languageCodeRequired') }),
    name: z
      .string()
      .min(1, { message: t('termForm.error.nameRequired') })
      .max(30, { message: t('termForm.error.nameTooLong') }),
    definition: z
      .string()
      .min(1, { message: t('termForm.error.definitionRequired') })
      .max(200, { message: t('termForm.error.definitionTooLong') }),
  });

  const TagInfoSchema = z.object({
    tagId: z.string().min(1, { message: t('termForm.error.tagRequired') }),
    name: z.string(),
  });

  const TermFormSchema = z.object({
    slug: z.string().min(1, { message: t('termForm.error.slugRequired') }),
    tagInfos: z
      .array(TagInfoSchema)
      .min(1, { message: t('termForm.error.tagInfosMin') }),
    langInfos: z
      .array(LangInfoSchema)
      .min(2, { message: t('termForm.error.langInfosMin') })
      .refine(
        (items) => {
          const codes = items.map((i) => i.languageCode);
          return new Set(codes).size === codes.length;
        },
        { message: t('termForm.error.languageCodeDuplicate') },
      ),
    status: z.enum(['published', 'draft']),
  });

  return TermFormSchema;
};

export type TermFormInput = z.infer<ReturnType<typeof createTermFormSchema>>;
export type TagInfoInput = TermFormInput['tagInfos'][number];
