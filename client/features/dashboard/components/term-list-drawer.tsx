'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { Button } from '@/shared/components/ui/button';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Drawer,
} from '@/shared/components/ui/drawer';
import { useTranslations } from 'next-intl';
import { useTermFormStore } from '../stores/dashboard.store';
import { TermFormInput } from '../schemas/term-form.schema';
import { getTermListAction } from '../actions/get-term-list.action';
import { cn } from '@/shared/utils/utils';
import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';

export function TermListDrawer({
  trigger,
  className,
}: Readonly<{ trigger: ReactNode; className?: string }>) {
  const t = useTranslations('dashboard.termListDrawer');

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const [termList, updateTermList] = useImmer<TermFormInput[]>([]);

  const openForm = useTermFormStore((state) => state.openForm);
  const setIsUpdate = useTermFormStore((state) => state.setIsUpdate);
  const setOpenForm = useTermFormStore((state) => state.setOpenForm);
  const setFormInput = useTermFormStore((state) => state.setFormInput);

  useEffect(() => {
    const fetchList = async () => {
      const res = await getTermListAction({ page, query });
      if (!res.success) toast.error(res.error);
      else updateTermList(() => res.data);
      console.log('term list: ', res.data);
    };
    fetchList();
  }, [page, query]);

  const handleTermClick = (item: TermFormInput) => {
    setIsUpdate(true);
    setFormInput(item);
    setOpenForm(true);
  };

  const end = useMemo(() => termList.length === 0, [termList.length]);

  return (
    <Drawer direction="right">
      <DrawerTrigger className={className}>{trigger}</DrawerTrigger>
      <DrawerContent
        className="h-full"
        onPointerDownOutside={(e) => {
          if (openForm) e.preventDefault();
        }}
      >
        <DrawerHeader>
          <DrawerTitle>{t('updateTerm')}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col h-6/7">
          <div className="w-full pl-4 pr-16 relative shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setQuery(input);
              }}
              className={cn(
                'w-full border-0 rounded-md bg-muted-foreground/10! focus:bg-muted-foreground/20!',
                'pb-1.5 pl-3 pr-8',
              )}
            />
            <Search
              onClick={() => setQuery(input)}
              size={14}
              className="absolute right-18 bottom-1/2 translate-y-1/2 cursor-pointer"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col gap-3 p-6 pt-4 overflow-y-scroll overflow-x-hidden">
            {termList.map((item, index) => {
              const count = (page - 1) * PAGE_SIZE + index + 1;
              return (
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between gap-x-10"
                  key={item.slug}
                  onClick={() => handleTermClick(item)}
                >
                  <div className="flex gap-x-4 items-center">
                    <span>{count < 10 ? '0' + count : count.toString()}</span>
                    <span className="text-start w-60 truncate">
                      {item.slug}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
          <div className="shrink-0 flex gap-4 items-center justify-center pt-4">
            <Button
              disabled={page === 1}
              variant="ghost"
              onClick={() => setPage((prev) => prev - 1)}
            >
              {t('prev')}
            </Button>
            <span>|</span>
            <Button
              disabled={end}
              variant="ghost"
              onClick={() => setPage((prev) => prev + 1)}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
