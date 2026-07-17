'use client';

import { Separator } from '@/shared/components/ui/separator';
import { useMemo, useRef, useState } from 'react';
import { getSearchListAction } from '../actions/get-search-list.action';
import { SearchItem } from '../types/search-item';
import { toast } from 'sonner';
import {
  useInputStore,
  useOpenTermStore,
  useSearchStore,
} from '../stores/search.store';
import {
  MAX_SEARCH_LIST_QUERY_LENGTH,
  PAGE_SIZE,
} from '../constants/search.constants';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/utils/utils';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { saveTermAction } from '../actions/save-term.action';
import { getTextFromTerm } from '../utils/get-text-from-term';
import { unsaveTermAction } from '../actions/unsave-term.action';

export function SearchList() {
  const t = useTranslations('search');
  const locale = useLocale();
  const query = useSearchStore((state) => state.query);
  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const setTerm = useOpenTermStore((state) => state.setTerm);
  const theme = useTheme();
  const [isTogglingStar, setIsTogglingStar] = useState<number | null>(null);

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

  const searchList = useMemo(() => {
    return data?.pages.flat() ?? [];
  }, [data]);

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

  // Save the term
  const handleSaveClick = async (item: SearchItem, index: number) => {
    setIsTogglingStar(index);
    const { termId, displayName, saved } = item;
    if (item.saved) {
      const res = await unsaveTermAction(termId);
      if (!res.success) toast.error(res.error);
      else
        searchList.forEach((item, i) => {
          if (i === index) item.saved = !saved;
        });
    } else {
      const res = await saveTermAction({
        termId,
        name: displayName,
        text: getTextFromTerm(item),
      });
      if (!res.success) toast.error(res.error);
      else
        searchList.forEach((item, i) => {
          if (i === index) item.saved = !saved;
        });
    }

    setIsTogglingStar(null);
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
        {searchList.map((item, index) => {
          const isLast = index === searchList.length - 1;
          const count = index + 1;

          return (
            <div
              key={index + '#' + item.termId}
              ref={isLast ? lastItemRef : undefined}
            >
              {index !== 0 && <Separator />}

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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveClick(item, index);
                    }}
                    disabled={isTogglingStar === index}
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
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / No more */}
        <div className="h-10 pt-[12%] w-full flex items-center justify-center">
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
