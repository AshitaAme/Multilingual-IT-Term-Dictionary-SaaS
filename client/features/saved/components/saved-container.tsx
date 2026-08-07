'use client';

import { cn } from '@/shared/utils/utils';
import { useBookStore, useModifyState } from '../stores/saved.store';
import { BookOptions } from './book-options';
import { BookTermList } from './book-term-list';
import { SavedBooksDisplay } from './saved-books-display';
import { ModifyCard } from './modify-card';

export function SavedContainer() {
  const openBook = useBookStore((state) => state.openBook);
  const modifiedTerm = useModifyState((state) => state.modifiedTerm);

  return (
    <div className="relative">
      {modifiedTerm !== null && <ModifyCard />}
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
