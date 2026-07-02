'use client';

import { Separator } from '@/shared/components/ui/separator';
import { useMemo, useRef } from 'react';
import { getSearchListAction } from '../actions/get-search-list.action';
import { SearchItem } from '../types/search-item';
import { toast } from 'sonner';
import {
  useInputStore,
  useOpenTermStore,
  useSearchStore,
} from '../stores/search.store';
import { MAX_SEARCH_LIST_QUERY_LENGTH } from '../constants/search.constants';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/utils/utils';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

import { useInfiniteQuery } from '@tanstack/react-query';

export function SearchList() {
  const query = useSearchStore((state) => state.query);
  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);
  const setOpenTerm = useOpenTermStore((state) => state.setOpenTerm);
  const setTerm = useOpenTermStore((state) => state.setTerm);
  const theme = useTheme();

  const PAGE_SIZE = 100;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['search-list', query],
      initialPageParam: 1,

      queryFn: async ({ pageParam = 1 }) => {
        const res = await getSearchListAction({
          page: pageParam,
          query: query.trim(),
        });

        if (!res.success) {
          toast.error(res.error);
          throw new Error(res.error);
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

  const handleTermClick = (item: SearchItem) => {
    setTerm(item);
    setOpenTerm(true);
  };

  const handleTagClick = (tagName: string) => {
    const newInput = input + tagName + ' ';
    if (newInput.length <= MAX_SEARCH_LIST_QUERY_LENGTH) setInput(newInput);
  };

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

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <LoadingCircle size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex w-full flex-col text-sm">
        {searchList.map((item, index) => {
          const isLast = index === searchList.length - 1;

          return (
            <div
              key={index + '#' + item.termId}
              ref={isLast ? lastItemRef : undefined}
            >
              {index !== 0 && <Separator />}

              <div
                onClick={() => handleTermClick(item)}
                className={cn(
                  'w-full rounded-sm px-4 flex gap-8 py-3 cursor-pointer',
                  theme.theme === 'dark'
                    ? 'hover:backdrop-brightness-125'
                    : 'hover:backdrop-brightness-97',
                )}
              >
                <div className="flex items-center text-left">
                  {item.displayName}
                </div>

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
          );
        })}

        {/* loading / end state */}
        <div className="h-10 pt-10 w-full flex items-center justify-center">
          {isFetchingNextPage && <LoadingCircle size={20} />}
          {!hasNextPage && !isLoading && (
            <span className="text-sm text-gray-400">No more...</span>
          )}
        </div>
      </div>
    </div>
  );
}
