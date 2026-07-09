'use client';

import { useBookStore } from '../stores/saved.store';
import { SavedBookInfo } from './saved-book-info';
import { SavedBooksDisplay } from './saved-books-display';

export function SavedContainer() {
  const openBook = useBookStore((state) => state.openBook);

  return (
    <div>
      {openBook && <SavedBookInfo />}
      {!openBook && <SavedBooksDisplay />}
    </div>
  );
}
