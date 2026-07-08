'use client';

import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useEffect, useState } from 'react';
import { getBookTermListAction } from '../actions/get-book-term-list.action';
import { BookTerm } from '../types/book-term';

export function SavedBook() {
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
    <div>
      {bookTermList.map((bookTerm, index) => {
        return <div key={index + '#' + bookTerm.name}></div>;
      })}
    </div>
  );
}
