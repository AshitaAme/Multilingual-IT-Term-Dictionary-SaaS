'use client';

import { PAGE_SIZE } from '@/features/search/constants/search.constants';
import { Button } from '@/shared/components/ui/button';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Drawer,
} from '@/shared/components/ui/drawer';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/utils';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { useTagFormStore } from '../stores/dashboard.store';
import { TagFormInput } from '../schemas/tag-form.schema';
import { getTagListAction } from '@/features/search/actions/get-tag-list.action';

export function TagListDrawer({
  trigger,
  className,
}: Readonly<{ trigger: ReactNode; className?: string }>) {
  const t = useTranslations('dashboard.tagListDrawer');
  const [page, setPage] = useState(1);
  const [input, setInput] = useState('');
  const [tagList, updateTagList] = useImmer<TagFormInput[]>([]);

  const openForm = useTagFormStore((state) => state.openForm);
  const setIsUpdate = useTagFormStore((state) => state.setIsUpdate);
  const setOpenForm = useTagFormStore((state) => state.setOpenForm);
  const setFormInput = useTagFormStore((state) => state.setFormInput);

  useEffect(() => {
    const fetchList = async () => {
      const res = await getTagListAction();
      if (!res.success) toast.error(res.error);
      else updateTagList(() => res.data);
      console.log('tag list: ', res.data);
    };
    fetchList();
  }, []);

  const handleTermClick = (item: TagFormInput) => {
    setIsUpdate(true);
    setFormInput(item);
    setOpenForm(true);
  };

  const filteredList = useMemo(
    () => tagList.filter((t) => t.slug.includes(input)),
    [input, tagList],
  );

  const lastPage = useMemo(
    () => Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE)),
    [filteredList.length],
  );

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
          <DrawerTitle>{t('updateTag')}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col h-6/7">
          <div className="w-full pl-4 pr-16 relative shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={cn(
                'w-full border-0 rounded-md bg-muted-foreground/10! focus:bg-muted-foreground/20!',
                'pb-1.5 pl-3 pr-8',
              )}
            />
            <Search
              size={14}
              className="absolute right-18 bottom-1/2 translate-y-1/2 cursor-pointer"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col gap-3 p-6 pt-4 overflow-y-scroll overflow-x-hidden">
            {filteredList
              .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
              .map((item, index) => {
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
            <span>
              {page}/{lastPage}
            </span>
            <Button
              disabled={page === lastPage}
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
