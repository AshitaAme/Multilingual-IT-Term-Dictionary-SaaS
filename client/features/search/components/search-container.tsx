'use client';

import { SearchList } from './search-list';
import { SearchBox } from './search-box';

export function SearchContainer() {
  return (
    <div className="flex">
      <SearchBox />
      <SearchList />
    </div>
  );
}
