'use client';

import { useEffect, useState } from 'react';
import { getSearchListAction, SearchItem } from '@/features/search';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { Button } from '@/shared/components/ui/button';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';

export function TermDrawer() {
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
    <div className="w-140 flex flex-col not-even:justify-center gap-3 ring-1 ring-foreground/10 rounded-md p-6">
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
  );
}
