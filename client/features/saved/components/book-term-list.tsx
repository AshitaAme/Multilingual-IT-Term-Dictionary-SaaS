'use client';

import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useEffect, useMemo, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import {
  ChevronLeft,
  Circle,
  Clock,
  ClockFading,
  ClockPlus,
  Diamond,
  Eraser,
  FolderPlus,
  List,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { useImmer } from 'use-immer';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/components/ui/context-menu';
import { enableMapSet } from 'immer';
import { between } from 'drizzle-orm';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';

export function BookTermList() {
  enableMapSet();
  const bookId = useBookStore((state) => state.bookId);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const [bookTermList, updateBookTermList] = useImmer<BookTerm[]>([]);
  const [selected, updateSelected] = useImmer<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<'List' | 'Card' | 'Review'>('List');
  const [query, setQuery] = useState<string>('');

  const queryClient = useQueryClient();
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

  const handleAllClick = () => {};

  return (
    <div className={cn('w-full', 'flex flex-col gap-10 px-[20%] py-[10%]')}>
      <div className={cn('min-h-100', 'flex items-center justify-center')}>
        {/* Loading */}
        {(isLoading || isFetchingNextPage) && <LoadingCircle />}
        {/* Empty */}
        {!(isLoading || isFetchingNextPage) && bookTermList.length <= 0 && (
          <span className="font-semibold">Still Empty...</span>
        )}

        {/* List mode */}
        {!(isLoading || isFetchingNextPage) &&
          bookTermList.length > 0 &&
          mode === 'List' && (
            <div className="w-140 flex flex-col justify-center gap-3 ring-1 rounded-md p-6">
              {bookTermList.map((bookTerm, index) => {
                const count = index + 1;
                return (
                  <ContextMenu key={bookTerm.termId}>
                    <ContextMenuTrigger>
                      <Button
                        onClick={() => {
                          updateSelected((draft) => {
                            if (draft.has(index)) draft.delete(index);
                            else draft.add(index);
                          });
                        }}
                        variant="ghost"
                        key={index + '#' + bookTerm.name}
                        className="w-full flex flex-row items-center justify-between gap-x-10"
                      >
                        <div className="flex gap-x-4">
                          <span>
                            {count < 10 ? '0' + count : count.toString()}
                          </span>
                          <span>{bookTerm.name}</span>
                        </div>
                        {selected.size !== 0 && (
                          <Circle
                            className={cn(
                              selected.has(index)
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
                        {bookTerm.reviewCard ? 'Add review' : 'Cancel Review'}
                      </ContextMenuItem>
                      <ContextMenuItem>Move to</ContextMenuItem>
                      <ContextMenuItem>Modify</ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
