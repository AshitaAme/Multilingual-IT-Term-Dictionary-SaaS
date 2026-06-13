import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useForm, useFieldArray } from 'react-hook-form';
import { TermInput, TermSchema } from '../schemas/term.schema';
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
import { useState } from 'react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/shared/components/ui/native-select';
import { useLocale } from 'next-intl';
import { Button } from '@/shared/components/ui/button';

export default function TermForm() {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [openSeachTag, setOpenSearchTag] = useState(false);
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TermInput>({
    resolver: zodResolver(TermSchema),
    mode: 'onSubmit',
    defaultValues: {
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

  const onSubmit = async (data: TermInput) => {
    console.log('Submitted:', data);
  };

  if (!open) return;
  return (
    <Card
      className={cn('relative w-full max-w-sm rounded-md bg-background py-0')}
    >
      <CardHeader className="relative items-center h-18 w-full px-0">
        <CardTitle> Term</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* slug */}
          <FieldGroup>
            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug" className="sr-only">
                Slug
              </FieldLabel>
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
            <Field data-invalid={!!errors.tagInfos}>
              <FieldLabel htmlFor="tags" className="sr-only">
                Tags
              </FieldLabel>
              <Button variant="outline" onClick={() => setOpenSearchTag(true)}>
                Add tags
              </Button>
              {tagFields.map((field, index) => (
                <div key={field.id} className="flex h-4 border-2 relative">
                  field.name
                  <X
                    size={10}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2"
                    onClick={() => removeTag(index)}
                  ></X>
                </div>
              ))}

              {errors.tagInfos && !Array.isArray(errors.tagInfos) && (
                <FieldError>{errors.tagInfos.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          {/* languages */}
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

                <Field data-invalid={!!errors.langInfos?.[index]?.definition}>
                  <FieldLabel htmlFor={`def-${index}`} className="sr-only">
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
