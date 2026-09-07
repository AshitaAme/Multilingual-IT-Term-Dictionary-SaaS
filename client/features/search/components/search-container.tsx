'use client';

import { useEffect } from 'react';
import { SearchBox } from './search-box';
import { SearchList } from './search-list';
import { SearchOptions } from './search-options';
import { TermInfo } from './term-info';
import { useSearchStore } from '../stores/search.store';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setQuery = useSearchStore((state) => state.setQuery);

  useEffect(() => {
    const tagParam = searchParams.get('tag');

    if (tagParam) {
      setQuery(tagParam === 'All' ? '' : tagParam);
      router.replace('/search');
    }
  }, [searchParams, setQuery, router]);

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
