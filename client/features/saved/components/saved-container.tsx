'use client';

import { useBookStore } from '../stores/saved.store';
import { BookTermList } from './book-term-list';
import { SavedBooksDisplay } from './saved-books-display';

export function SavedContainer() {
  const openBook = useBookStore((state) => state.openBook);

  return (
    <div>
      {openBook && <BookTermList />}
      {!openBook && <SavedBooksDisplay />}
    </div>
  );
}
