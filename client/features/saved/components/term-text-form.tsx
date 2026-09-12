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
} from '../schemas/term-text-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Input } from '@/shared/components/ui/input';

export function TermTextForm() {
  const term = useTermTextStore((state) => state.term);
  const setTerm = useTermTextStore((state) => state.setTerm);
  const [isUpdating, setIsUpdating] = useState(false);
  const termObj = useMemo(() => {
    const obj = JSON.parse(term!.text);
    const parsed = TermTextFormSchema.safeParse(obj);
    if (parsed.success) return parsed.data;
    return { translations: [] };
  }, [term]);

  const { register, control, handleSubmit } = useForm<TermTextFormInput>({
    resolver: zodResolver(TermTextFormSchema),
    mode: 'onSubmit',
    defaultValues: termObj,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'translations',
  });

  const onSubmit = (data: TermTextFormInput) => {
    setIsUpdating(true);
    const json = JSON.stringify(data);
    setIsUpdating(false);
  };

  if (!term) return;

  const formContent = (
    <form>
      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <Input {...register(`translations.${index}.name`)} />
            <Input {...register(`translations.${index}.lang`)} />
            <Input {...register(`translations.${index}.def`)} />
          </div>
        );
      })}
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
      <CardContent className="flex flex-col gap-5.5 h-130">
        {isUpdating && (
          <div className="flex items-center justify-center h-full">
            <LoadingCircle />
          </div>
        )}

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
