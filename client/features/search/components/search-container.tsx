'use client';

import { SearchBox } from './search-box';
import { SearchList } from './search-list';
import { SearchOptions } from './search-options';
import { TermInfo } from './term-info';

export function SearchContainer() {
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
