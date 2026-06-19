'use client';

import { Separator } from '@/shared/components/ui/separator';

export function SearchList() {
  const termList = getTermListAction();

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 text-sm">
      {termList.map((termItem, index) => (
        <div key={index}>
          {index !== 0 && <Separator />}
          <dl className="flex items-center justify-between">
            <dt>Item 1</dt>
            <dd className="text-muted-foreground">Value 1</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}
