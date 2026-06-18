import z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createTagFormSchema = (t: Translator) => {
  const LangInfoSchema = z.object({
    languageCode: z
      .string()
      .min(1, { message: t('tagForm.error.languageCodeRequired') })
      .max(15, { message: t('tagForm.error.languageCodeTooLong') }),
    name: z
      .string()
      .min(1, { message: t('tagForm.error.nameRequired') })
      .max(15, { message: t('tagForm.error.nameTooLong') }),
  });

  return z.object({
    slug: z
      .string()
      .min(1, { message: t('tagForm.error.slugRequired') })
      .max(15, { message: t('tagForm.error.slugTooLong') }),
    color: z
      .string()
      .min(1, { message: t('tagForm.error.colorRequired') })
      .max(30, { message: t('tagForm.error.colorTooLong') }),
    langInfos: z
      .array(LangInfoSchema)
      .min(2, { message: t('tagForm.error.langInfosMin') })
      .max(3, { message: t('tagForm.error.langInfosMax') })
      .refine(
        (items) => {
          const codes = items.map((i) => i.languageCode);
          return new Set(codes).size === codes.length;
        },
        { message: t('tagForm.error.languageCodeDuplicate') },
      ),
  });
};

export type TagFormInput = z.infer<ReturnType<typeof createTagFormSchema>>;
