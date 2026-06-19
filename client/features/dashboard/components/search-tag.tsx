'use client';

import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getTagListAction } from '../actions/get-tag-list.action';
import { toast } from 'sonner';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/shared/utils/utils';
import { SearchTagProps } from '../types/search-tag-props';
import { TagInfoInput } from '../schemas/term-form.schema';

const PAGE_SIZE = 20;

export default function SearchTag({
  tagFields,
  removeTag,
  appendTag,
  className,
}: Readonly<SearchTagProps>) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const [tags, setTags] = useState<TagInfoInput[]>([]); // tags for display
  const [search, setSearch] = useState(''); // query condition
  const [page, setPage] = useState(1); // current page
  const [loading, setLoading] = useState(false);

  const languageCode = useMemo(() => {
    if (locale.startsWith('zh')) return 'zh';
    if (locale.startsWith('ja')) return 'ja';
    return 'en';
  }, [locale]);

  // Fetch and set tags from server
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      const res = await getTagListAction(languageCode);
      if (res.success) setTags(res.data!);
      else toast.error(res.error);
      setLoading(false);
    };
    fetchTags();
  }, [languageCode]);

  // Tags to be displayed under search query condition
  const filteredTags = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, search]);

  // Tags displayed on current page
  const totalPages = Math.max(1, Math.ceil(filteredTags.length / PAGE_SIZE));
  const pagedTags = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTags.slice(start, start + PAGE_SIZE);
  }, [filteredTags, page]);

  // Set search query condition when input changes
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Set page to the beginning when search button is clicked
  const handleSearchClick = () => setPage(1);
  const checkTag = useCallback(
    (tagId: string) => tagFields.find((t) => t.tagId === tagId),
    [tagFields],
  );
  const toggleTag = useCallback(
    (tag: TagInfoInput) => {
      if (checkTag(tag.tagId)) {
        const index = tagFields.findIndex((t) => t.tagId === tag.tagId);
        if (index !== -1) removeTag(index);
      } else {
        appendTag(tag);
      }
    },
    [checkTag, tagFields, removeTag, appendTag],
  );

  return (
    <div className="flex flex-col gap-2">
      <Card className="flex flex-col rounded-sm p-0 py-1 bg-background">
        <CardContent className="flex flex-wrap content-start gap-2 py-2 overflow-y-auto h-30 max-h-30">
          {tagFields.map(
            (field, index) =>
              field.name !== '' && (
                <Button
                  type="button"
                  key={field.id}
                  className="flex items-center justify-center relative cursor-pointer"
                  onClick={() => removeTag(index)}
                >
                  {field.name}
                  <X size={10} className="cursor-pointer " />
                </Button>
              ),
          )}
        </CardContent>
      </Card>
      <Card
        className={cn(
          className,
          'rounded-sm p-0 flex flex-col gap-0 bg-background',
        )}
      >
        {/* Search tag */}
        <CardHeader className="flex items-center justify-center py-3">
          <ButtonGroup>
            <Input
              placeholder={t('searchTag.search')}
              value={search}
              onChange={handleSearchInput}
            />
            <Button
              type="button"
              variant="outline"
              aria-label="Search"
              className="group/search cursor-pointer"
              onClick={handleSearchClick}
            >
              <SearchIcon className="group-hover/search:scale-110 transition-all duration-500" />
            </Button>
          </ButtonGroup>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-2 overflow-y-auto max-h-80">
          {/* Loading state */}
          {loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('searchTag.loading')}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredTags.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('searchTag.noResults')}
            </div>
          )}

          {/* Tag list */}
          <div className="flex-1 flex flex-wrap gap-2 content-start">
            {!loading &&
              pagedTags.map((tag) => (
                <Button
                  type="button"
                  key={tag.tagId}
                  className={cn(
                    'flex items-center justify-center cursor-pointer opacity-50',
                    checkTag(tag.tagId) && 'opacity-100',
                  )}
                  variant={'outline'}
                  onClick={() => toggleTag(tag)}
                >
                  <span className="flex-1 truncate">{tag.name}</span>
                </Button>
              ))}
          </div>

          {/* Pagination */}
          {!loading && filteredTags.length > 0 && (
            <div className="flex items-center justify-between py-2">
              {/* Proportion of amount accumulated to total amount*/}
              <span className="text-xs text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filteredTags.length)} /{' '}
                {filteredTags.length}
              </span>

              <div className="flex items-center gap-1">
                {/* Last page */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>

                <span className="text-xs w-16 text-center">
                  {page} / {totalPages}
                </span>

                {/* Next page */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-0 rounded-none">
          <Button
            type="button"
            className="w-full h-full py-2 rounded-none cursor-pointer border-0"
            variant="ghost"
            onClick={() => {}}
          >
            {t('searchTag.generate')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
