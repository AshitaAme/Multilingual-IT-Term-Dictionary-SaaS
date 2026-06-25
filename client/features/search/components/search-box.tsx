'use client';

import { Input } from '@/shared/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useMemo, useState } from 'react';
import { useInputStore, useSearchStore } from '../stores/search.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/utils';
import { MAX_INPUT_LENGTH } from '../constants/search.constants';

const SEARCH_PATH = '/search';

export function SearchBox({
  variant,
}: Readonly<{ variant?: 'navigation' | 'search' }>) {
  const t = useTranslations('nav');
  const setQuery = useSearchStore((state) => state.setQuery);
  const isSearch = useMemo(() => variant === 'search', [variant]);
  const [navInput, setNavInput] = useState('');
  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);
  const router = useRouter();

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
    <div className={cn(isSearch ? 'w-120 h-10' : 'w-50 h-8', 'relative')}>
      <Input
        className={cn(
          'w-full h-full rounded-xl ring-1 ring-foreground/40 focus:ring-foreground border-0',
          isSearch ? 'pr-9' : 'pr-7',
          'focus:',
        )}
        placeholder={t('search')}
        value={isSearch ? input : navInput}
        onChange={handleInputChange}
        maxLength={MAX_INPUT_LENGTH}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSearch();
          }
        }}
      />
      <SearchIcon
        onClick={handleSearch}
        className={cn(
          'absolute bottom-1/2 translate-y-1/2',
          'cursor-pointer hover:scale-110 transition-all duration-200',
          isSearch ? 'right-3 size-4.5' : 'right-2.5 size-3.5',
        )}
      />
    </div>
  );
}
