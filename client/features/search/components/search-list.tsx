'use client';

import { Separator } from '@/shared/components/ui/separator';
import { useEffect, useState } from 'react';
import { getSearchListAction } from '../actions/get-search-list.action';
import { SearchItem } from '../types/search-item';
import { toast } from 'sonner';

export function SearchList() {
  const [page, setPage] = useState(1);
  const [searchList, setSearchList] = useState<SearchItem[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const res = await getSearchListAction(page);
      if (!res.success) toast.error('Loading failed');
      setSearchList(res.data);
    };
    fetch();
  }, []);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 text-sm">
      {searchList.map((termItem, index) => (
        <div key={index}>
          {index !== 0 && <Separator />}
          <dl className="flex items-center justify-between">
            <dt></dt>
            <dd className="text-muted-foreground">Value 1</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}
