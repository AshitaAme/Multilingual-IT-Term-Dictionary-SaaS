'use client';

import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useSearchStore } from '../stores/search.store';

export function SearchBox() {
  const t = useTranslations('nav');
  const setQuery = useSearchStore((state) => state.setQuery);

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    setQuery(inputValue);
  };

  return (
    <ButtonGroup>
      <Input
        placeholder={t('search')}
        value={inputValue}
        onChange={handleInputChange}
        maxLength={70}
      />
      <Button
        variant="outline"
        aria-label="Search"
        className="group/search cursor-pointer"
        onClick={handleButtonClick}
      >
        <SearchIcon className="group-hover/search:scale-110 transition-all duration-500" />
      </Button>
    </ButtonGroup>
  );
}
