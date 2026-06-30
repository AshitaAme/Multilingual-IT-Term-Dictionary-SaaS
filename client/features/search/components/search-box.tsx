'use client';

import { Input } from '@/shared/components/ui/input';
import { Menu, Plus, SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useMemo, useState } from 'react';
import { useInputStore, useSearchStore } from '../stores/search.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/utils';
import { MAX_SEARCH_LIST_QUERY_LENGTH } from '../constants/search.constants';
import { TagMenu } from './tag-menu';

const SEARCH_PATH = '/search';

export function SearchBox({
  variant,
}: Readonly<{ variant?: 'navigation' | 'search' }>) {
  const t = useTranslations('nav');
  const setQuery = useSearchStore((state) => state.setQuery);
  const isSearch = useMemo(() => variant === 'search', [variant]);
  const [navInput, setNavInput] = useState(''); // for navigation mode
  const input = useInputStore((state) => state.input); // shared by SearchList
  const setInput = useInputStore((state) => state.setInput);
  const router = useRouter();
  const [openTagMenu, setOpenTagMenu] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isSearch) setInput(e.target.value);
    else setNavInput(e.target.value);
  };

  const handleSearch = () => {
    if (isSearch) {
      setQuery(input);
      setInput('');
    } else {
      setQuery(navInput);
      setNavInput('');
    }
    if (!isSearch) router.push(SEARCH_PATH);
  };

  return (
    <div className={cn(isSearch ? 'w-120 h-10' : 'w-45 h-8', 'relative')}>
      <Input
        className={cn(
          'w-full h-full ring-1 ring-foreground/40 focus:ring-foreground border-0',
          isSearch ? 'pl-3 pr-10 rounded-3xl' : 'pl-3 pr-8 rounded-xl ',
          'focus:',
        )}
        placeholder={t('search')}
        value={isSearch ? input : navInput}
        onChange={handleInputChange}
        maxLength={MAX_SEARCH_LIST_QUERY_LENGTH}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSearch();
          }
        }}
      />

      <TagMenu isSearch={isSearch} />
    </div>
  );
}
