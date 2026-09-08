'use client';

import { useEffect } from 'react';
import { SearchBox } from './search-box';
import { SearchList } from './search-list';
import { SearchOptions } from './search-options';
import { TermInfo } from './term-info';
import { useInputStore, useSearchStore } from '../stores/search.store';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setQuery = useSearchStore((state) => state.setQuery);
  const setInput = useInputStore((state) => state.setInput);

  useEffect(() => {
    const tagParam = searchParams.get('tag');

    if (tagParam) {
      const param = tagParam === 'All' ? '' : tagParam;
      setQuery(param);
      setInput(param);

      router.replace('/search');
    }
  }, [searchParams, setQuery, router, setInput]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-10 pt-[5%] pb-[10%] px-[20%] lg:px-[30%] w-full">
        <SearchBox variant="search" />
        <SearchOptions />
        <SearchList />
      </div>
      <TermInfo />
    </div>
  );
}
