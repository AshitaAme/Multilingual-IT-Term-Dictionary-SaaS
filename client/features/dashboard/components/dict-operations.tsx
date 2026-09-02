'use client';

import { ImportTerm } from './import-term';
import { cn } from '@/shared/utils/utils';
import TermForm from './term-form';
import TagForm from './tag-form';

export function DictOperations() {
  return (
    <div
      className={cn('py-6', 'flex flex-wrap items-center justify-center gap-8')}
    >
      <TermForm />
      <TagForm />
      <ImportTerm />
    </div>
  );
}
