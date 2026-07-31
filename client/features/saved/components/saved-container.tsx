'use client';

import { cn } from '@/shared/utils/utils';
import { useBookStore } from '../stores/saved.store';
import { BookOptions } from './book-options';
import { BookTermList } from './book-term-list';
import { SavedBooksDisplay } from './saved-books-display';

export function SavedContainer() {
  const openBook = useBookStore((state) => state.openBook);

  return (
    <div>
      {openBook && (
        <div className={cn('w-full px-[20%] py-[10%] flex flex-col gap-10')}>
          <BookOptions />
          <BookTermList />
        </div>
      )}
      {!openBook && <SavedBooksDisplay />}
    </div>
  );
}
