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

  if (isSearch)
    return (
      <Input
        className="rounded-2xl w-80 h-10"
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
    );

  return (
    <ButtonGroup>
      <Input
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
      {
        <Button
          className={cn('group/search cursor-pointer')}
          variant="outline"
          aria-label="Search"
          onClick={handleSearch}
        >
          <SearchIcon className="group-hover/search:scale-110 transition-all duration-500" />
        </Button>
      }
    </ButtonGroup>
  );
}
