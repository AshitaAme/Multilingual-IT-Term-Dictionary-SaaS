'use client';

import { X } from 'lucide-react';
import { useTermTextStore } from '../stores/saved.store';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { FieldSeparator } from '@/shared/components/ui/field';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import {
  TermTextFormInput,
  TermTextFormSchema,
  TermTextSchema,
} from '../schemas/term-text-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Input } from '@/shared/components/ui/input';
import { updateTermTextAction } from '../actions/update-term-text.action';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/shared/utils/utils';

export function TermTextForm() {
  const t = useTranslations('saved.termTextForm');

  const term = useTermTextStore((state) => state.term);
  const setTerm = useTermTextStore((state) => state.setTerm);
  const [isUpdating, setIsUpdating] = useState(false);
  const termObj = useMemo(() => {
    const obj = JSON.parse(term!.text);
    const parsed = TermTextSchema.safeParse(obj);
    console.log('[parsed]: ', parsed.data);
    if (parsed.success) return { translations: parsed.data };
    else console.log('[parse error]: ', parsed.error.message);
    return { translations: [] };
  }, [term]);

  const { register, control, handleSubmit } = useForm<TermTextFormInput>({
    resolver: zodResolver(TermTextFormSchema),
    mode: 'onSubmit',
    defaultValues: termObj,
  });

  const { fields } = useFieldArray({
    control,
    name: 'translations',
  });

  const onSubmit = async (data: TermTextFormInput) => {
    if (!term) return;
    setIsUpdating(true);
    const json = JSON.stringify(data.translations);
    const res = await updateTermTextAction({
      savedTermId: term!.savedTermId,
      text: json,
    });
    if (res.error) toast.error(res.error);
    else
      setTerm({
        savedTermId: term.savedTermId,
        name: term.name,
        text: res.data!,
        reviewCard: term.reviewCard,
      });
    setIsUpdating(false);
  };

  if (!term) return;

  const formContent = (
    <form>
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const count = index + 1;
          return (
            <div key={field.id} className="flex flex-col gap-2">
              <span>{t('translation') + ' ' + count}</span>
              <Input
                {...register(`translations.${index}.name`)}
                className="rounded-sm"
              />
              <Input
                {...register(`translations.${index}.lang`)}
                className="rounded-sm"
              />
              <TextareaAutosize
                {...register(`translations.${index}.def`)}
                className={cn(
                  'h-8 w-full min-w-0 border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
                  'rounded-sm',
                )}
                rows={1}
              />
            </div>
          );
        })}
      </div>
    </form>
  );
  return (
    <Card className="w-120 h-160 rounded-md relative bg-background p-4">
      <X
        size={16}
        onClick={() => setTerm(null)}
        className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
      />
      <CardTitle className="text-2xl px-2">{term.name}</CardTitle>
      <FieldSeparator />
      <CardContent className="flex flex-col gap-5.5 h-130 min-h-0 overflow-auto overscroll-contain">
        {isUpdating && (
          <div className="flex items-center justify-center h-full">
            <LoadingCircle />
          </div>
        )}

        {!isUpdating && formContent}

        <Button
          disabled={isUpdating}
          onClick={handleSubmit(onSubmit)}
          className="bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground/60 hover:text-foreground"
        >
          Update
        </Button>
      </CardContent>
    </Card>
  );
}
