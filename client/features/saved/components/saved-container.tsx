'use client';

import { useBookStore } from '../stores/saved.store';
import { SavedBook } from './saved-book';
import { SavedBooksDisplay } from './saved-books-display';

export function SavedContainer() {
  const openBook = useBookStore((state) => state.openBook);

  return (
    <div>
      {openBook && <SavedBook />}
      {!openBook && <SavedBooksDisplay />}
    </div>
  );
}
