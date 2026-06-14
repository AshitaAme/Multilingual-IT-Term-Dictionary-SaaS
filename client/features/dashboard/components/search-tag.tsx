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
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getTagListAction } from '../actions/get-tag-list.action';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/shared/utils/utils';
import { SearchTagProps } from '../types/search-tag-props';
import { TagInfoInput } from '../schemas/term-form.schema';

const PAGE_SIZE = 20;

export default function SearchTag({
  setOpenSearchTag,
  clickedTagSet,
  appendTag,
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

  return (
    <Card>
      <CardHeader>
        <ButtonGroup>
          <Input
            placeholder={t('searchTag')}
            value={search}
            onChange={handleSearchInput}
          />
          <Button
            variant="outline"
            aria-label="Search"
            className="group/search cursor-pointer"
            onClick={handleSearchClick}
          >
            <SearchIcon className="group-hover/search:scale-110 transition-all duration-500" />
          </Button>
        </ButtonGroup>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Loading state */}
        {loading && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('loading')}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredTags.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('noResults')}
          </div>
        )}

        {/* Tag list */}
        {!loading &&
          pagedTags.map((tag) => (
            <Button
              key={tag.tagId}
              className={cn(
                'flex items-center px-3 py-2 rounded-md border border-border bg-muted/40',
                'hover:bg-muted transition-colors duration-150 text-sm',
                clickedTagSet.has(tag) && 'bg-muted/80',
              )}
              onClick={() => clickedTagSet.add(tag)}
            >
              <span className="flex-1 truncate">{tag.name}</span>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                #{tag.tagId}
              </span>
            </Button>
          ))}

        {/* Pagination */}
        {!loading && filteredTags.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            {/* Proportion of amount accumulated to total amount*/}
            <span className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredTags.length)} /{' '}
              {filteredTags.length}
            </span>

            <div className="flex items-center gap-1">
              {/* Last page */}
              <Button
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
      <CardFooter>
        <Button
          variant="outline"
          onClick={() => {
            clickedTagSet.forEach((tag) => appendTag(tag));
            setOpenSearchTag(false);
          }}
        >
          {t('attach')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            clickedTagSet.clear();
            setOpenSearchTag(false);
          }}
        >
          {t('cancel')}
        </Button>
        <Button variant="outline" onClick={() => {}}>
          {t('addTag')}
        </Button>
      </CardFooter>
    </Card>
  );
}
