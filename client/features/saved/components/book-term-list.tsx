'use client';

import { toast } from 'sonner';
import { useBookOptionStore, useBookStore } from '../stores/saved.store';
import { useEffect, useMemo, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
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
import { deleteReviewAction } from '../actions/delete-review.action';
import { removeSaveAction } from '../actions/remove-save.action';
import { moveSaveAction } from '../actions/move-save.action';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';

export function BookTermList() {
  enableMapSet();
  const [bookTermList, setBookTermList] = useState<BookTerm[]>([]);
  const [selected, updateSelected] = useImmer<Set<string>>(new Set()); // savedTermId
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const finalPage = useMemo(
    () => Math.ceil(bookTermList.length / PAGE_SIZE),
    [bookTermList.length],
  );
  const [enterPage, setEnterPage] = useState(false);

  const bookId = useBookStore((state) => state.bookId);
  const isSelecting = useBookStore((state) => state.isSelecting);
  const setIsSelecting = useBookStore((state) => state.setIsSelecting);

  // const query = useBookOptionStore((state) => state.query);
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

  // Fetch book term list
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

  // All
  useEffect(() => {
    if (!all) return;
    updateSelected((draft) => {
      bookTermList.forEach((t) => !t.reviewCard && draft.add(t.savedTermId));
    });
    setAll(false);
  }, [all, bookTermList, setAll, updateSelected]);

  // Clear
  useEffect(() => {
    if (!clear) return;
    updateSelected((draft) => {
      draft.clear();
    });
    setClear(false);
  }, [clear, setClear, updateSelected]);

  // Review
  useEffect(() => {
    if (!review) return;
    if (!isSelecting) return;
    const addReview = async () => {
      const ids = [...selected];
      const res = await addReviewAction(ids);
      if (!res.success) toast.error(res?.error);
      setReview(false);
    };
    addReview();
  }, [bookTermList, isSelecting, review, selected, setReview]);

  // De-review
  useEffect(() => {
    if (!deReview) return;
    if (!isSelecting) return;
    const deleteReview = async () => {
      const ids = [...selected];
      const res = await deleteReviewAction(ids);
      if (!res.success) toast.error(res.error);
      setDeReview(false);
    };
    deleteReview();
  }, [bookTermList, deReview, isSelecting, selected, setDeReview]);

  // Remove
  useEffect(() => {
    if (!remove) return;
    if (!isSelecting) return;
    const removeSave = async () => {
      const ids = [...selected];
      const res = await removeSaveAction(ids);
      if (!res.success) toast.error(res.error);
      else {
        const newList = bookTermList.flatMap((t) =>
          selected.has(t.savedTermId) ? [] : [t],
        );
        setBookTermList(newList);
        updateSelected((draft) => {
          draft.clear();
        });
      }

      setRemove(false);
    };
    removeSave();
  }, [bookTermList, isSelecting, remove, selected, setRemove, updateSelected]);

  // Move to
  useEffect(() => {
    if (!moveTo) return;
    if (!isSelecting) return;
    const moveSave = async () => {
      const ids = [...selected];
      const res = await moveSaveAction({ moveTo, ids });
      if (!res.success) toast.error(res.error);
      else {
        const newList = bookTermList.flatMap((t) =>
          selected.has(t.savedTermId) ? [] : [t],
        );
        setBookTermList(newList);
        updateSelected((draft) => {
          draft.clear();
        });
      }

      setMoveTo('');
    };
    moveSave();
  }, [
    bookId,
    bookTermList,
    isSelecting,
    moveTo,
    selected,
    setMoveTo,
    updateSelected,
  ]);

  // Whether list is empty
  const isEmpty = useMemo(
    () => bookTermList.length === 0,
    [bookTermList.length],
  );

  return (
    <div className={cn('min-h-100', 'flex items-center justify-center')}>
      {/* Loading */}

      {isLoading && <LoadingCircle />}

      {/* Empty */}
      {!isLoading && isEmpty && (
        <span className="font-semibold">Still Empty...</span>
      )}

      {/* List mode */}
      {!isLoading && !isEmpty && mode === 'List' && (
        <div className="w-140 flex flex-col justify-center gap-3 ring-1 rounded-md p-6">
          {bookTermList.map((item, index) => {
            const count = index + 1;
            const inPage =
              count > (page - 1) * PAGE_SIZE && count <= page * PAGE_SIZE;
            console.log('page:', page);
            if (!inPage) return;
            const savedTermId = item.savedTermId;
            return (
              <ContextMenu key={savedTermId}>
                <ContextMenuTrigger>
                  <Button
                    variant="ghost"
                    className="w-full flex flex-row items-center justify-between gap-x-10"
                    onClick={() => {
                      if (selected.has(savedTermId)) {
                        if (selected.size === 1) setIsSelecting(false);
                        updateSelected((draft) => {
                          draft.delete(savedTermId);
                        });
                      } else {
                        if (selected.size === 0) setIsSelecting(true);
                        updateSelected((draft) => {
                          draft.add(savedTermId);
                        });
                      }
                    }}
                  >
                    <div className="flex gap-x-4">
                      <span>{count < 10 ? '0' + count : count.toString()}</span>
                      <span>{item.name}</span>
                    </div>
                    {selected.size !== 0 && (
                      <Circle
                        className={cn(
                          selected.has(savedTermId)
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
          <div className="flex gap-4 items-center justify-center pt-4">
            <Button
              disabled={page === 1}
              variant="ghost"
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft />
              <span>Last Page</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-md underline underline-offset-3"
              onClick={() => setEnterPage(true)}
            >
              {enterPage && <input></input>}
              {!enterPage && page}
            </Button>

            <Button
              disabled={page === finalPage}
              variant="ghost"
              onClick={() => setPage((prev) => prev + 1)}
            >
              <span>Next Page</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
