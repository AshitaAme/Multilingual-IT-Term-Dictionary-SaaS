'use client';

import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useMemo, useState } from 'react';
import { useSearchStore } from '../stores/search.store';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/utils';

const SEARCH_PATH = '/search';

export function SearchBox({
  variant,
}: Readonly<{ variant?: 'navigation' | 'search' }>) {
  const t = useTranslations('nav');
  const setQuery = useSearchStore((state) => state.setQuery);
  const router = useRouter();
  const pathname = usePathname();
  const isSearch = useMemo(() => variant === 'search', [variant]);

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    setQuery(inputValue);
    setInputValue('');
    if (pathname !== SEARCH_PATH) router.push(SEARCH_PATH);
  };

  return (
    <div className={cn(isSearch ? 'w-120 h-10' : 'w-50 h-8', 'relative')}>
      <Input
        className={cn('w-full h-full rounded-2xl ring-1 ring-foreground/80')}
        placeholder={t('search')}
        value={inputValue}
        onChange={handleInputChange}
        maxLength={70}
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
          'cursor-pointer hover:scale-110 transition-all duration-500',
          isSearch ? 'right-3 size-4.5' : 'right-2.5 size-3.5',
        )}
      />
    </div>
  );
}
