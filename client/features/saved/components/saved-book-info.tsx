'use client';

import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useEffect, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, Clock, Diamond, List } from 'lucide-react';
import { useImmer } from 'use-immer';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

export function SavedBookInfo() {
  const bookId = useBookStore((state) => state.bookId);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const [bookTermList, updateBookTermList] = useImmer<BookTerm[]>([]);
  const [selected, updateSelected] = useImmer<Set<number>>(new Set());
  const [openReview, setOpenReview] = useState(-1);
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
  }, [bookId, updateBookTermList]);

  return (
    <div className={cn('w-full', 'flex flex-col gap-14 px-[20%] py-[10%]')}>
      <div className="flex justify-between gap-2">
        <div>
          <Button variant="ghost" onClick={() => setOpenBook(false)}>
            <ChevronLeft />
            <span>Back</span>
          </Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setMode('List')}>
            <List />
            <span>List</span>
          </Button>
          <Button variant="outline" onClick={() => setMode('Card')}>
            <Diamond />
            <span>Card</span>
          </Button>
          <Button variant="outline" onClick={() => setMode('Review')}>
            <Clock />
            <span>Review</span>
          </Button>
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
          <div className="w-130 flex flex-col justify-center gap-3 ring-1 rounded-md p-6">
            {bookTermList.map((bookTerm, index) => {
              const count = index + 1;
              return (
                <Button
                  onClick={() => setOpenReview(index)}
                  variant="ghost"
                  key={index + '#' + bookTerm.name}
                  className="flex flex-row items-center justify-start gap-x-10 "
                >
                  <div className="flex gap-x-4">
                    <span>{count < 10 ? '0' + count : count.toString()}</span>
                    <span>{bookTerm.name}</span>
                  </div>
                  <div>
                    <span className="">{bookTerm.text}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
