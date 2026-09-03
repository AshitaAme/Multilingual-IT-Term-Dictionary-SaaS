'use client';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getTagListAction } from '../actions/get-tag-list.action';
import { toast } from 'sonner';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/shared/utils/utils';
import { SearchTagProps } from '../types/search-tag-props';
import { TagInfoList } from '../schemas/term-form.schema';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

const PAGE_SIZE = 20;

export default function SearchTag({
  tagFields,
  removeTag,
  appendTag,
}: Readonly<SearchTagProps>) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const [tags, setTags] = useState<TagInfoList[]>([]); // tags for display
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
  const checkTag = useCallback(
    (tagId: string) => tagFields.find((t) => t.tagId === tagId),
    [tagFields],
  );
  const toggleTag = useCallback(
    (tag: TagInfoList) => {
      if (checkTag(tag.tagId)) {
        const index = tagFields.findIndex((t) => t.tagId === tag.tagId);
        if (index !== -1) removeTag(index);
      } else {
        appendTag(tag);
      }
    },
    [checkTag, tagFields, removeTag, appendTag],
  );

  const tagList = pagedTags.map((tag) => (
    <Button
      type="button"
      key={tag.tagId}
      className={cn(
        'flex items-center justify-center cursor-pointer opacity-50 rounded-sm',
        checkTag(tag.tagId) && 'opacity-100',
      )}
      variant={'outline'}
      onClick={() => toggleTag(tag)}
    >
      <span className="flex-1 truncate">{tag.name}</span>
    </Button>
  ));

  return (
    <div className="flex flex-col gap-2 py-2">
      <Card className="flex flex-col rounded-sm p-0 py-1 bg-background">
        <CardContent className="flex flex-wrap content-start gap-2 py-2 overflow-y-auto h-30 max-h-30">
          {tagFields.map(
            (field, index) =>
              field.name !== '' && (
                <Button
                  type="button"
                  key={field.id}
                  className="flex items-center justify-center relative cursor-pointer rounded-sm"
                  onClick={() => removeTag(index)}
                >
                  {field.name}
                  <X size={10} className="cursor-pointer " />
                </Button>
              ),
          )}
        </CardContent>
      </Card>
      <Card className={cn('rounded-sm p-0 flex flex-col gap-0 bg-background')}>
        {/* Search tag */}
        <CardHeader className="flex items-center justify-center py-4">
          <div className="relative">
            <Input
              className="w-full t-full rounded-sm border-0 focus:bg-muted-foreground/20!"
              placeholder={t('searchTag.search')}
              value={search}
              onChange={handleSearchInput}
            />

            <SearchIcon className="h-4 w-4 absolute right-2 bottom-1/2 translate-y-1/2" />
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="h-50">
            {/* Loading state */}
            {loading && (
              <div className="h-full flex items-center justify-center">
                <LoadingCircle />
              </div>
            )}

            {/* Empty state */}
            {loading && filteredTags.length === 0 && (
              <div className="h-full py-8 text-center text-sm text-muted-foreground">
                {t('searchTag.noResults')}
              </div>
            )}

            {/* Tag list */}
            {!loading && (
              <div className="h-full overflow-auto hide-scrollbar flex flex-wrap content-start gap-2">
                {tagList}
              </div>
            )}
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
      </Card>
    </div>
  );
}
