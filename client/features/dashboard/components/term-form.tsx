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
} from '@/shared/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';
import { Button } from '@/shared/components/ui/button';
import { TermFormProps } from '../types/term-form-props';
import SearchTag from './search-tag';
import { updateTermAction } from '../actions/update-term.action';
import { insertTermAction } from '../actions/insert-term.action';
import { useSession } from 'next-auth/react';
import { retrieveRole } from '@/features/auth';
import { redirect } from 'next/navigation';
import { AUTH_ERRORS } from '@/shared/constants/constants';
import { useTranslations } from 'next-intl';

export default function TermForm({
  open,
  setOpen,
  isUpdate,
  currentTerm,
}: Readonly<TermFormProps>) {
  const t = useTranslations('dashboard');
  const [openSearchTag, setOpenSearchTag] = useState(false);
  const session = useSession();
  const userId = session.data?.user.id;

  useEffect(() => {
    if (!userId) redirect(`/?error=${AUTH_ERRORS.AUTH_REQUIRED}`);

    const fetchUserRole = async () => {
      const res = await retrieveRole(userId);
      if (!res.success || res.data != 'admin')
        redirect(`/?error=${AUTH_ERRORS.ADMIN_ONLY}`);
    };

    fetchUserRole();
  }, [userId]);

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
          createdBy: userId,
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
  const clickedTagSet = new Set<TagInfoInput>();

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
    setOpen(false);
  };

  if (!open) return;
  return (
    <Card className="w-full max-w-sm rounded-md bg-background py-0">
      <CardHeader className="relative items-center h-18 w-full px-0">
        <X
          className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        />
        {/* Card title */}
        <CardTitle>{t('termForm.title')}</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          onChange={() => {
            if (errors.root?.serverError) clearErrors('root.serverError');
          }}
          noValidate
        >
          {/* Slug field */}
          <FieldGroup>
            <Field data-invalid={!!errors.slug}>
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
              <FieldLabel htmlFor="tags" className="sr-only">
                {t('termForm.label.tags')}
              </FieldLabel>
              {/* Button to open tag search */}
              <Button variant="outline" onClick={() => setOpenSearchTag(true)}>
                {t('termForm.addTag')}
              </Button>
              {tagFields.map((field, index) => (
                <div key={field.id} className="flex h-4 border-2 relative">
                  field.name
                  <X
                    size={10}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2"
                    onClick={() => removeTag(index)}
                  />
                </div>
              ))}

              {openSearchTag && (
                <SearchTag
                  setOpenSearchTag={setOpenSearchTag}
                  clickedTagSet={clickedTagSet}
                  appendTag={appendTag}
                />
              )}

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
                <Field data-invalid={!!errors.langInfos?.[index]?.languageCode}>
                  <FieldLabel htmlFor={`langCode-${index}`} className="sr-only">
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
  );
}
