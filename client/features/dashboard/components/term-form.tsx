'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useForm, useFieldArray } from 'react-hook-form';
import { TermFormInput, TermFormSchema } from '../schemas/term-form.schema';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/shared/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { X, Plus } from 'lucide-react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';
import { TermFormProps } from '../types/term-form-props';
import SearchTag from './search-tag';
import { updateTermAction } from '../actions/update-term.action';
import { insertTermAction } from '../actions/insert-term.action';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';

export default function TermForm({
  isUpdate,
  currentTerm,
  onClose,
}: Readonly<TermFormProps>) {
  const t = useTranslations('dashboard');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<TermFormInput>({
    resolver: zodResolver(TermFormSchema),
    mode: 'onSubmit',
    defaultValues: isUpdate
      ? currentTerm
      : {
          slug: '',
          status: 'published',
          tagInfos: [],
          langInfos: [
            { languageCode: '', name: '', definition: '' },
            { languageCode: '', name: '', definition: '' },
          ],
        },
  });

  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: 'langInfos' });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: 'tagInfos' });

  const onSubmit = async (data: TermFormInput) => {
    console.log('Term Submitted:', data);
    const res = isUpdate
      ? await updateTermAction(data)
      : await insertTermAction(data);
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
      <Card className="h-160 w-120 rounded-md bg-background py-0">
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
            {t(isUpdate ? 'termForm.titleUpdate' : 'termForm.titleAdd')}
          </CardTitle>
        </CardHeader>

        <CardContent className=" flex-1 overflow-y-auto h-140">
          <form
            onSubmit={handleSubmit(onSubmit, (errs) =>
              console.log('VALIDATION FAILED:', errs),
            )}
            onChange={() => {
              if (errors.root?.serverError) clearErrors('root.serverError');
            }}
            noValidate
            className="flex flex-col gap-6"
          >
            {/* Slug */}
            <FieldGroup>
              <Field data-invalid={!!errors.slug}>
                <FieldTitle className="pl-1">
                  {t('termForm.label.slug')}
                </FieldTitle>
                <FieldLabel htmlFor="slug" className="sr-only">
                  {t('termForm.label.slug')}
                </FieldLabel>
                <Input
                  readOnly={isUpdate}
                  {...register('slug')}
                  id="slug"
                  placeholder={t('termForm.slugPlaceholder')}
                  className="rounded-sm h-10 text-sm focus:ring-1"
                />
                {errors.slug && (
                  <FieldError className="pl-1">
                    {errors.slug.message}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>

            {/* Status */}
            <FieldGroup {...register('status')} id="status">
              <Field data-invalid={!!errors.status}>
                <FieldTitle className="pl-1">
                  {t('termForm.label.status')}
                </FieldTitle>
                <FieldLabel htmlFor="status" className="sr-only">
                  {t('termForm.label.status')}
                </FieldLabel>
                <NativeSelect>
                  <NativeSelectOption value="published">
                    {t('termForm.published')}
                  </NativeSelectOption>
                  <NativeSelectOption value="published">
                    {t('termForm.draft')}
                  </NativeSelectOption>
                </NativeSelect>

                {errors.status && (
                  <FieldError className="pl-1">
                    {errors.status.message}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>

            {/* Tags */}
            <FieldGroup>
              <Field data-invalid={!!errors.tagInfos}>
                <FieldTitle className="pl-1">
                  {t('termForm.label.tags')}
                </FieldTitle>
                <FieldLabel htmlFor="tags" className="sr-only">
                  {t('termForm.label.tags')}
                </FieldLabel>

                {errors.tagInfos && !Array.isArray(errors.tagInfos) && (
                  <FieldError className="pl-1">
                    {errors.tagInfos.message}
                  </FieldError>
                )}

                {errors.tagInfos &&
                  Array.isArray(errors.tagInfos) &&
                  errors.tagInfos.map((err) => (
                    <FieldError key={err.message} className="pl-1">
                      {err.message}
                    </FieldError>
                  ))}

                <SearchTag
                  className="h-80"
                  appendTag={appendTag}
                  tagFields={tagFields}
                  removeTag={removeTag}
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
                    {t('termForm.translations')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (langFields.length < 3)
                        appendLang({
                          languageCode: '',
                          name: '',
                          definition: '',
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

              {/* Translation fields */}
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

                    {/* Language code */}
                    <Field
                      data-invalid={!!errors.langInfos?.[index]?.languageCode}
                    >
                      <FieldLabel
                        htmlFor={`langCode-${index}`}
                        className="sr-only"
                      >
                        {t('termForm.label.languageCode')}
                      </FieldLabel>
                      <NativeSelect
                        {...register(`langInfos.${index}.languageCode`)}
                        id={`langCode-${index}`}
                      >
                        <NativeSelectOption value="">
                          {t('termForm.selectLanguage')}
                        </NativeSelectOption>
                        <NativeSelectOption value="en">
                          {t('termForm.lang.en')}
                        </NativeSelectOption>
                        <NativeSelectOption value="zh">
                          {t('termForm.lang.zh')}
                        </NativeSelectOption>
                        <NativeSelectOption value="ja">
                          {t('termForm.lang.ja')}
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
                        {t('termForm.label.name')}
                      </FieldLabel>
                      <Input
                        {...register(`langInfos.${index}.name`)}
                        id={`name-${index}`}
                        placeholder={t('termForm.namePlaceholder')}
                        className="rounded-sm h-8 text-xs focus:ring-1"
                      />
                      {errors.langInfos?.[index]?.name && (
                        <FieldError className="pl-1">
                          {errors.langInfos[index].name?.message}
                        </FieldError>
                      )}
                    </Field>

                    {/* Definition input */}
                    <Field
                      data-invalid={!!errors.langInfos?.[index]?.definition}
                    >
                      <FieldLabel htmlFor={`def-${index}`} className="sr-only">
                        {t('termForm.label.definition')}
                      </FieldLabel>
                      <Input
                        {...register(`langInfos.${index}.definition`)}
                        id={`def-${index}`}
                        placeholder={t('termForm.definitionPlaceholder')}
                        className="rounded-sm h-8 text-xs focus:ring-1"
                      />
                      {errors.langInfos?.[index]?.definition && (
                        <FieldError className="pl-1">
                          {errors.langInfos[index].definition?.message}
                        </FieldError>
                      )}
                    </Field>
                  </div>
                ))}
              </div>
            </FieldGroup>
            {/* Global API Error */}
            {errors.root?.serverError && (
              <div className="py-1 mt-4 text-center ring-1 rounded-4xl text-destructive text-sm font-medium">
                {errors.root.serverError.message}
              </div>
            )}

            {/* Submit button */}
            <Button
              variant="outline"
              type="submit"
              className="mb-6 cursor-pointer"
            >
              {t('termForm.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
