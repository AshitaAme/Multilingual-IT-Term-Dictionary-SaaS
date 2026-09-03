'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getSearchListAction, SearchItem } from '@/features/search';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { Button } from '@/shared/components/ui/button';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Drawer,
} from '@/shared/components/ui/drawer';
import { useTranslations } from 'next-intl';

export function TermListDrawer({
  trigger,
  className,
}: Readonly<{ trigger: ReactNode; className?: string }>) {
  const t = useTranslations('dashboard.termListDrawer');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [termList, updateTermList] = useImmer<SearchItem[]>([]);
  useEffect(() => {
    const fetchList = async () => {
      const res = await getSearchListAction({ page, query });
      if (!res.success) toast.error(res.error);
      else updateTermList(() => res.data);
    };
    fetchList();
  }, [page, query]);

  return (
    <Drawer direction="right">
      <DrawerTrigger className={className}>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto flex flex-col not-even:justify-center gap-3 ring-1 ring-foreground/10 rounded-md p-6">
          {termList.map((item, index) => {
            const count = (page - 1) * PAGE_SIZE + index + 1;
            return (
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between gap-x-10"
                key={item.termId}
              >
                <div className="flex gap-x-4 items-center">
                  <span>{count < 10 ? '0' + count : count.toString()}</span>
                  <span>{item.displayName}</span>
                </div>
              </Button>
            );
          })}
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
