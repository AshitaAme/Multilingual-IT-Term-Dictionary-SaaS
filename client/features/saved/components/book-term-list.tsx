'use client';

import { toast } from 'sonner';
import { useBookOptionStore, useBookStore } from '../stores/saved.store';
import { useMemo, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { Circle } from 'lucide-react';
import { useImmer } from 'use-immer';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/components/ui/context-menu';
import { enableMapSet } from 'immer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';

export function BookTermList() {
  enableMapSet();
  const bookId = useBookStore((state) => state.bookId);
  const mode = useBookOptionStore((state) => state.mode);
  const [bookTermList, updateBookTermList] = useImmer<BookTerm[]>([]);
  const [selected, updateSelected] = useImmer<Set<string>>(new Set()); // pageIndex#itemIndex
  const [query, setQuery] = useState<string>('');
  const setIsSelecting = useBookOptionStore((state) => state.setIsSelecting);

  const queryKey = useMemo(
    () => ['saved-book-info', bookId, query],
    [bookId, query],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey,
      initialPageParam: 1,
      queryFn: async ({ pageParam = 1 }) => {
        const res = await getBookTermListAction({
          bookId,
          query,
          page: pageParam,
        });
        if (!res.success) {
          toast.error(res.error);
          throw new Error(res.error);
        } else return res.data || [];
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1;
      },
    });

  return (
    <div className={cn('w-full', 'flex flex-col gap-10 px-[20%] py-[10%]')}>
      <div className={cn('min-h-100', 'flex items-center justify-center')}>
        {/* Loading */}
        {(isLoading || isFetchingNextPage) && <LoadingCircle />}
        {/* Empty */}
        {!(isLoading || isFetchingNextPage) && data?.pages.length === 0 && (
          <span className="font-semibold">Still Empty...</span>
        )}

        {/* List mode */}
        {!(isLoading || isFetchingNextPage) &&
          bookTermList.length > 0 &&
          mode === 'List' && (
            <div className="w-140 flex flex-col justify-center gap-3 ring-1 rounded-md p-6">
              {data?.pages.map((page, pageIndex) =>
                page.map((item, itemIndex) => {
                  const indexKey = pageIndex + '#' + itemIndex;
                  const count = pageIndex * PAGE_SIZE + itemIndex + 1;
                  return (
                    <ContextMenu key={item.termId}>
                      <ContextMenuTrigger>
                        <Button
                          onClick={() => {
                            updateSelected((draft) => {
                              if (draft.has(indexKey)) {
                                draft.delete(indexKey);
                                if (draft.size === 0) setIsSelecting(false);
                              } else {
                                draft.add(indexKey);
                                if (draft.size === 1) setIsSelecting(true);
                              }
                            });
                          }}
                          variant="ghost"
                          key={indexKey + '#' + item.name}
                          className="w-full flex flex-row items-center justify-between gap-x-10"
                        >
                          <div className="flex gap-x-4">
                            <span>
                              {count < 10 ? '0' + count : count.toString()}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          {selected.size !== 0 && (
                            <Circle
                              className={cn(
                                selected.has(indexKey)
                                  ? 'fill-foreground'
                                  : 'text-background',
                                'ring-1 rounded-full ring-foreground',
                              )}
                            />
                          )}
                        </Button>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="p-2 flex flex-col gap-1">
                        <ContextMenuItem>Delete</ContextMenuItem>
                        <ContextMenuItem>
                          {item.reviewCard ? 'Add review' : 'Cancel Review'}
                        </ContextMenuItem>
                        <ContextMenuItem>Move to</ContextMenuItem>
                        <ContextMenuItem>Modify</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                }),
              )}
            </div>
          )}
      </div>
    </div>
  );
}
