import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SearchMenu() {
  const t = useTranslations('nav');
  return (
    <ButtonGroup>
      <Input placeholder={t('search')} />
      <Button
        variant="outline"
        aria-label="Search"
        className="group/search cursor-pointer"
      >
        <SearchIcon className="group-hover/search:scale-110 transition-all duration-500" />
      </Button>
    </ButtonGroup>
  );
}
