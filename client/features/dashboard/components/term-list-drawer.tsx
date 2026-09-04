'use client';

import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { Button } from '@/shared/components/ui/button';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  Drawer,
} from '@/shared/components/ui/drawer';
import { useTranslations } from 'next-intl';
import { useTermFormStore } from '../stores/dashboard.store';
import { TermFormInput } from '../schemas/term-form.schema';
import { getTermListAction } from '../actions/get-term-list.action';

export function TermListDrawer({
  trigger,
  className,
}: Readonly<{ trigger: ReactNode; className?: string }>) {
  const t = useTranslations('dashboard.termListDrawer');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [termList, updateTermList] = useImmer<TermFormInput[]>([]);
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

  return (
    <Drawer direction="right">
      <DrawerTrigger className={className}>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('updateTerm')}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 p-6 overflow-y-scroll overflow-x-hidden">
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
                  <span className="text-start w-60 truncate">{item.slug}</span>
                </div>
              </Button>
            );
          })}
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="outline" className="border-0 w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
