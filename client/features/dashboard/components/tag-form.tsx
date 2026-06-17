'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useTranslations } from 'next-intl';
import { TagFormInput, TagFormSchema } from '../schemas/tag-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TagFormProps } from '../types/tag-form-props';
import { updateTagAction } from '../actions/update-tag.action';
import { insertTagAction } from '../actions/insert-tag.action';
import { createPortal } from 'react-dom';
import { TAG_COLORS } from '@/features/dictionary';
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/utils/utils';

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
      <Card className="h-140 w-120 rounded-md bg-background py-0">
        <CardHeader className="relative items-center h-12 w-full px-0">
          <X
            size={16}
            className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
            onClick={() => {
              reset();
              onClose();
            }}
          />
          {/* Card title */}
          <CardTitle className="pl-5 pt-4">
            {t(isUpdate ? 'tagForm.titleUpdate' : 'tagForm.titleAdd')}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto h-140">
          <form
            onSubmit={handleSubmit(onSubmit)}
            onChange={() => clearErrors('root.serverError')}
            className="flex flex-col gap-6"
          >
            {/* Slug */}
            <FieldGroup>
              <Field data-invalid={!!errors.slug}>
                <FieldTitle className="pl-1">
                  {t('tagForm.label.slug')}
                </FieldTitle>
                <FieldLabel htmlFor="slug" className="sr-only">
                  {t('tagForm.label.slug')}
                </FieldLabel>
                <Input
                  {...register('slug')}
                  readOnly={isUpdate}
                  id="slug"
                  placeholder={t('tagForm.slugPlaceholder')}
                  className="rounded-sm h-10 text-sm focus:ring-1"
                />
                {errors.slug && (
                  <FieldError className="pl-1">
                    {errors.slug.message}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>

            {/* Color input */}
            <FieldGroup>
              <Field data-invalid={!!errors.color}>
                <FieldTitle className="pl-1">
                  {t('tagForm.label.color')}
                </FieldTitle>
                <FieldLabel htmlFor="color" className="sr-only">
                  {t('tagForm.label.color')}
                </FieldLabel>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="color" className="w-full">
                        <SelectValue placeholder={t('tagForm.selectColor')}>
                          {field.value && (
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: field.value }}
                              />
                              <span>{field.value}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {TAG_COLORS.map((tagColor) => (
                          <SelectItem key={tagColor} value={tagColor}>
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: tagColor }}
                              />
                              <span>{tagColor}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </FieldGroup>

            {/* Translation */}
            <FieldGroup className="gap-3">
              {/* Translation heading */}
              <div className="flex flex-col gap-1">
                {/* Title and add translation */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium">
                    {t('tagForm.translations')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (langFields.length < 3)
                        appendLang({
                          languageCode: '',
                          name: '',
                        });
                    }}
                    className="cursor-pointer inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus size={12} /> {t('termForm.addTranslation')}
                  </button>
                </div>
                {/* Translation Main Error */}
                {errors.langInfos && !Array.isArray(errors.langInfos) && (
                  <FieldError className="pl-1">
                    {errors.langInfos.message}
                  </FieldError>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {langFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={cn(
                      'flex flex-col rounded-md border border-border p-3 space-y-2',
                      langFields.length > 2 && 'relative pt-6',
                    )}
                  >
                    {langFields.length > 2 && (
                      <X
                        className="absolute right-1.5 top-1.5"
                        size={12}
                        onClick={() => removeLang(index)}
                      />
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
                        <FieldError className="pl-1">
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
                        <FieldError className="pl-1">
                          {errors.langInfos[index].name?.message}
                        </FieldError>
                      )}
                    </Field>
                  </div>
                ))}
              </div>
            </FieldGroup>
            <Button variant="outline" type="submit" className="mb-6">
              {t('tagForm.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
