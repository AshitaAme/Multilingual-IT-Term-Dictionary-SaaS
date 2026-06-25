'use client';

import { Separator } from '@/shared/components/ui/separator';
import { useEffect, useState } from 'react';
import { getSearchListAction } from '../actions/get-search-list.action';
import { SearchItem } from '../types/search-item';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  useInputStore,
  useOpenTermStore,
  useSearchStore,
} from '../stores/search.store';
import { MAX_INPUT_LENGTH } from '../constants/search.constants';

export function SearchList() {
  const query = useSearchStore((state) => state.query);
  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const setTerm = useOpenTermStore((state) => state.setTerm);
  const [page, setPage] = useState(1);
  const [searchList, setSearchList] = useState<SearchItem[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      const res = await getSearchListAction({ page, query });
      if (!res.success) toast.error(res.error);
      setSearchList(res.data!);
      setHasNextPage(res.data!.length > 100);
    };
    fetchList();
  }, [page, query]);

  const handleTermClick = (item: SearchItem) => {
    setTerm(item);
    setOpenTerm(true);
  };

  const handleTagClick = (tagName: string) => {
    const newInput = input + tagName + ' ';
    if (newInput.length <= MAX_INPUT_LENGTH) setInput(newInput);
  };

  const handlePageTurning = (direction: 'left' | 'right') => {
    if (direction === 'left' && page !== 1) setPage(page - 1);
    if (direction === 'right' && hasNextPage) setPage(page + 1);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex w-full flex-col text-sm">
        {/* Loop every term */}
        {searchList?.map((item, index) => (
          <div key={item.termId}>
            {index !== 0 && <Separator />}
            <div
              onClick={() => handleTermClick}
              className="w-full rounded-sm px-4 flex gap-8 py-3 cursor-pointer hover:backdrop-brightness-125"
            >
              {/* Term name */}
              <div className="flex items-center text-left">
                {item.displayName}
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 items-center">
                {item.tags.map((tag) => (
                  <button
                    key={tag.name}
                    className="rounded-4xl px-2 py-0.5 text-sm font-medium cursor-pointer transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: tag.color
                        ? `color-mix(in srgb, ${tag.color} 16%, white)`
                        : '#f3f4f6',
                      color: tag.color
                        ? `color-mix(in srgb, ${tag.color} 75%, black)`
                        : '#374151',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTagClick(tag.name);
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Page turning */}
      <div className="flex flex-row items-center justify-center gap-15">
        <Button
          disabled={page <= 1}
          className="cursor-pointer"
          variant="ghost"
          onClick={() => handlePageTurning('left')}
        >
          <ChevronLeftIcon />
          <span>Last page</span>
        </Button>
        <span>|</span>
        <Button
          disabled={!hasNextPage}
          className="cursor-pointer"
          variant="ghost"
          onClick={() => handlePageTurning('right')}
        >
          <span>Next page</span>
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
