import { SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonGroup } from '@/components/ui/button-group';

export function Search() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search" className="group/search cursor-pointer">
        <SearchIcon className="group-hover/search:scale-110 transition-all duration-500" />
      </Button>
    </ButtonGroup>
  );
}
