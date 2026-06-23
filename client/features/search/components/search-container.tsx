'use client';

import { SearchBox } from './search-box';
import { SearchList } from './search-list';

export function SearchContainer() {
  return (
    <div className="flex flex-col items-center justify-center gap-13 pt-[5%] pb-[10%] px-[20%] lg:px-[30%] w-full">
      <SearchBox variant="search" />
      <SearchList />
    </div>
  );
}
