'use client';

import { Separator } from '@/shared/components/ui/separator';
import { useEffect, useState } from 'react';
import { getSearchListAction } from '../actions/get-search-list.action';
import { SearchItem } from '../types/search-item';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { getPageCount } from '../actions/get- page-count.action';

export function SearchList() {
  const [page, setPage] = useState(1);
  const [searchList, setSearchList] = useState<SearchItem[]>([]);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const fetchList = async () => {
      const res = await getSearchListAction(page);
      if (!res.success) toast.error(res.error);
      setSearchList(res.data!);
    };
    const countPages = async () => {
      const res = await getPageCount();
      if (!res.success) toast.error(res.error);
      setPageCount(res.data!);
    };
    fetchList();
    countPages();
  }, [page]);

  const handlePageTurning = (direction: string) => {
    if (direction === 'left' && page !== 1) setPage(page - 1);
    if (direction === 'right' && page !== pageCount) setPage(page + 1);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 text-sm">
      {searchList.map((termItem, index) => (
        <div key={termItem.termId}>
          {index !== 0 && <Separator />}
          <dl className="flex items-center justify-between">
            <dt>{termItem.displayName}</dt>
            <dd className="text-muted-foreground">
              {termItem.tags.map((tag) => (
                <div key={tag}>{tag}</div>
              ))}
            </dd>
          </dl>
        </div>
      ))}

      <Button onClick={() => handlePageTurning('left')}>
        <ChevronLeftIcon />
      </Button>
      <Button onClick={() => handlePageTurning('right')}>
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
