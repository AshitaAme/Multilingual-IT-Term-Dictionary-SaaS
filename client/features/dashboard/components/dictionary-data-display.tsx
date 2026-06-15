'use client';

import { ImportTerm } from './import-term';
import { ClickCard } from '@/shared/components/ui/click-card';
import { countDictionary } from '../actions/count-dictionary.action';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { useEffect, useState } from 'react';
import TermForm from './term-form';
import TagForm from './tag-form';

export function DictionaryDataDisplay() {
  const [termCount, setTermCount] = useState<number | undefined>();
  const [tagCount, setTagCount] = useState<number | undefined>();

  useEffect(() => {
    const count = async () => {
      const res = await countDictionary();
      if (!res.success) toast.error("Term and tag's number retrieval failed");
      setTermCount(res.data?.termCount);
      setTagCount(res.data?.tagCount);
    };
    count();
  }, []);

  const [openTermForm, setOpenTermForm] = useState(false);
  const [openTagForm, setOpenTagForm] = useState(false);

  return (
    <div
      className={cn(
        'grid grid-cols-3 mt-10 px-1/2',
        'md:px-[10%] ',
        'pt-[6.5%] lg:pt-[5.5%] pb-[15%] lg:px-[20%]',
      )}
    >
      <div className="flex items-center justify-center">
        <ClickCard className="w-50 h-50 flex items-center justify-center cursor-default">
          <span className="text-3xl font-bold">Term</span>
          <span>{termCount}</span>
          <Button
            variant="outline"
            className="cursor-pointer bg-muted-foreground"
            onClick={() => setOpenTermForm(true)}
          >
            Manipulate
          </Button>
          {openTermForm && (
            <TermForm onClose={() => setOpenTermForm(false)} isUpdate={false} />
          )}
        </ClickCard>
      </div>
      <div className="flex items-center justify-center">
        <ClickCard className="w-50 h-50 flex items-center justify-center cursor-default">
          <span className="text-3xl font-bold">Tag</span>
          <span>{tagCount}</span>
          <Button
            variant="outline"
            className="cursor-pointer bg-muted-foreground"
            onClick={() => setOpenTagForm(true)}
          >
            Manipulate
          </Button>
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
