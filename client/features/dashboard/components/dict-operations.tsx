'use client';

import { ImportTerm } from './import-term';
import { ClickCard } from '@/shared/components/ui/click-card';
import { cn } from '@/shared/utils/utils';
import TermForm from './term-form';
import TagForm from './tag-form';
import { useState } from 'react';

export function DictOperations() {
  const [openTermForm, setOpenTermForm] = useState(false);
  const [openTagForm, setOpenTagForm] = useState(false);

  return (
    <div
      className={cn('py-6', 'flex flex-wrap items-center justify-center gap-8')}
    >
      <div className="flex items-center justify-center">
        <ClickCard
          onClick={() => setOpenTermForm(true)}
          className="w-50 h-50 flex items-center justify-center cursor-default"
        >
          <span className="text-3xl font-bold">Term</span>

          {openTermForm && <TermForm />}
        </ClickCard>
      </div>
      <div className="flex items-center justify-center">
        <ClickCard
          onClick={() => setOpenTagForm(true)}
          className="w-50 h-50 flex items-center justify-center cursor-default"
        >
          <span className="text-3xl font-bold">Tag</span>
          {openTagForm && (
            <TagForm onClose={() => setOpenTagForm(false)} isUpdate={false} />
          )}
        </ClickCard>
      </div>
      <div className="flex items-center justify-center">
        <ImportTerm />
      </div>
    </div>
  );
}
