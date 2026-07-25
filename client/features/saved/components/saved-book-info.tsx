'use client';

import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useEffect, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import {
  CalendarPlus,
  ChevronLeft,
  Circle,
  Clock,
  ClockFading,
  ClockPlus,
  Diamond,
  Eraser,
  FolderPlus,
  List,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { useImmer } from 'use-immer';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/components/ui/context-menu';
import { enableMapSet } from 'immer';
import { between } from 'drizzle-orm';

export function SavedBookInfo() {
  enableMapSet();
  const bookId = useBookStore((state) => state.bookId);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const [bookTermList, updateBookTermList] = useImmer<BookTerm[]>([]);
  const [selected, updateSelected] = useImmer<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<'List' | 'Card' | 'Review'>('List');
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);

  useEffect(() => {
    const fetchBookTerms = async () => {
      setIsFetchingBooks(true);
      if (!bookId.trim()) {
        toast.error('Book not found');
        return;
      }
      const res = await getBookTermListAction(bookId);
      if (!res.success) toast.error(res.error);
      else updateBookTermList(res.data!);
      setIsFetchingBooks(false);
    };
    fetchBookTerms();
  }, [bookId]);

  return (
    <div className={cn('w-full', 'flex flex-col gap-10 px-[20%] py-[10%]')}>
      <div
        className={cn(
          'flex gap-2',
          selected.size === 0 ? 'justify-between' : 'justify-center',
        )}
      >
        {selected.size === 0 && (
          <div>
            <Button variant="ghost" onClick={() => setOpenBook(false)}>
              <ChevronLeft />
              <span>Back</span>
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          {selected.size === 0 && (
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
          {selected.size !== 0 && (
            <>
              <Button variant="ghost">
                <WalletCards />
                <span>All</span>
              </Button>
              <Button variant="ghost">
                <Eraser />
                <span>Clear</span>
              </Button>
              <Button variant="ghost">
                <ClockPlus />
                <span>Review</span>
              </Button>
              <Button variant="ghost">
                <ClockFading />
                <span>review</span>
              </Button>
              <Button variant="ghost">
                <FolderPlus />
                <span>Move</span>
              </Button>
              <Button variant="ghost">
                <Trash2 />
                <span>Delete</span>
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={cn('min-h-100', 'flex items-center justify-center')}>
        {/* Loading */}
        {isFetchingBooks && <LoadingCircle />}
        {/* Empty */}
        {!isFetchingBooks && bookTermList.length <= 0 && (
          <span className="font-semibold">Still Empty...</span>
        )}

        {/* List mode */}
        {!isFetchingBooks && bookTermList.length > 0 && mode === 'List' && (
          <div className="w-140 flex flex-col justify-center gap-3 ring-1 rounded-md p-6">
            {bookTermList.map((bookTerm, index) => {
              const count = index + 1;
              return (
                <ContextMenu key={bookTerm.termId}>
                  <ContextMenuTrigger>
                    <Button
                      onClick={() => {
                        updateSelected((draft) => {
                          if (draft.has(index)) draft.delete(index);
                          else draft.add(index);
                        });
                      }}
                      variant="ghost"
                      key={index + '#' + bookTerm.name}
                      className="w-full flex flex-row items-center justify-between gap-x-10"
                    >
                      <div className="flex gap-x-4">
                        <span>
                          {count < 10 ? '0' + count : count.toString()}
                        </span>
                        <span>{bookTerm.name}</span>
                      </div>
                      {selected.size !== 0 && (
                        <Circle
                          className={cn(
                            selected.has(index)
                              ? 'fill-foreground'
                              : 'text-background',
                            'ring-1 rounded-full ring-foreground',
                          )}
                        />
                      )}
                    </Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="p-2 flex flex-col gap-1">
                    <ContextMenuItem>Delete</ContextMenuItem>
                    <ContextMenuItem>
                      {bookTerm.reviewCard ? 'Add review' : 'Cancel Review'}
                    </ContextMenuItem>
                    <ContextMenuItem>Move to</ContextMenuItem>
                    <ContextMenuItem>Modify</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
