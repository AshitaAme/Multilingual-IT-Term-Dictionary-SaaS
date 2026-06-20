'use client';

import { SearchList } from './search-list';
import { SearchMenu } from './search-menu';

export function SearchContainer() {
  return (
    <div className="flex">
      <SearchMenu />
      <SearchList />
    </div>
  );
}
