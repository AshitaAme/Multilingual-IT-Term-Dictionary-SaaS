'use client';

import { Separator } from '@/shared/components/ui/separator';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSearchListAction } from '../actions/get-search-list.action';
import { SearchItem } from '../types/search-item';
import { toast } from 'sonner';
import {
  useInputStore,
  useOpenTermStore,
  useSearchOptionStore,
  useSearchStore,
} from '../stores/search.store';
import {
  MAX_SEARCH_LIST_QUERY_LENGTH,
  MAX_SELECT_SIZE,
  PAGE_SIZE,
} from '../constants/search.constants';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/utils/utils';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Circle, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { saveTermAction } from '../actions/save-term.action';
import { getTextFromTerm } from '../utils/get-text-from-term';
import { unsaveTermAction } from '../actions/unsave-term.action';
import { produce, enableMapSet } from 'immer';
import { useImmer } from 'use-immer';
import { SaveTermInput } from '../schemas/save-term.schema';

export function SearchList() {
  const t = useTranslations('search');
  enableMapSet();
  const locale = useLocale();
  const theme = useTheme();
  const [isSaving, updateIsSaving] = useImmer<Set<string>>(new Set()); // key: pageIndex#itemIndex
  const [selected, updateSelected] = useImmer<Set<string>>(new Set()); // key: pageIndex#itemIndex
  const [curPageIndex, setCurPageIndex] = useState(0);

  // For input and search
  const query = useSearchStore((state) => state.query);
  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);

  // For to open term
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const setTerm = useOpenTermStore((state) => state.setTerm);

  // For search list options
  const toSaveBook = useSearchOptionStore((state) => state.toSaveBook);
  const layout = useSearchOptionStore((state) => state.layout);
  const selectMode = useSearchOptionStore((state) => state.selectMode);
  const doSave = useSearchOptionStore((state) => state.doSave);
  const setDoSave = useSearchOptionStore((state) => state.setDoSave);
  const selectAll = useSearchOptionStore((state) => state.selectAll);
  const setSelectAll = useSearchOptionStore((state) => state.setSelectAll);

  // Used to fetch data for infinite scroll down
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ['search-list', query, locale],
    [locale, query],
  );
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey,
      initialPageParam: 1,
      queryFn: async ({ pageParam = 1 }) => {
        const res = await getSearchListAction({
          page: pageParam,
          query: query.trim(),
          locale,
        });

        if (!res.success) {
          // Filter other error messages
          if (res.error === t('searchList.error.queryTooLong'))
            toast.error(res.error);
          else toast.error(t('searchList.error.somethingWentWrong'));
          throw new Error(res.error);
        }

        return res.data || [];
      },

      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1;
      },
    });

  // Give value to "saved" key in term, or toggle the original
  const updateSave = useCallback(
    (pageIndex: number, itemIndex: number, save?: boolean) => {
      queryClient.setQueryData(queryKey, (oldData: typeof data) => {
        if (!oldData) return undefined;
        return produce(oldData, (draft: typeof data) => {
          const update = save ?? draft!.pages[pageIndex][itemIndex].saved;
          draft!.pages[pageIndex][itemIndex].saved = update;
        });
      });
    },
    [queryClient, queryKey],
  );

  // Observe last node for infinite scroll down
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = (node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;
    if (layout === 'Page') return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observerRef.current.observe(node);
  };

  // Select all terms
  useEffect(() => {
    if (!data) return;
    if (!selectAll) return;
    const selectedIndexKeys =
      layout === 'Scroll'
        ? data.pages.flatMap((page, pageIndex) =>
            page.map((item, itemIndex) =>
              item.saved ? undefined : `${pageIndex}#${itemIndex}`,
            ),
          )
        : data.pages[curPageIndex].map((item, itemIndex) =>
            item.saved ? undefined : `${curPageIndex}#${itemIndex}`,
          );
    if (selectedIndexKeys.length > MAX_SELECT_SIZE) {
      toast.error('Please select not over ' + MAX_SELECT_SIZE);
      return;
    }

    updateSelected((draft) => {
      draft.clear();
      selectedIndexKeys.forEach((key) => key && draft.add(key));
    });
    console.log('selected: ', selected);
    setSelectAll(false);
  }, [
    curPageIndex,
    data,
    layout,
    selectAll,
    selected,
    setSelectAll,
    updateSelected,
  ]);

  // Save selected terms
  useEffect(() => {
    if (!data) return;
    if (!doSave) return;
    const startSave = async () => {
      const payload: SaveTermInput = [];

      selected.forEach((s) => {
        const [pageIndex, itemIndex] = s.split('#');
        const term = data.pages[Number(pageIndex)][Number(itemIndex)];
        updateIsSaving((draft) => {
          draft.add(s);
        });
        payload.push({
          savedBookId: toSaveBook.id || 'Default',
          name: term.displayName,
          termId: term.termId,
          text: getTextFromTerm(term),
        });
      });

      if (payload && payload.length > 0) {
        const res = await saveTermAction(payload);
        if (!res.success) toast.error(res.error);
        else {
          selected.forEach((s) => {
            const [pageIndex, itemIndex] = s.split('#');
            updateSave(Number(pageIndex), Number(itemIndex), true);
          });
          updateSelected((draft) => {
            draft.clear();
          });
        }
        updateIsSaving((draft) => {
          draft.clear();
        });
      }

      setDoSave(false);
    };
    startSave();
  }, [
    data,
    doSave,
    selected,
    setDoSave,
    toSaveBook.id,
    updateSave,
    updateIsSaving,
    updateSelected,
  ]);

  // Open TermInfo
  const handleTermClick = (item: SearchItem) => {
    setTerm(item);
    setOpenTerm(true);
  };

  // Add tag to query
  const handleTagClick = (tagName: string) => {
    const newInput = input + tagName + ' ';
    if (newInput.length <= MAX_SEARCH_LIST_QUERY_LENGTH) setInput(newInput);
  };

  // Save / unsave terms
  const handleSaveClick = async (
    pageIndex: number,
    itemIndex: number,
    item: SearchItem,
  ) => {
    const indexKey = pageIndex + '#' + itemIndex;
    updateIsSaving((draft) => {
      draft.add(indexKey);
    });
    const { termId, displayName } = item;

    if (item.saved) {
      const res = await unsaveTermAction(termId);
      if (!res.success) toast.error(res.error);
      else updateSave(pageIndex, itemIndex);
    } else {
      const res = await saveTermAction([
        {
          savedBookId: toSaveBook.id || 'Default',
          termId,
          name: displayName,
          text: getTextFromTerm(item),
        },
      ]);
      if (!res.success) toast.error(res.error);
      else updateSave(pageIndex, itemIndex);
    }

    updateIsSaving((draft) => {
      draft.delete(indexKey);
    });
  };

  // Select terms
  const handleSelectClick = (indexKey: string) => {
    updateSelected((draft) => {
      if (draft.has(indexKey)) {
        draft.delete(indexKey);
      } else {
        draft.add(indexKey);
      }
    });
  };

  // Loading while fetching data
  if (isLoading || (layout === 'Page' && isFetchingNextPage)) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <LoadingCircle size={20} />
      </div>
    );
  }

  // Content
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex w-full flex-col text-sm">
        {data?.pages.map((page, pageIndex) =>
          layout === 'Page' && pageIndex !== curPageIndex
            ? ''
            : page.map((item, itemIndex) => {
                const isLast = itemIndex === page.length - 1;
                const count = pageIndex * PAGE_SIZE + itemIndex + 1;
                const indexKey = pageIndex + '#' + itemIndex;

                return (
                  <div
                    key={item.termId}
                    ref={
                      isLast && layout === 'Scroll' ? lastItemRef : undefined
                    }
                  >
                    {count !== 1 && <Separator />}

                    {/* Term name */}
                    <div
                      onClick={() => handleTermClick(item)}
                      className={cn(
                        'w-full rounded-sm px-4 flex gap-8 py-3 ',
                        theme.theme === 'dark'
                          ? 'hover:backdrop-brightness-125'
                          : 'hover:backdrop-brightness-97',
                      )}
                    >
                      <div className="flex items-center text-left gap-5 font-semibold">
                        <span className="font-normal text-foreground/50">
                          {count < 10 ? `0${count}` : `${count}`}
                        </span>
                        <span>{item.displayName}</span>
                      </div>

                      {/* Tags for each term */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {item.tags.map((tag) => (
                          <button
                            key={tag.name}
                            className="rounded-4xl px-2 py-0.5 text-sm font-medium  transition-colors hover:opacity-80"
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

                      {/* Save */}
                      <div className="flex flex-2 items-center justify-end ">
                        {selectMode === 'Single' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveClick(pageIndex, itemIndex, item);
                            }}
                            disabled={isSaving.has(indexKey)}
                          >
                            <Star
                              size={16}
                              className={cn(
                                item.saved
                                  ? 'fill-yellow-400 text-yellow-400 transition-colors'
                                  : '',
                              )}
                            />
                          </Button>
                        )}

                        {selectMode === 'Multiple' && (
                          <Button
                            disabled={item.saved}
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectClick(indexKey);
                            }}
                          >
                            <Circle
                              size={16}
                              className={cn(
                                selected.has(indexKey) || item.saved
                                  ? 'fill-foreground'
                                  : 'text-background',
                                'rounded-full ring-1 ring-foreground ',
                              )}
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }),
        )}

        {/* Page */}
        {layout === 'Page' && (
          <div className="h-10 pt-[14%] flex flex-row gap-12 items-center justify-center font-semibold">
            <Button
              disabled={curPageIndex <= 0}
              variant="ghost"
              className="flex items-center justify-center gap-2"
              onClick={() => setCurPageIndex((prev) => prev - 1)}
            >
              <ChevronLeft />
              <span className="font-semibold">Last Page</span>
            </Button>
            <span className="flex items-center justify-center">
              {curPageIndex + 1}
            </span>
            <Button
              disabled={
                (curPageIndex === data!.pages.length - 1 && !hasNextPage) ||
                isFetchingNextPage
              }
              variant="ghost"
              className="flex items-center justify-center gap-2"
              onClick={async () => {
                if (curPageIndex + 1 === data?.pages.length)
                  await fetchNextPage();
                setCurPageIndex((prev) => prev + 1);
              }}
            >
              <span>Next Page</span>
              <ChevronRight />
            </Button>
          </div>
        )}

        {/* Scroll: Loading / No more */}
        {layout === 'Scroll' && (
          <div className="h-10 pt-[14%] w-full flex items-center justify-center">
            {isFetchingNextPage && <LoadingCircle size={20} />}
            {!hasNextPage && !isLoading && (
              <span className="text-sm text-gray-400">
                {t('searchList.noMore')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
