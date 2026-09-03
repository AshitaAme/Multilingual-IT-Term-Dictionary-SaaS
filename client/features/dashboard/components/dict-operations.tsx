'use client';

import { ImportTerm } from './import-term';
import { cn } from '@/shared/utils/utils';
import TermForm from './term-form';
import TagForm from './tag-form';
import { TermDrawer } from './term-list';

export function DictOperations() {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'py-6',
          'flex flex-wrap items-center justify-center gap-8',
        )}
      >
        <TermForm />
        <TagForm />
        <ImportTerm />
      </div>

      <TermDrawer />
    </div>
  );
}
