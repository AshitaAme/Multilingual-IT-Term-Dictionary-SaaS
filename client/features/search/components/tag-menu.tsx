'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/utils/utils';
import { Plus } from 'lucide-react';
import { TagMenuProps } from '../types/tag-menu-props';
import { Input } from '@/shared/components/ui/input';
import { MAX_TAG_QUERY_LENGTH } from '../constants/search.constants';
import { useEffect, useMemo, useState } from 'react';
import { getTagListAction } from '../actions/get-tag-list.action';

export function TagMenu({ isSearch }: Readonly<TagMenuProps>) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const tagList = useMemo(() => {
    const res = getTagListAction(query);
    if (res.success) return res.data;
  }, [query]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Plus
          className={cn(
            'absolute bottom-1/2 translate-y-1/2',
            'cursor-pointer hover:scale-110 transition-all duration-150',
            isSearch ? 'right-3 size-4.5' : 'right-2.5 size-3.5',
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(isSearch ? 'w-100' : 'w-60')}
        align="center"
        sideOffset={20}
      ></DropdownMenuContent>
      <DropdownMenuGroup>
        <Input
          className={cn(
            'w-full h-full ring-1 ring-foreground/40 focus:ring-foreground border-0',
            isSearch ? 'pl-3 pr-10 rounded-3xl' : 'pl-3 pr-8 rounded-xl ',
            'focus:',
          )}
          placeholder="Search tags..."
          value={input}
          maxLength={MAX_TAG_QUERY_LENGTH}
          onChange={(e) => setInput(e.target.value)}
        />
      </DropdownMenuGroup>
      <DropdownMenuGroup></DropdownMenuGroup>
    </DropdownMenu>
  );
}
