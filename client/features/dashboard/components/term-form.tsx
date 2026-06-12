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
} from '@/shared/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/utils';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';

export default function TermForm() {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [openTags, setOpenTags] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TermFormInput>({
    resolver: zodResolver(TermFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      slug: '',
      tagIds: [],
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

  const tagIds = watch('tagIds');
  const addTag = (tagId: string) => {
    if (!tagIds.includes(tagId)) {
      setValue('tagIds', [...tagIds, tagId], { shouldValidate: true });
    }
  };
  const removeTag = (index: number) => {
    setValue(
      'tagIds',
      tagIds.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: TermFormInput) => {
    console.log('Submitted:', data);
  };

  if (!open) return;

  return (
    <Card
      className={cn('relative w-full max-w-sm rounded-md bg-background py-0')}
    >
      <X
        size={16}
        onClick={() => setOpen(false)}
        className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
      />
      <CardHeader className="relative items-center h-18 w-full px-0">
        <CardTitle>Add Term</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* slug */}
          <FieldGroup>
            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input
                {...register('slug')}
                id="slug"
                placeholder="my-term-slug"
                className="rounded-sm h-10 text-sm focus:ring-1"
              />
              {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
            </Field>
          </FieldGroup>

          {/* tags */}
          <FieldGroup>
            <Field data-invalid={!!errors.tagIds}>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>

              {errors.tagIds && !Array.isArray(errors.tagIds) && (
                <FieldError>{errors.tagIds.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          {/* languageSet */}
          <FieldGroup className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Different Languages</span>
              <button
                type="button"
                onClick={() =>
                  appendLang({ languageCode: '', name: '', definition: '' })
                }
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus size={12} /> Add language
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

                <Field data-invalid={!!errors.langInfos?.[index]?.languageCode}>
                  <FieldLabel
                    htmlFor={`languageCode-${index}`}
                    className="text-xs"
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
                  <FieldLabel htmlFor={`name-${index}`} className="text-xs">
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

                <Field data-invalid={!!errors.langInfos?.[index]?.definition}>
                  <FieldLabel htmlFor={`def-${index}`} className="text-xs">
                    Definition
                  </FieldLabel>
                  <Input
                    {...register(`langInfos.${index}.definition`)}
                    id={`def-${index}`}
                    placeholder="Definition（max 100 letters）"
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

          <button
            type="submit"
            className="w-full h-10 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Submit
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
