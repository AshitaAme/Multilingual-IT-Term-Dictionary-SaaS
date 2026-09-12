'use client';

import { cn } from '@/shared/utils/utils';
import { useBookStore, useTermTextStore } from '../stores/saved.store';
import { BookOptions } from './book-options';
import { BookTermList } from './book-term-list';
import { SavedBooksDisplay } from './saved-books-display';
import { TermTextForm } from './term-text-form';

export function SavedContainer() {
  const openBook = useBookStore((state) => state.openBook);
  const term = useTermTextStore((state) => state.term);

  return (
    <div className="relative w-full">
      {term !== null && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
          <TermTextForm />
        </div>
      )}
      {openBook && (
        <div
          className={cn(
            'w-full py-25',
            'flex flex-col gap-15 justify-center items-center',
          )}
        >
          <BookOptions />
          <BookTermList />
        </div>
      )}
      {!openBook && <SavedBooksDisplay />}
    </div>
  );
}
