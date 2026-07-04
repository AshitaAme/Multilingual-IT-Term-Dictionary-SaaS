'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/utils/utils';
import { Plus } from 'lucide-react';
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
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { useTranslations } from 'next-intl';

export function TagMenu() {
  const t = useTranslations('search');
  const [input, setInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [showedList, setShowedList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchInput = useInputStore((state) => state.input);
  const setSearchInput = useInputStore((state) => state.setInput);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = tagList.filter((t) =>
        t.toLowerCase().includes(input.toLowerCase().trim()),
      );

      setShowedList(filtered);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, tagList]);

  useEffect(() => {
    const fetchTagList = async () => {
      const res = await getTagNamesAction();
      console.log('[fetchTagList]: ', res);
      if (res.success) setTagList(res.data!);
      else toast.error(res.error);
      setIsLoading(false);
    };
    fetchTagList();
  }, []);

  const handleTagClick = (tagName: string) => {
    const newSearchInput = searchInput + tagName + ' ';
    if (newSearchInput.length < MAX_SEARCH_LIST_QUERY_LENGTH)
      setSearchInput(newSearchInput);
  };

  return (
    <DropdownMenu>
      <TooltipWrapper side="bottom" label={t('tagMenu.addTagsLabel')}>
        <DropdownMenuTrigger asChild>
          <Plus
            className={cn(
              'absolute bottom-1/2 translate-y-1/2',
              'cursor-pointer hover:scale-110 transition-all duration-150',
              'right-3 size-4.5',
            )}
          />
        </DropdownMenuTrigger>
      </TooltipWrapper>

      <DropdownMenuContent
        className={cn('w-80', 'flex flex-col p-0')}
        align="center"
        sideOffset={20}
      >
        <DropdownMenuGroup>
          <Input
            className={cn(
              'h-8 rounded-none focus:ring-foreground border-0 ring-0',
              'pl-3 pr-10',
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
              <LoadingCircle size={20} />
            </div>
          )}
          {!isLoading &&
            showedList.map((tagName, index) => (
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
