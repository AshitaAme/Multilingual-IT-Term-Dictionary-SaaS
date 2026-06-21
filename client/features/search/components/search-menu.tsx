import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useState } from 'react';

export function SearchMenu({
  setQuery,
}: Readonly<{ setQuery: (val: string) => void }>) {
  const t = useTranslations('nav');

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    setQuery(inputValue);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, setQuery]);

  return (
    <ButtonGroup>
      <Input
        placeholder={t('search')}
        value={inputValue}
        onChange={handleInputChange}
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
