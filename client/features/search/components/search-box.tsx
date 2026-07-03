'use client';

import { Input } from '@/shared/components/ui/input';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useMemo, useState } from 'react';
import { useInputStore, useSearchStore } from '../stores/search.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/utils';
import { MAX_SEARCH_LIST_QUERY_LENGTH } from '../constants/search.constants';
import { TagMenu } from './tag-menu';
import { Search } from 'lucide-react';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';

const SEARCH_PATH = '/search';

export function SearchBox({
  variant,
}: Readonly<{ variant?: 'navigation' | 'search' }>) {
  const t = useTranslations('search');
  const setQuery = useSearchStore((state) => state.setQuery);
  const isSearch = useMemo(() => variant === 'search', [variant]);
  const [navInput, setNavInput] = useState(''); // for navigation mode
  const input = useInputStore((state) => state.input); // shared by SearchList
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
    <div className={cn(isSearch ? 'w-120 h-10' : 'w-45 h-8', 'relative')}>
      <Input
        className={cn(
          'w-full h-full ring-1 ring-foreground/40 focus:ring-foreground border-0',
          isSearch ? 'pl-4 pr-9.5 rounded-3xl' : 'pl-3 pr-8 rounded-xl ',
          'focus:',
        )}
        placeholder={t('searchBox.inputPlaceholder')}
        value={isSearch ? input : navInput}
        onChange={handleInputChange}
        maxLength={MAX_SEARCH_LIST_QUERY_LENGTH}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSearch();
          }
        }}
      />
      {isSearch && <TagMenu />}
      {!isSearch && (
        <TooltipWrapper side="bottom" label={t('searchBox.searchLabel')}>
          <Search
            onClick={handleSearch}
            size={14}
            className="absolute right-4 bottom-1/2 translate-1/2 cursor-pointer hover:scale-110 transition-all duration-150"
          />
        </TooltipWrapper>
      )}
    </div>
  );
}
