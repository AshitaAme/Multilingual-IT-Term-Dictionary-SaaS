'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  createTermFormSchema,
  TermFormInput,
} from '../schemas/term-form.schema';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/shared/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { X, Plus, Minus } from 'lucide-react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';
import AttachTag from './attach-tag';
import { updateTermAction } from '../actions/update-term.action';
import { insertTermAction } from '../actions/insert-term.action';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { useTermFormStore } from '../stores/dashboard.store';
import { TermListDrawer } from './term-list-drawer';
import { useEffect } from 'react';

export default function TermForm() {
  const t = useTranslations('dashboard');
  const TermFormSchema = createTermFormSchema(t);
  const isUpdate = useTermFormStore((state) => state.isUpdate);
  const termForm = useTermFormStore((state) => state.formInput);
  const openForm = useTermFormStore((state) => state.openForm);
  const setOpenForm = useTermFormStore((state) => state.setOpenForm);

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
    defaultValues: {
      slug: '',
      status: 'published',
      tagInfoList: [],
      langInfoList: [
        { languageCode: '', name: '', definition: '' },
        { languageCode: '', name: '', definition: '' },
      ],
    },
  });

  useEffect(() => {
    if (!openForm) return;

    if (isUpdate && termForm) {
      reset(termForm);
    } else {
      reset({
        slug: '',
        status: 'published',
        tagInfoList: [],
        langInfoList: [
          { languageCode: '', name: '', definition: '' },
          { languageCode: '', name: '', definition: '' },
        ],
      });
    }
  }, [openForm, isUpdate, termForm, reset]);

  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: 'langInfoList' });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: 'tagInfoList' });

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
    setOpenForm(false);
  };

  if (!openForm)
    return (
      <div className="h-50 w-50 flex flex-col p-0 gap-0">
        <Button
          variant="outline"
          className="flex-1 w-full rounded-b-none border-0"
          onClick={() => setOpenForm(true)}
        >
          {t('termForm.titleAdd')}
        </Button>
        <TermListDrawer
          className="flex-1 w-full"
          trigger={
            <div
              className={cn(
                'flex-1 w-full h-full rounded-b-md border-0 border-t-2',
                'flex items-center justify-center bg-background',
                'font-semibold text-sm',
                'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
              )}
            >
              {t('termForm.titleUpdate')}
            </div>
          }
        />
      </div>
    );

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
      <Card className="h-160 w-130 rounded-sm bg-background py-0">
        <CardHeader className="relative items-center h-12 w-full px-0">
          <X
            size={16}
            className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
            onClick={() => {
              reset();
              setOpenForm(false);
            }}
          />
          {/* Card title */}
          <CardTitle className="pl-5 pt-4">
            {t(isUpdate ? 'termForm.titleUpdate' : 'termForm.titleAdd')}
          </CardTitle>
        </CardHeader>

        <CardContent className=" flex-1 overflow-auto hide-scrollbar h-140">
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
            <FieldGroup className="mt-4">
              <Field data-invalid={!!errors.slug}>
                <FieldTitle className="pl-1">
                  {t('termForm.label.slug')}
                </FieldTitle>
                <FieldLabel htmlFor="slug" className="sr-only">
                  {t('termForm.label.slug')}
                </FieldLabel>
                <Input
                  disabled={isUpdate}
                  {...register('slug')}
                  id="slug"
                  placeholder={t('termForm.slugPlaceholder')}
                  className="rounded-sm text-sm focus:ring-1"
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
            <FieldGroup className="mt-6">
              <Field data-invalid={!!errors.tagInfoList}>
                <FieldTitle className="pl-1">
                  {t('termForm.label.tags')}
                </FieldTitle>
                <FieldLabel htmlFor="tags" className="sr-only">
                  {t('termForm.label.tags')}
                </FieldLabel>

                {errors.tagInfoList && !Array.isArray(errors.tagInfoList) && (
                  <FieldError className="pl-1">
                    {errors.tagInfoList.message}
                  </FieldError>
                )}

                {errors.tagInfoList &&
                  Array.isArray(errors.tagInfoList) &&
                  errors.tagInfoList.map((err) => (
                    <FieldError key={err.message} className="pl-1">
                      {err.message}
                    </FieldError>
                  ))}

                <AttachTag
                  appendTag={appendTag}
                  tagFields={tagFields}
                  removeTag={removeTag}
                />
              </Field>
            </FieldGroup>

            {/* Translation */}
            <FieldGroup className="mt-6">
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
                {errors.langInfoList && !Array.isArray(errors.langInfoList) && (
                  <FieldError className="pl-1">
                    {errors.langInfoList.message}
                  </FieldError>
                )}
              </div>

              {/* Translation fields */}
              <div className="flex flex-col gap-6">
                {langFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={cn(
                      'flex flex-col rounded-sm border border-border p-4 pt-7 pb-5 gap-2',
                      langFields.length > 2 && 'relative',
                    )}
                  >
                    {langFields.length > 2 && (
                      <Minus
                        className="absolute right-1.5 top-1.5 cursor-pointer"
                        size={14}
                        onClick={() => removeLang(index)}
                      />
                    )}

                    {/* Language code */}
                    <Field
                      data-invalid={
                        !!errors.langInfoList?.[index]?.languageCode
                      }
                    >
                      <FieldLabel
                        htmlFor={`langCode-${index}`}
                        className="sr-only"
                      >
                        {t('termForm.label.languageCode')}
                      </FieldLabel>
                      <NativeSelect
                        {...register(`langInfoList.${index}.languageCode`)}
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

                      {errors.langInfoList?.[index]?.languageCode && (
                        <FieldError className="pl-1">
                          {errors.langInfoList[index].languageCode?.message}
                        </FieldError>
                      )}
                    </Field>

                    {/* Language name input */}
                    <Field data-invalid={!!errors.langInfoList?.[index]?.name}>
                      <FieldLabel htmlFor={`name-${index}`} className="sr-only">
                        {t('termForm.label.name')}
                      </FieldLabel>
                      <Input
                        {...register(`langInfoList.${index}.name`)}
                        id={`name-${index}`}
                        placeholder={t('termForm.namePlaceholder')}
                        className="rounded-sm h-8 text-xs focus:ring-1"
                      />
                      {errors.langInfoList?.[index]?.name && (
                        <FieldError className="pl-1">
                          {errors.langInfoList[index].name?.message}
                        </FieldError>
                      )}
                    </Field>

                    {/* Definition input */}
                    <Field
                      data-invalid={!!errors.langInfoList?.[index]?.definition}
                    >
                      <FieldLabel htmlFor={`def-${index}`} className="sr-only">
                        {t('termForm.label.definition')}
                      </FieldLabel>
                      <Input
                        {...register(`langInfoList.${index}.definition`)}
                        id={`def-${index}`}
                        placeholder={t('termForm.definitionPlaceholder')}
                        className="rounded-sm h-8 text-xs focus:ring-1"
                      />
                      {errors.langInfoList?.[index]?.definition && (
                        <FieldError className="pl-1">
                          {errors.langInfoList[index].definition?.message}
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
              className="mb-6 cursor-pointer rounded-sm border-0"
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
