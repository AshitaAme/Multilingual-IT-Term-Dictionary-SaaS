'use client';

import { cn } from '@/shared/utils/utils';
import { useBookStore, useModifyStore } from '../stores/saved.store';
import { BookOptions } from './book-options';
import { BookTermList } from './book-term-list';
import { SavedBooksDisplay } from './saved-books-display';
import { TermModifyCard } from './term-modify-card';

export function SavedContainer() {
  const openBook = useBookStore((state) => state.openBook);
  const modifiedTerm = useModifyStore((state) => state.modifiedTerm);

  return (
    <div className="relative">
      {modifiedTerm !== null && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
          <TermModifyCard />
        </div>
      )}
      {openBook && (
        <div
          className={cn(
            'w-full px-[20%] py-[10%] flex flex-col gap-10 justify-center items-center',
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
