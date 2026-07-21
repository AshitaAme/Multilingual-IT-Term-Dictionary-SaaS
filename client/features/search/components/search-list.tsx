'use client';

import { Separator } from '@/shared/components/ui/separator';
import { useEffect, useRef, useState } from 'react';
import { getSearchListAction } from '../actions/get-search-list.action';
import { SearchItem } from '../types/search-item';
import { toast } from 'sonner';
import {
  useInputStore,
  useOpenTermStore,
  useSearchOptionsStore,
  useSearchStore,
} from '../stores/search.store';
import {
  MAX_SEARCH_LIST_QUERY_LENGTH,
  PAGE_SIZE,
} from '../constants/search.constants';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/utils/utils';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Circle, Star } from 'lucide-react';
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

  // For input and search
  const query = useSearchStore((state) => state.query);
  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);

  // For to open term
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const setTerm = useOpenTermStore((state) => state.setTerm);

  // For search list options
  const toSaveBook = useSearchOptionsStore((state) => state.toSaveBook);
  const selectMode = useSearchOptionsStore((state) => state.selectMode);
  const save = useSearchOptionsStore((state) => state.save);
  const setSave = useSearchOptionsStore((state) => state.setSave);
  const selectAll = useSearchOptionsStore((state) => state.selectAll);
  const setSelectAll = useSearchOptionsStore((state) => state.setSelectAll);
  const [isSavingMultiple, setIsSavingMultiple] = useState(false);

  // Used to fetch data for infinite scroll down
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['search-list', query, locale],

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
        }

        return res.data!;
      },

      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1;
      },
    });

  const queryClient = useQueryClient();
  const updateSave = (pageIndex: number, itemIndex: number, saved: boolean) => {
    const queryKey = ['search-list', query, locale];
    queryClient.setQueryData(queryKey, (oldData: typeof data) => {
      if (!oldData) return oldData;
      return produce(oldData, (draft: typeof data) => {
        draft!.pages[pageIndex][itemIndex].saved = !saved;
      });
    });
  };

  // Observe last node for infinite scroll down
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = (node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observerRef.current.observe(node);
  };

  // For using select all button in search options
  useEffect(() => {
    if (!data) return;
    if (!selectAll) return;
    const indexKeys = data.pages.flatMap((page, pageIndex) =>
      page.map((_, itemIndex) => `${pageIndex}#${itemIndex}`),
    );

    setSelectAll(false);
    updateSelected((draft) => {
      draft.clear();
      indexKeys.forEach((key) => draft.add(key));
    });
  }, [data, selectAll, setSelectAll, updateSelected]);

  // For using save button in search options
  useEffect(() => {
    if (!data) return;
    if (!save) return;
    const doSave = async () => {
      setIsSavingMultiple(true);
      const payload: SaveTermInput = [];
      selected.forEach((s) => {
        const tuple = s.split('#');
        const term = data.pages[Number(tuple[0])][Number(tuple[1])];
        payload.push({
          name: term.displayName,
          termId: term.termId,
          text: getTextFromTerm(term),
        });
      });

      if (payload && payload.length > 0) {
        const res = await saveTermAction(payload);
        if (!res.success) toast.error(res.error);
        else
          updateSelected((draft) => {
            draft.clear();
          });
      }
      setSave(false);
      setIsSavingMultiple(false);
    };
    doSave();
  }, [data, save, selected, setSave, updateSelected]);

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

  // Save / unsave the term
  const handleSaveClick = async (
    pageIndex: number,
    itemIndex: number,
    item: SearchItem,
  ) => {
    const indexKey = pageIndex + '#' + itemIndex;
    updateIsSaving((draft) => {
      draft.add(indexKey);
    });
    const { termId, displayName, saved } = item;

    if (item.saved) {
      const res = await unsaveTermAction(termId);
      if (!res.success) toast.error(res.error);
      else updateSave(pageIndex, itemIndex, saved);
    } else {
      const res = await saveTermAction([
        {
          termId,
          name: displayName,
          text: getTextFromTerm(item),
        },
      ]);
      if (!res.success) toast.error(res.error);
      else updateSave(pageIndex, itemIndex, saved);
    }

    updateIsSaving((draft) => {
      draft.delete(indexKey);
    });
  };

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
  if (isLoading) {
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
          page.map((item, itemIndex) => {
            const isLast = itemIndex === page.length - 1;
            const count = itemIndex + 1;
            const indexKey = pageIndex + '#' + itemIndex;

            return (
              <div key={item.termId} ref={isLast ? lastItemRef : undefined}>
                {itemIndex !== 0 && <Separator />}

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

        {/* Loading / No more */}
        <div className="h-10 pt-[14%] w-full flex items-center justify-center">
          {isFetchingNextPage && <LoadingCircle size={20} />}
          {!hasNextPage && !isLoading && (
            <span className="text-sm text-gray-400">
              {t('searchList.noMore')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
