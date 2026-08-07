'use client';

import { toast } from 'sonner';
import {
  useBookOptionStore,
  useBookStore,
  useSavedStore,
} from '../stores/saved.store';
import { useEffect, useMemo, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, Circle, ClockPlus } from 'lucide-react';
import { useImmer } from 'use-immer';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/shared/components/ui/context-menu';
import { enableMapSet } from 'immer';
import { addReviewAction } from '../actions/add-review.action';
import { deleteReviewAction } from '../actions/delete-review.action';
import { removeSaveAction } from '../actions/remove-save.action';
import { moveSaveAction } from '../actions/move-save.action';
import { PAGE_SIZE } from '@/features/search/constants/search.constants';
import { useTranslations } from 'next-intl';

export function BookTermList() {
  const t = useTranslations('saved.bookTermList');
  enableMapSet();

  // Book status
  const bookId = useBookStore((state) => state.bookId);
  const [bookTermList, updateBookTermList] = useImmer<BookTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSelecting = useBookStore((state) => state.isSelecting);
  const setIsSelecting = useBookStore((state) => state.setIsSelecting);

  // Context menu operations
  const [isOperating, setIsOperating] = useState('');
  const savedBooks = useSavedStore((state) => state.savedBooks);

  // Book term operation options
  const [selected, updateSelected] = useImmer<Set<string>>(new Set()); // savedTermId
  const query = useBookOptionStore((state) => state.query);
  const mode = useBookOptionStore((state) => state.mode);
  const all = useBookOptionStore((state) => state.all);
  const clear = useBookOptionStore((state) => state.clear);
  const doReview = useBookOptionStore((state) => state.doReview);
  const deReview = useBookOptionStore((state) => state.deReview);
  const moveTo = useBookOptionStore((state) => state.moveTo);
  const remove = useBookOptionStore((state) => state.remove);
  const setAll = useBookOptionStore((state) => state.setAll);
  const setClear = useBookOptionStore((state) => state.setClear);
  const setRemove = useBookOptionStore((state) => state.setRemove);
  const setDoReview = useBookOptionStore((state) => state.setDoReview);
  const setDeReview = useBookOptionStore((state) => state.setDeReview);
  const setMoveTo = useBookOptionStore((state) => state.setMoveTo);

  // Fetch book term list
  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      const res = await getBookTermListAction(bookId);
      if (!res.success) toast.error(res.error);
      else updateBookTermList(() => res.data!);
      setIsLoading(false);
    };
    fetchPage();
  }, [bookId, updateBookTermList]);

  // Filter result by query
  const filteredList = useMemo(
    () => bookTermList.filter((t) => t.name.includes(query)),
    [bookTermList, query],
  );

  // Pagination
  const [page, setPage] = useState(1);
  const finalPage = useMemo(
    () => Math.ceil(filteredList.length / PAGE_SIZE),
    [filteredList.length],
  );
  const [enterPage, setEnterPage] = useState(false);
  const [pageInput, setPageInput] = useState('');

  // All
  useEffect(() => {
    if (!all) return;
    updateSelected((draft) => {
      bookTermList.forEach((t) => draft.add(t.savedTermId));
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
    setIsSelecting(false);
  }, [clear, setClear, setIsSelecting, updateSelected]);

  // Do-review
  useEffect(() => {
    if (!doReview) return;
    if (!isSelecting) return;
    const addReview = async () => {
      const ids = [...selected];
      const res = await addReviewAction(ids);
      if (!res.success) toast.error(res?.error);
      else {
        updateBookTermList((draft) =>
          draft.forEach((t) => {
            if (selected.has(t.savedTermId)) {
              t.reviewCard = res.data!.get(t.savedTermId);
            }
          }),
        );
        updateSelected((draft) => {
          draft.clear();
        });
      }

      setDoReview(false);
      setIsSelecting(false);
    };
    addReview();
  }, [
    bookTermList,
    isSelecting,
    doReview,
    selected,
    setDoReview,
    setIsSelecting,
    updateBookTermList,
    updateSelected,
  ]);

  // De-review
  useEffect(() => {
    if (!deReview) return;
    if (!isSelecting) return;
    const deleteReview = async () => {
      const ids = [...selected];
      const res = await deleteReviewAction(ids);
      if (!res.success) toast.error(res.error);
      else {
        updateBookTermList((draft) =>
          draft.forEach((t) => {
            if (selected.has(t.savedTermId)) {
              t.reviewCard = null;
            }
          }),
        );
        updateSelected((draft) => {
          draft.clear();
        });
      }
      setDeReview(false);
      setIsSelecting(false);
    };
    deleteReview();
  }, [
    bookTermList,
    deReview,
    isSelecting,
    selected,
    setDeReview,
    setIsSelecting,
    updateBookTermList,
    updateSelected,
  ]);

  // Remove
  useEffect(() => {
    if (!remove) return;
    if (!isSelecting) return;
    const removeSave = async () => {
      const ids = [...selected];
      const res = await removeSaveAction(ids);
      if (!res.success) toast.error(res.error);
      else {
        updateBookTermList((draft) =>
          draft.filter((t) => !selected.has(t.savedTermId)),
        );

        updateSelected((draft) => {
          draft.clear();
        });
      }
      setRemove(false);
      setIsSelecting(false);
    };
    removeSave();
  }, [
    bookTermList,
    isSelecting,
    remove,
    selected,
    setIsSelecting,
    setRemove,
    updateBookTermList,
    updateSelected,
  ]);

  // Move to
  useEffect(() => {
    if (!moveTo) return;
    if (!isSelecting) return;
    const moveSave = async () => {
      const ids = [...selected];
      const res = await moveSaveAction({ moveTo, ids });
      if (!res.success) toast.error(res.error);
      else {
        updateBookTermList((draft) =>
          draft.filter((t) => !selected.has(t.savedTermId)),
        );

        updateSelected((draft) => {
          draft.clear();
        });
      }
      setMoveTo('');
      setIsSelecting(false);
    };
    moveSave();
  }, [
    bookId,
    bookTermList,
    isSelecting,
    moveTo,
    selected,
    setIsSelecting,
    setMoveTo,
    updateBookTermList,
    updateSelected,
  ]);

  // Check emptiness of list
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
        <span className="font-semibold">{t('stillEmpty')}</span>
      )}

      {/* List mode */}
      {!isLoading && !isEmpty && mode === 'List' && (
        <div className="w-140 flex flex-col justify-center gap-3 ring-1 rounded-md p-6">
          {filteredList.map((item, index) => {
            // 1. Filter by page
            const count = index + 1;
            const inPage =
              count > (page - 1) * PAGE_SIZE && count <= page * PAGE_SIZE;
            console.log('page:', page);
            if (!inPage) return;

            // 2. Status of the item
            const inReview = item.reviewCard !== null;
            const savedTermId = item.savedTermId;
            const inOperation =
              isOperating === savedTermId ||
              (selected.has(savedTermId) &&
                (remove || doReview || deReview || !!moveTo));

            return (
              // Use context menu to operate each item separately
              <ContextMenu key={savedTermId}>
                <ContextMenuTrigger>
                  {/* Item button */}
                  <Button
                    disabled={inOperation}
                    variant="ghost"
                    className="w-full flex flex-row items-center justify-between gap-x-10"
                    onClick={() => {
                      // Select the item
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
                    {/* Item basic info */}
                    <div className="flex gap-x-4">
                      <span>{count < 10 ? '0' + count : count.toString()}</span>
                      <span>{item.name}</span>
                      {inReview && <ClockPlus />}
                    </div>

                    {/* Mark for selected status */}
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

                {/* Operations */}
                <ContextMenuContent className="p-2 flex flex-col gap-1">
                  {/* Remove */}
                  <ContextMenuItem
                    className="hover:bg-muted-foreground/20!"
                    onClick={async () => {
                      setIsOperating(savedTermId);
                      const res = await removeSaveAction([savedTermId]);
                      if (!res.success) toast.error(res.error);
                      else
                        updateBookTermList((draft) =>
                          draft.filter((t) => t.savedTermId !== savedTermId),
                        );
                      setIsOperating('');
                    }}
                  >
                    {t('remove')}
                  </ContextMenuItem>

                  {/* Add/Delete review */}
                  <ContextMenuItem
                    className="hover:bg-muted-foreground/20!"
                    onClick={async () => {
                      setIsOperating(savedTermId);
                      if (!inReview) {
                        const res = await addReviewAction([savedTermId]);
                        if (!res.success) toast.error(res.error);
                        else
                          updateBookTermList((draft) =>
                            draft.map((t) =>
                              t.savedTermId !== savedTermId
                                ? t
                                : {
                                    ...t,
                                    reviewCards: res.data!.get(savedTermId),
                                  },
                            ),
                          );
                      } else {
                        const res = await deleteReviewAction([savedTermId]);
                        if (!res.success) toast.error(res.error);
                        else
                          updateBookTermList((draft) =>
                            draft.map((t) =>
                              t.savedTermId !== savedTermId
                                ? t
                                : { ...t, reviewCards: null },
                            ),
                          );
                      }
                      setIsOperating('');
                    }}
                  >
                    {!inReview ? t('doReview') : t('deReview')}
                  </ContextMenuItem>

                  {/* Move to */}
                  <ContextMenuSub>
                    <ContextMenuSubTrigger className="hover:bg-muted-foreground/20!">
                      {t('moveTo')}
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent
                      sideOffset={8}
                      className="p-2 flex flex-col gap-1"
                    >
                      {savedBooks.map((book) => {
                        if (book.id === bookId) return;
                        return (
                          <ContextMenuItem
                            className="hover:bg-muted-foreground/20!"
                            key={book.id}
                            onClick={async () => {
                              setIsOperating(savedTermId);
                              const res = await moveSaveAction({
                                moveTo,
                                ids: [savedTermId],
                              });
                              if (!res.success) toast.error(res.error);
                              else
                                updateBookTermList((draft) =>
                                  draft.filter(
                                    (t) => t.savedTermId !== savedTermId,
                                  ),
                                );
                              setIsOperating('');
                            }}
                          >
                            {book.name}
                          </ContextMenuItem>
                        );
                      })}
                    </ContextMenuSubContent>
                  </ContextMenuSub>

                  <ContextMenuItem className="hover:bg-muted-foreground/20!">
                    {t('modify')}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}

          {/* Turning page */}
          <div className="w-full flex gap-6 items-center justify-center pt-4">
            {/* Prev */}
            <Button
              disabled={page === 1}
              variant="ghost"
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft />
              <span>{t('prev')}</span>
            </Button>

            {/* Page number */}
            <div className="flex items-center">
              {[...new Array(finalPage).keys()].map((i) => {
                const pageNum = i + 1;
                const totalLeft =
                  pageNum === 1 || pageNum === finalPage ? 5 : 4;
                const lastLeft = Math.min(page - 1, 2);
                const nextLeft = totalLeft - lastLeft;
                let content: 'ellipsis' | 'number' | null = 'number';
                if (pageNum !== 1 && pageNum !== finalPage) {
                  if (page - pageNum === lastLeft + 1) content = 'ellipsis';
                  if (page - pageNum > lastLeft + 1) content = null;
                  if (pageNum - page === nextLeft + 1) content = 'ellipsis';
                  if (pageNum - page > nextLeft + 1) content = null;
                }
                if (content === null) return;
                const ellipsisEnter = enterPage && content === 'ellipsis';

                return (
                  <Button
                    key={pageNum}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      ellipsisEnter && 'pointer-events-none',
                      pageNum === page || ellipsisEnter
                        ? 'opacity-100'
                        : 'opacity-50 hover:opacity-100',
                    )}
                    onClick={() => {
                      if (content === 'ellipsis') setEnterPage(true);
                      else setPage(pageNum);
                    }}
                  >
                    {content === 'number' && pageNum}
                    {content === 'ellipsis' && !enterPage && '...'}
                    {content === 'ellipsis' && enterPage && (
                      <input
                        className="w-full h-full rounded-lg p-2 outline-0 focus:ring-1 ring-foreground"
                        autoFocus
                        onBlur={() => setEnterPage(false)}
                        key={pageNum}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (!Number.isInteger(Number(pageInput))) return;
                            const newPage = Number(pageInput);
                            if (newPage < 1 || newPage > finalPage) return;
                            setPage(newPage);
                            setEnterPage(false);
                          }
                        }}
                      />
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Next page */}
            <Button
              disabled={page === finalPage}
              variant="ghost"
              onClick={() => setPage((prev) => prev + 1)}
            >
              <span>{t('next')}</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
