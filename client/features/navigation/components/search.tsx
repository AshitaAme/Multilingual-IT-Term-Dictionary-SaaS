import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon } from 'lucide-react';

export function Search() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
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
