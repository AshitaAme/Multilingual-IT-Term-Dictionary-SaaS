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
import { useBookOptionStore, useBookStore } from '../stores/saved.store';
import { Input } from '@/shared/components/ui/input';
import { MAX_SEARCH_LIST_QUERY_LENGTH } from '@/features/search/constants/search.constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { getSavedBooksAction } from '../actions/get-saved-books.action';
import { toast } from 'sonner';
import { SavedBook } from '../types/saved-book';

export function BookOptions() {
  const bookId = useBookStore((state) => state.bookId);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const isSelecting = useBookStore((state) => state.isSelecting);

  const query = useBookOptionStore((state) => state.query);
  const doReview = useBookOptionStore((state) => state.doReview);
  const deReview = useBookOptionStore((state) => state.deReview);
  const remove = useBookOptionStore((state) => state.remove);
  const moveTo = useBookOptionStore((state) => state.moveTo);
  const setMode = useBookOptionStore((state) => state.setMode);
  const setQuery = useBookOptionStore((state) => state.setQuery);
  const setAll = useBookOptionStore((state) => state.setAll);
  const setClear = useBookOptionStore((state) => state.setClear);
  const setDoReview = useBookOptionStore((state) => state.setDoReview);
  const setDeReview = useBookOptionStore((state) => state.setDeReview);
  const setRemove = useBookOptionStore((state) => state.setRemove);
  const setMoveTo = useBookOptionStore((state) => state.setMoveTo);

  // Fetch books for moveTo menu
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  useEffect(() => {
    const fetchBooks = async () => {
      setIsFetchingBooks(true);
      const res = await getSavedBooksAction();
      if (!res.success) toast.error(res.error);
      else setSavedBooks(res.data!.filter((book) => book.id !== bookId));
      setIsFetchingBooks(false);
    };
    fetchBooks();
  }, [bookId]);

  return (
    <div
      className={cn(
        'flex gap-2 w-140',
        !isSelecting ? 'justify-between' : 'justify-center',
      )}
    >
      {!isSelecting && (
        <Button variant="ghost" onClick={() => setOpenBook(false)}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      )}
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

      <div className="flex gap-2">
        {!isSelecting && (
          <>
            <Button variant="ghost" onClick={() => setMode('List')}>
              <List />
              <span>List</span>
            </Button>
            <Button variant="ghost" onClick={() => setMode('Card')}>
              <Diamond />
              <span>Card</span>
            </Button>
            <Button variant="ghost" onClick={() => setMode('Review')}>
              <Clock />
              <span>Review</span>
            </Button>
          </>
        )}
        {isSelecting && (
          <>
            {/* All */}
            <Button variant="ghost" onClick={() => setAll(true)}>
              <WalletCards />
              <span>All</span>
            </Button>

            {/* Clear */}
            <Button variant="ghost" onClick={() => setClear(true)}>
              <Eraser />
              <span>Clear</span>
            </Button>

            {/* Review */}
            <Button
              disabled={doReview}
              variant="ghost"
              onClick={() => setDoReview(true)}
            >
              <ClockPlus />

              <span>Do-review</span>
            </Button>

            {/* De-review */}
            <Button
              disabled={deReview}
              variant="ghost"
              onClick={() => setDeReview(true)}
            >
              <ClockFading />

              <span>De-review</span>
            </Button>

            {/* Remove */}
            <Button
              disabled={remove}
              variant="ghost"
              onClick={() => setRemove(true)}
            >
              <Trash2 />
              <span>Remove</span>
            </Button>

            {/* Move to */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isFetchingBooks || savedBooks.length === 0}
                  variant="ghost"
                  onClick={() => setMoveTo('')}
                >
                  <FolderPlus />
                  <span>Move to</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center" sideOffset={5}>
                {savedBooks.map((book, index) => {
                  return (
                    <div key={book.id}>
                      {index !== 0 && (
                        <DropdownMenuSeparator className="mx-2 mt-1" />
                      )}
                      <DropdownMenuItem
                        className="flex items-center pl-3 hover:bg-muted-foreground/20!"
                        onClick={() => setMoveTo(book.id)}
                      >
                        <span className={cn('w-20 inline-block truncate')}>
                          {book.name}
                        </span>
                      </DropdownMenuItem>
                    </div>
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
