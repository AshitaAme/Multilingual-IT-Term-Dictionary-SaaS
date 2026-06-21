'use client';

import { useState } from 'react';
import { SearchList } from './search-list';
import { SearchMenu } from './search-menu';

export function SearchContainer() {
  const [query, setQuery] = useState('');
  return (
    <div className="flex">
      <SearchMenu setQuery={setQuery} />
      <SearchList query={query} />
    </div>
  );
}
