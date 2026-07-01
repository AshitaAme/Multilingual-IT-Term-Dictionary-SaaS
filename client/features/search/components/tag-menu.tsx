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
import {
  MAX_SEARCH_LIST_QUERY_LENGTH,
  MAX_TAG_QUERY_LENGTH,
} from '../constants/search.constants';
import { useEffect, useState } from 'react';
import { getTagListAction as getTagNamesAction } from '../actions/get-tag-list.action';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useInputStore } from '../stores/search.store';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

export function TagMenu({ isSearch }: Readonly<TagMenuProps>) {
  const [input, setInput] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [showedTags, setShowedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchInput = useInputStore((state) => state.input);
  const setSearchInput = useInputStore((state) => state.setInput);

  useEffect(() => {
    const timer = setTimeout(() => {
      const res = tagNames.filter((t) =>
        t.toLowerCase().includes(input.toLowerCase().trim()),
      );

      setShowedTags(res);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, tagNames]);

  useEffect(() => {
    const fetchTagList = async () => {
      const res = await getTagNamesAction();
      console.log('[fetchTagList]: ', res);
      if (res.success) setTagNames(res.data!);
      else toast.error(res.error);
      setIsLoading(false);
    };
    fetchTagList();
  }, []);

  const handleTagClick = (tagName: string) => {
    const newSearchInput = searchInput + tagName;
    if (newSearchInput.length < MAX_SEARCH_LIST_QUERY_LENGTH)
      setSearchInput(newSearchInput);
  };

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
        className={cn(isSearch ? 'w-100' : 'w-80', 'flex flex-col p-0')}
        align="center"
        sideOffset={20}
      >
        <DropdownMenuGroup>
          <Input
            className={cn(
              'h-8 rounded-none focus:ring-foreground border-0 ring-0',
              isSearch ? 'pl-3 pr-10 ' : 'pl-3 pr-8 ',
              'focus:',
            )}
            placeholder="Search tags..."
            value={input}
            maxLength={MAX_TAG_QUERY_LENGTH}
            onChange={(e) => {
              setInput(e.target.value);
            }}
          />
        </DropdownMenuGroup>
        <DropdownMenuGroup className="h-40 overflow-y-auto flex flex-wrap content-start gap-2 p-2 overflow-x-hidden">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center">
              <LoadingCircle size={8} />
            </div>
          )}
          {!isLoading &&
            showedTags.map((tagName, index) => (
              <Button
                variant="outline"
                key={index + tagName}
                className="cursor-pointer"
                onClick={() => handleTagClick(tagName)}
              >
                {tagName}
              </Button>
            ))}
        </DropdownMenuGroup>
        <DropdownMenuGroup className="h-2" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
