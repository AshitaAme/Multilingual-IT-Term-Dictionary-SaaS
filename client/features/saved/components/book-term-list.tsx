'use client';

import { toast } from 'sonner';
import { useBookOptionStore, useBookStore } from '../stores/saved.store';
import { useEffect, useMemo, useState } from 'react';
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
import { addReviewAction } from '../actions/add-review.action';

export function BookTermList() {
  enableMapSet();
  const [bookTermList, setBookTermList] = useState<BookTerm[]>([]);
  const [selected, updateSelected] = useImmer<Set<number>>(new Set()); // pageIndex#itemIndex
  const [isLoading, setIsLoading] = useState(true);

  const bookId = useBookStore((state) => state.bookId);
  const setIsSelecting = useBookStore((state) => state.setIsSelecting);

  const query = useBookOptionStore((state) => state.query);
  const mode = useBookOptionStore((state) => state.mode);
  const all = useBookOptionStore((state) => state.all);
  const clear = useBookOptionStore((state) => state.clear);
  const review = useBookOptionStore((state) => state.review);
  const deReview = useBookOptionStore((state) => state.deReview);
  const moveTo = useBookOptionStore((state) => state.moveTo);
  const remove = useBookOptionStore((state) => state.remove);

  const setAll = useBookOptionStore((state) => state.setAll);
  const setClear = useBookOptionStore((state) => state.setClear);
  const setRemove = useBookOptionStore((state) => state.setRemove);
  const setReview = useBookOptionStore((state) => state.setReview);
  const setDeReview = useBookOptionStore((state) => state.setDeReview);
  const setMoveTo = useBookOptionStore((state) => state.setMoveTo);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      const res = await getBookTermListAction(bookId);
      if (!res.success) toast.error(res.error);
      else setBookTermList(res.data!);
      setIsLoading(false);
    };
    fetchPage();
  }, [bookId]);

  useEffect(() => {
    if (!all) return;
    updateSelected((draft) => {
      bookTermList.forEach((_, i) => draft.add(i));
    });
    setAll(false);
  }, [all, bookTermList, setAll, updateSelected]);

  useEffect(() => {
    if (!clear) return;
    updateSelected((draft) => {
      draft.clear();
    });
    setClear(false);
  }, [clear, setClear, updateSelected]);

  useEffect(() => {
    if (!review) return;
    const addReview = async () => {
      const ids = bookTermList.flatMap((t, i) =>
        selected.has(i) ? [t.savedTermId] : [],
      );
      const res = await addReviewAction(ids);
    };
  }, [bookTermList, review, selected]);

  useEffect(() => {
    if (!deReview) return;
  }, [deReview]);

  useEffect(() => {
    if (!remove) return;
  }, [remove]);

  useEffect(() => {
    if (!moveTo) return;
  }, [moveTo]);

  const isEmpty = useMemo(
    () => bookTermList.length === 0,
    [bookTermList.length],
  );

  return (
    <div className={cn('w-full', 'flex flex-col gap-10 px-[20%] py-[10%]')}>
      <div className={cn('min-h-100', 'flex items-center justify-center')}>
        {/* Loading */}

        {isLoading && <LoadingCircle />}

        {/* Empty */}
        {!isLoading && isEmpty && (
          <span className="font-semibold">Still Empty...</span>
        )}

        {/* List mode */}
        {!isLoading && isEmpty && mode === 'List' && (
          <div className="w-140 flex flex-col justify-center gap-3 ring-1 rounded-md p-6">
            {bookTermList.map((item, index) => {
              const count = index + 1;
              return (
                <ContextMenu key={item.termId}>
                  <ContextMenuTrigger>
                    <Button
                      onClick={() => {
                        updateSelected((draft) => {
                          if (draft.has(index)) {
                            draft.delete(index);
                            if (draft.size === 0) setIsSelecting(false);
                          } else {
                            draft.add(index);
                            if (draft.size === 1) setIsSelecting(true);
                          }
                        });
                      }}
                      variant="ghost"
                      key={index + '#' + item.name}
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
                      {item.reviewCard ? 'Add review' : 'Cancel Review'}
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
