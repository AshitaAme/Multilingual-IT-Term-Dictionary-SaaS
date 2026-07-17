'use client';

import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useEffect, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, Circle, Clock, Diamond, List } from 'lucide-react';

export function SavedBookInfo() {
  const bookId = useBookStore((state) => state.bookId);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const [bookTermList, setBookTermList] = useState<BookTerm[]>([]);
  const [mode, setMode] = useState<'List' | 'Card' | 'Review'>('List');

  useEffect(() => {
    const fetchBookTerms = async () => {
      if (!bookId.trim()) {
        toast.error('Book not found');
        return;
      }
      const res = await getBookTermListAction(bookId);
      if (!res.success) toast.error(res.error);
      else setBookTermList(res.data!);
    };
    fetchBookTerms();
  }, [bookId]);

  return (
    <div className={cn('w-full', 'flex flex-col gap-4 px-[20%] py-[10%]')}>
      <div className="flex justify-between gap-2">
        <div>
          <Button variant="ghost" onClick={() => setOpenBook(false)}>
            <ChevronLeft />
            <span>Back</span>
          </Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <List />
            <span>List</span>
          </Button>
          <Button variant="outline">
            <Diamond />
            <span>Card</span>
          </Button>
          <Button variant="outline">
            <Clock />
            <span>Review</span>
          </Button>
        </div>
      </div>
      <div
        className={cn('min-h-100', 'flex flex-col items-center justify-center')}
      >
        {/* Empty */}
        {bookTermList.length <= 0 && (
          <span className="font-semibold">Still Empty...</span>
        )}

        {/* List mode */}
        {bookTermList.length > 0 &&
          mode === 'List' &&
          bookTermList.map((bookTerm, index) => {
            return (
              <div key={index + '#' + bookTerm.name} className="flex gap-x-6">
                <div className="flex gap-x-2">
                  <Circle />
                  <span>{index}</span>
                </div>
                <span>{bookTerm.name}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
