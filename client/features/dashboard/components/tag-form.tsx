'use client';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useTranslations } from 'next-intl';
import { TagFormInput, TagFormSchema } from '../schemas/tag-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';
import { Trash2 } from 'lucide-react';

export default function TagForm() {
  const t = useTranslations('dashboard');
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<TagFormInput>({
    resolver: zodResolver(TagFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      slug: '',
      color: '',
      langInfos: [
        { languageCode: '', name: '' },
        { languageCode: '', name: '' },
      ],
    },
  });

  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: 'langInfos' });

  return (
    <Card>
      <CardHeader>{t('addTag')}</CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug" className="sr-only">
                Slug
              </FieldLabel>
              <Input
                {...register('slug')}
                id="slug"
                placeholder="Enter tag slug"
              />
              {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.color}>
              <FieldLabel htmlFor="color" className="sr-only">
                Color
              </FieldLabel>
              <Input
                {...register('slug')}
                id="slug"
                placeholder="Enter tag color"
              />
              {errors.color && <FieldError>{errors.color.message}</FieldError>}
            </Field>
          </FieldGroup>
          <FieldGroup>
            {langFields.map((field, index) => (
              <div
                key={field.id}
                className="relative rounded-md border border-border p-3 space-y-2"
              >
                {langFields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeLang(index)}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                <Field data-invalid={!!errors.langInfos?.[index]?.languageCode}>
                  <FieldLabel
                    htmlFor={`languageCode-${index}`}
                    className="sr-only"
                  >
                    Language Code
                  </FieldLabel>
                  <NativeSelect
                    {...register(`langInfos.${index}.languageCode`)}
                    id={`languageCode-${index}`}
                  >
                    <NativeSelectOption value="">
                      Select language
                    </NativeSelectOption>
                    <NativeSelectOption value="en">English</NativeSelectOption>
                    <NativeSelectOption value="zh">
                      中文（简）
                    </NativeSelectOption>
                    <NativeSelectOption value="ja">日本語</NativeSelectOption>
                  </NativeSelect>

                  {errors.langInfos?.[index]?.languageCode && (
                    <FieldError>
                      {errors.langInfos[index].languageCode?.message}
                    </FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.langInfos?.[index]?.name}>
                  <FieldLabel htmlFor={`name-${index}`} className="sr-only">
                    Name
                  </FieldLabel>
                  <Input
                    {...register(`langInfos.${index}.name`)}
                    id={`name-${index}`}
                    placeholder="Language name（max 30 letters）"
                    className="rounded-sm h-8 text-xs focus:ring-1"
                  />
                  {errors.langInfos?.[index]?.name && (
                    <FieldError>
                      {errors.langInfos[index].name?.message}
                    </FieldError>
                  )}
                </Field>
              </div>
            ))}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
