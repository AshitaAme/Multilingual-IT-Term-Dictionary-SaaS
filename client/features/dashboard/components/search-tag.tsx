'use client';

import { Button } from '@/shared/components/ui/button';
import { ButtonGroup } from '@/shared/components/ui/button-group';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getTagListAction } from '../actions/get-tag-list.action';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { TagItem } from '../types/tag-item';

const PAGE_SIZE = 20;

export default function SearchTag() {
  const t = useTranslations();
  const locale = useLocale();

  const [tags, setTags] = useState<TagItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const languageCode = useMemo(() => {
    if (locale.startsWith('zh')) return 'zh';
    if (locale.startsWith('ja')) return 'ja';
    return 'en';
  }, [locale]);

  // Fetch tags on mount
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

  // Filter tags by search query (client-side)
  const filteredTags = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / PAGE_SIZE));

  const pagedTags = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTags.slice(start, start + PAGE_SIZE);
  }, [filteredTags, page]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Search is reactive; this triggers explicit button-click UX feedback
    setSearch(e.target.value);
    setPage(1);
  };
  const handleSearchClick = () => {
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <ButtonGroup>
          <Input
            placeholder={t('search')}
            value={search}
            onChange={handleSearchInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
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
            <div
              key={tag.tagId}
              className="flex items-center px-3 py-2 rounded-md border border-border bg-muted/40 hover:bg-muted transition-colors duration-150 text-sm"
            >
              <span className="flex-1 truncate">{tag.name}</span>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                #{tag.tagId}
              </span>
            </div>
          ))}

        {/* Pagination */}
        {!loading && filteredTags.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {/* e.g. "21–40 / 153" */}
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredTags.length)} /{' '}
              {filteredTags.length}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>

              <span className="text-xs tabular-nums w-16 text-center">
                {page} / {totalPages}
              </span>

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
    </Card>
  );
}
