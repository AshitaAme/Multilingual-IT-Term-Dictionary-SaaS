'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  TagInfoInput,
  TermFormInput,
  TermFormSchema,
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
import { X, Plus, Trash2 } from 'lucide-react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';
import { Button } from '@/shared/components/ui/button';
import { TermFormProps } from '../types/term-form-props';
import SearchTag from './search-tag';
import { updateTermAction } from '../actions/update-term.action';
import { insertTermAction } from '../actions/insert-term.action';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { useSet } from '@/shared/hooks/use-set';

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
          tagInfos: [
            { tagId: '', name: '' },
            { tagId: '', name: '' },
          ],
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
    console.log('Submitted:', data);
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
        <CardHeader className="relative items-center h-18 w-full px-0">
          <X
            size={16}
            className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
            onClick={() => {
              reset();
              onClose();
            }}
          />
          {/* Card title */}
          <CardTitle className="pl-6 pt-4">
            {t(isUpdate ? 'termForm.titleUpdate' : 'termForm.titleAdd')}
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-y-auto y-100">
          <form
            onSubmit={handleSubmit(onSubmit)}
            onChange={() => {
              if (errors.root?.serverError) clearErrors('root.serverError');
            }}
            noValidate
            className="flex flex-col gap-2"
          >
            {/* Slug field */}
            <FieldGroup>
              <Field data-invalid={!!errors.slug}>
                <FieldTitle>{t('termForm.label.slug')}</FieldTitle>
                <FieldLabel htmlFor="slug" className="sr-only">
                  {t('termForm.label.slug')}
                </FieldLabel>
                <Input
                  {...register('slug')}
                  id="slug"
                  placeholder={t('termForm.slugPlaceholder')}
                  className="rounded-sm h-10 text-sm focus:ring-1"
                />
                {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
              </Field>
            </FieldGroup>

            {/* Tags field */}
            <FieldGroup>
              <Field data-invalid={!!errors.tagInfos}>
                <FieldTitle>{t('termForm.label.tags')}</FieldTitle>
                <FieldLabel htmlFor="tags" className="sr-only">
                  {t('termForm.label.tags')}
                </FieldLabel>
                {/* Button to open tag search */}

                <SearchTag
                  className="h-80"
                  appendTag={appendTag}
                  tagFields={tagFields}
                  removeTag={removeTag}
                />

                {errors.tagInfos && !Array.isArray(errors.tagInfos) && (
                  <FieldError>{errors.tagInfos.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            {/* Language entries section */}
            <FieldGroup className="space-y-3">
              <div className="flex items-center justify-between">
                {/* Section heading */}
                <span className="text-sm font-medium">
                  {t('termForm.differentLanguages')}
                </span>
                {/* Button to add a new language entry */}
                <button
                  type="button"
                  onClick={() =>
                    appendLang({ languageCode: '', name: '', definition: '' })
                  }
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus size={12} /> {t('termForm.addLanguage')}
                </button>
              </div>

              {errors.langInfos && !Array.isArray(errors.langInfos) && (
                <FieldError>{errors.langInfos.message}</FieldError>
              )}

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
                      <FieldError>
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
                      <FieldError>
                        {errors.langInfos[index].name?.message}
                      </FieldError>
                    )}
                  </Field>

                  {/* Definition input */}
                  <Field data-invalid={!!errors.langInfos?.[index]?.definition}>
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
                      <FieldError>
                        {errors.langInfos[index].definition?.message}
                      </FieldError>
                    )}
                  </Field>
                </div>
              ))}
            </FieldGroup>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full h-10 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              {t('termForm.submit')}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
