'use client';

import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useEffect, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { Clock, Diamond, List } from 'lucide-react';

export function SavedBookInfo() {
  const bookId = useBookStore((state) => state.bookId);
  const [bookTermList, setBookTermList] = useState<BookTerm[]>([]);

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
    <div className={cn('w-full', 'flex flex-col px-[20%] py-[10%]')}>
      <div className="flex justify-end">
        <Button>
          <List />
          <span>List</span>
        </Button>
        <Button>
          <Clock />
          <span>Review</span>
        </Button>
        <Button>
          <Diamond />
          <span>Card</span>
        </Button>
      </div>
      <div
        className={cn(
          'min-h-100',
          'flex flex-col items-center justify-center border-2',
        )}
      >
        {bookTermList.length > 0 &&
          bookTermList.map((bookTerm, index) => {
            return <div key={index + '#' + bookTerm.name}></div>;
          })}
        {bookTermList.length <= 0 && <span>Still Empty...</span>}
      </div>
    </div>
  );
}
