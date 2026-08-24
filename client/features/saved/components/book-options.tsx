'use client';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';
import {
  ChevronLeft,
  List,
  Diamond,
  Clock,
  WalletCards,
  Eraser,
  ClockPlus,
  ClockFading,
  FolderPlus,
  Trash2,
  Search,
} from 'lucide-react';
import {
  useBookOptionStore,
  useBookStore,
  useSavedStore,
} from '../stores/saved.store';
import { Input } from '@/shared/components/ui/input';
import { MAX_SEARCH_LIST_QUERY_LENGTH } from '@/features/search/constants/search.constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

export function BookOptions() {
  const t = useTranslations('saved.bookOptions');

  // Book status
  const bookId = useBookStore((state) => state.bookId);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const isSelecting = useBookStore((state) => state.isSelecting);

  // Operation options based on select
  const mode = useBookOptionStore((state) => state.mode);
  const query = useBookOptionStore((state) => state.query);
  const doReview = useBookOptionStore((state) => state.doReview);
  const deReview = useBookOptionStore((state) => state.deReview);
  const remove = useBookOptionStore((state) => state.remove);
  const setMode = useBookOptionStore((state) => state.setMode);
  const setQuery = useBookOptionStore((state) => state.setQuery);
  const setAll = useBookOptionStore((state) => state.setAll);
  const setClear = useBookOptionStore((state) => state.setClear);
  const setDoReview = useBookOptionStore((state) => state.setDoReview);
  const setDeReview = useBookOptionStore((state) => state.setDeReview);
  const setRemove = useBookOptionStore((state) => state.setRemove);
  const setMoveTo = useBookOptionStore((state) => state.setMoveTo);

  // Used for move-to menu
  const savedBooks = useSavedStore((state) => state.savedBooks);

  return (
    <div
      className={cn(
        'flex gap-2 w-140',
        !isSelecting ? 'justify-between' : 'justify-center',
      )}
    >
      {/* Back */}
      {!isSelecting && (
        <Button variant="ghost" onClick={() => setOpenBook(false)}>
          <ChevronLeft />
          <span>{t('back')}</span>
        </Button>
      )}

      {/* Query filter */}
      {!isSelecting && (
        <div className="w-40 relative">
          <Search
            size={15}
            className="absolute right-2 bottom-1/2 translate-y-1/2"
          />
          <Input
            maxLength={MAX_SEARCH_LIST_QUERY_LENGTH}
            className="bg-muted-foreground/10! focus:bg-muted-foreground/20! w-full border-0 pl-3 pr-8 rounded-md"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
      )}

      {/* Display mode */}
      <div className="flex gap-2">
        {!isSelecting && (
          <>
            <Button
              className={cn(mode === 'List' && 'bg-muted dark:bg-muted/50')}
              variant="ghost"
              onClick={() => setMode('List')}
            >
              <List />
              <span>{t('list')}</span>
            </Button>
            <Button
              className={cn(mode === 'Card' && 'bg-muted dark:bg-muted/50')}
              variant="ghost"
              onClick={() => setMode('Card')}
            >
              <Diamond />
              <span>{t('card')}</span>
            </Button>
            <Button
              className={cn(mode === 'Review' && 'bg-muted dark:bg-muted/50')}
              variant="ghost"
              onClick={() => setMode('Review')}
            >
              <Clock />
              <span>{t('review')}</span>
            </Button>
          </>
        )}

        {/* Operation options */}
        {isSelecting && (
          <>
            {/* All */}
            <Button variant="ghost" onClick={() => setAll(true)}>
              <WalletCards />
              <span>{t('all')}</span>
            </Button>

            {/* Clear */}
            <Button variant="ghost" onClick={() => setClear(true)}>
              <Eraser />
              <span>{t('clear')}</span>
            </Button>

            {/* Review */}
            <Button
              disabled={doReview}
              variant="ghost"
              onClick={() => setDoReview(true)}
            >
              <ClockPlus />
              <span>{t('doReview')}</span>
            </Button>

            {/* De-review */}
            <Button
              disabled={deReview}
              variant="ghost"
              onClick={() => setDeReview(true)}
            >
              <ClockFading />

              <span>{t('deReview')}</span>
            </Button>

            {/* Remove */}
            <Button
              disabled={remove}
              variant="ghost"
              onClick={() => setRemove(true)}
            >
              <Trash2 />
              <span>{t('remove')}</span>
            </Button>

            {/* Move to */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <FolderPlus />
                  <span>{t('moveTo')}</span>
                </Button>
              </DropdownMenuTrigger>

              {/* Move-to menu */}
              <DropdownMenuContent
                align="center"
                sideOffset={5}
                className="p-2 flex flex-col gap-1"
              >
                {savedBooks.map((book) => {
                  if (bookId === book.id) return;
                  return (
                    <DropdownMenuItem
                      key={book.id}
                      className="flex items-center hover:bg-muted-foreground/20!"
                      onClick={() => setMoveTo(book.id)}
                    >
                      <span className={cn('w-20 inline-block truncate')}>
                        {book.name}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}
