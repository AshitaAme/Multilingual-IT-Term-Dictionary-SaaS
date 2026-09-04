'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useTranslations } from 'next-intl';
import { createTagFormSchema, TagFormInput } from '../schemas/tag-form.schema';
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
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { updateTagAction } from '../actions/update-tag.action';
import { insertTagAction } from '../actions/insert-tag.action';
import { createPortal } from 'react-dom';
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/utils/utils';
import { TAG_COLORS } from '@/shared/constants/constants';
import { useTagFormStore } from '../stores/dashboard.store';
import { TagListDrawer } from './tag-list-drawer';
import { useEffect } from 'react';

export default function TagForm() {
  const t = useTranslations('dashboard');
  const TagFormSchema = createTagFormSchema(t);
  const openForm = useTagFormStore((state) => state.openForm);
  const isUpdate = useTagFormStore((state) => state.isUpdate);
  const tagForm = useTagFormStore((state) => state.formInput);
  const setOpenForm = useTagFormStore((state) => state.setOpenForm);

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
    defaultValues: {
      slug: '',
      color: '',
      langInfoList: [
        { languageCode: '', name: '' },
        { languageCode: '', name: '' },
      ],
    },
  });

  useEffect(() => {
    if (!openForm) return;

    if (isUpdate && tagForm) {
      reset(tagForm);
    } else {
      reset({
        slug: '',
        color: '',
        langInfoList: [
          { languageCode: '', name: '' },
          { languageCode: '', name: '' },
        ],
      });
    }
  }, [isUpdate, openForm, reset, tagForm]);

  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: 'langInfoList' });

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
          {t('tagForm.titleAdd')}
        </Button>
        <TagListDrawer
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
              {t('tagForm.titleUpdate')}
            </div>
          }
        />
      </div>
    );

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
      <Card className="h-140 w-120 rounded-md bg-background py-0">
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
            {t(isUpdate ? 'tagForm.titleUpdate' : 'tagForm.titleAdd')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto h-140">
          <form
            onSubmit={handleSubmit(onSubmit, (errs) =>
              console.log('VALIDATION FAILED:', errs),
            )}
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
                  className="rounded-sm text-sm focus:ring-1"
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
            <FieldGroup className="mt-6">
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
                {errors.langInfoList && !Array.isArray(errors.langInfoList) && (
                  <FieldError className="pl-1">
                    {errors.langInfoList.message}
                  </FieldError>
                )}
              </div>

              <div className="flex flex-col gap-2">
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

                    {/* Language code selector */}
                    <Field
                      data-invalid={
                        !!errors.langInfoList?.[index]?.languageCode
                      }
                    >
                      <FieldLabel
                        htmlFor={`languageCode-${index}`}
                        className="sr-only"
                      >
                        {t('tagForm.label.languageCode')}
                      </FieldLabel>
                      <NativeSelect
                        {...register(`langInfoList.${index}.languageCode`)}
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

                      {errors.langInfoList?.[index]?.languageCode && (
                        <FieldError className="pl-1">
                          {errors.langInfoList[index].languageCode?.message}
                        </FieldError>
                      )}
                    </Field>

                    {/* Language name input */}
                    <Field data-invalid={!!errors.langInfoList?.[index]?.name}>
                      <FieldLabel htmlFor={`name-${index}`} className="sr-only">
                        {t('tagForm.label.name')}
                      </FieldLabel>
                      <Input
                        {...register(`langInfoList.${index}.name`)}
                        id={`name-${index}`}
                        placeholder={t('tagForm.namePlaceholder')}
                        className="rounded-sm h-8 text-xs focus:ring-1"
                      />
                      {errors.langInfoList?.[index]?.name && (
                        <FieldError className="pl-1">
                          {errors.langInfoList[index].name?.message}
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

            <Button
              variant="outline"
              type="submit"
              className="mb-6 cursor-pointer rounded-sm border-0"
            >
              {t('tagForm.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
