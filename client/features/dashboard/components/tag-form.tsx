'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
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
import { Trash2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TagFormProps } from '../types/tag-form-props';
import { updateTagAction } from '../actions/update-tag.action';
import { insertTagAction } from '../actions/insert-tag.action';
import { createPortal } from 'react-dom';

export default function TagForm({
  isUpdate,
  currentTag,
  onClose,
}: Readonly<TagFormProps>) {
  const t = useTranslations('dashboard');

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<TagFormInput>({
    resolver: zodResolver(TagFormSchema),
    mode: 'onSubmit',
    defaultValues: isUpdate
      ? currentTag
      : {
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

  const onSubmit = async (data: TagFormInput) => {
    console.log('Tag form submitted:', data);

    const res = isUpdate
      ? await updateTagAction(data)
      : await insertTagAction(data);

    if (!res.success) {
      setError('root.serverError', {
        type: 'server',
        message: res?.error,
      });
      return;
    }
    reset();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
      <Card className="w-full max-w-sm rounded-md bg-background py-0">
        <CardHeader>
          {/* Card title: "Update tag" or "Add tag" depending on mode */}
          <CardTitle>
            {isUpdate ? t('tagForm.titleUpdate') : t('tagForm.titleAdd')}
          </CardTitle>
          <X
            className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
            onClick={() => {
              reset();
              onClose();
            }}
          />
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onChange={() => clearErrors('root.serverError')}
          >
            <FieldGroup>
              {/* Slug input */}
              <Field data-invalid={!!errors.slug}>
                <FieldLabel htmlFor="slug" className="sr-only">
                  {t('tagForm.label.slug')}
                </FieldLabel>
                <Input
                  {...register('slug')}
                  readOnly={isUpdate}
                  id="slug"
                  placeholder={t('tagForm.slugPlaceholder')}
                />
                {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
              </Field>

              {/* Color input */}
              <Field data-invalid={!!errors.color}>
                <FieldLabel htmlFor="color" className="sr-only">
                  {t('tagForm.label.color')}
                </FieldLabel>
                <Input
                  {...register('slug')}
                  id="slug"
                  placeholder={t('tagForm.colorPlaceholder')}
                />
                {errors.color && (
                  <FieldError>{errors.color.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            <FieldGroup>
              {/* Button to add a new language entry */}
              <Button
                onClick={() => appendLang({ languageCode: '', name: '' })}
              >
                {t('tagForm.addLanguage')}
              </Button>

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

                  {/* Language code selector */}
                  <Field
                    data-invalid={!!errors.langInfos?.[index]?.languageCode}
                  >
                    <FieldLabel
                      htmlFor={`languageCode-${index}`}
                      className="sr-only"
                    >
                      {t('tagForm.label.languageCode')}
                    </FieldLabel>
                    <NativeSelect
                      {...register(`langInfos.${index}.languageCode`)}
                      id={`languageCode-${index}`}
                    >
                      <NativeSelectOption value="">
                        {t('tagForm.selectLanguage')}
                      </NativeSelectOption>
                      <NativeSelectOption value="en">
                        {t('tagForm.lang.en')}
                      </NativeSelectOption>
                      <NativeSelectOption value="zh">
                        {t('tagForm.lang.zh')}
                      </NativeSelectOption>
                      <NativeSelectOption value="ja">
                        {t('tagForm.lang.ja')}
                      </NativeSelectOption>
                    </NativeSelect>

                    {errors.langInfos?.[index]?.languageCode && (
                      <FieldError>
                        {errors.langInfos[index].languageCode?.message}
                      </FieldError>
                    )}
                  </Field>

                  {/* Language name input */}
                  <Field data-invalid={!!errors.langInfos?.[index]?.name}>
                    <FieldLabel htmlFor={`name-${index}`} className="sr-only">
                      {t('tagForm.label.name')}
                    </FieldLabel>
                    <Input
                      {...register(`langInfos.${index}.name`)}
                      id={`name-${index}`}
                      placeholder={t('tagForm.namePlaceholder')}
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

            {/* Submit button */}
            <Button type="submit" variant="outline" />
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
