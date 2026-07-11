'use client';

import { useEffect, useState } from 'react';
import { getSavedBooksAction } from '../actions/get-saved-books.action';
import { toast } from 'sonner';
import { CardTitle } from '@/shared/components/ui/card';
import { useBookStore } from '../stores/saved.store';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { SavedBook } from '../types/saved-book';
import { addBookAction } from '../actions/add-book.action';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { ClickCard } from '@/shared/components/ui/click-card';
import { cn } from '@/shared/utils/utils';

export function SavedBooksDisplay() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const setBookId = useBookStore((state) => state.setBookId);
  const router = useRouter();
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isChangingName, setIsChangingName] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setIsFetchingBooks(true);
      const res = await getSavedBooksAction();
      if (!res.success) toast.error(res.error);
      else setSavedBooks(res.data!);
      setIsFetchingBooks(false);
    };
    fetchBook();
  }, [router]);

  const handleOpenBook = (bookId: string) => {
    setBookId(bookId);
    setOpenBook(true);
  };

  const addBook = async (name: string) => {
    setIsAddingBook(true);
    const res = await addBookAction({ name });
    if (!res.success) toast.error(res.error);
    else {
      const id = res.data!;
      setSavedBooks((prev) => [...prev, { id, name }]);
    }
    setIsAddingBook(false);
  };

  return (
    <div className="p-[10%] flex flex-wrap gap-x-10 ">
      {savedBooks.length > 0 &&
        savedBooks.map((book) => {
          return (
            <ClickCard
              key={book.id}
              onClick={() => handleOpenBook(book.id)}
              className="rounded-sm w-50 h-70 flex flex-wrap items-center justify-center p-0 pb-4 group"
            >
              <span className="text-xl text-foreground/70 group-hover:text-foreground">
                {book.name}
              </span>
            </ClickCard>
          );
        })}
      <ClickCard
        onClick={() => setIsChangingName(true)}
        className={cn(
          'rounded-sm w-50 h-70 p-0 pb-2 flex justify-center items-center',
          'dark:border-dashed bg-foreground/5',
          isAddingBook || isChangingName
            ? 'pointer-events-none opacity-70'
            : 'group',
        )}
      >
        {isAddingBook && <LoadingCircle size={25} />}
        {!isAddingBook && !isChangingName && (
          <Plus
            className="group-hover:scale-110 transition-all duration-150 text-foreground/70 group-hover:text-foreground"
            size={25}
          />
        )}
        {!isAddingBook && isChangingName && (
          <input
            autoFocus
            onBlur={() => setIsChangingName(false)}
            className="ring-2 border-0 focus:outline-none rounded-sm w-3/5 h-8 p-2 focus:ring-foreground"
            value={nameInput}
            maxLength={20}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsChangingName(false);
                addBook(nameInput);
              }
            }}
          />
        )}
      </ClickCard>
    </div>
  );
}
