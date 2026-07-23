'use client';

import { useEffect, useState } from 'react';
import { getSavedBooksAction } from '../actions/get-saved-books.action';
import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useRouter } from 'next/navigation';
import { Check, Plus, Trash2 } from 'lucide-react';
import { SavedBook } from '../types/saved-book';
import { upsertBookAction } from '../actions/upsert-book.action';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { ClickCard } from '@/shared/components/ui/click-card';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { deleteBookAction } from '../actions/delete-book.action';
import { FanOutCards } from './fan-out-cards';

export function SavedBooksDisplay() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const setBookId = useBookStore((state) => state.setBookId);
  const router = useRouter();
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const [newBookName, setNewBookName] = useState('');
  const [bookBeingNamed, setBookBeingNamed] = useState(''); // Use book id string to represent the book being named
  const [bookBeingDeleted, setBookBeingDeleted] = useState('');
  const [bookBeingUpserted, setBookBeingUpserted] = useState('');

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

  const handleUpsertBook = async (name: string) => {
    if (bookBeingNamed.length === 0) return;
    const existent = savedBooks.some((book) => book.name === name);
    if (existent) {
      toast.error('Already exists');
      return;
    }
    setBookBeingUpserted(bookBeingNamed);
    setBookBeingNamed('');
    const isAdding = bookBeingNamed === 'addBook';
    const bookId = isAdding ? crypto.randomUUID() : bookBeingNamed;
    const res = await upsertBookAction({ name, bookId });
    if (!res.success) toast.error(res.error);
    else {
      const upsertedBook = { id: bookId, name };
      if (isAdding) setSavedBooks((prev) => [...prev, upsertedBook]);
      else
        setSavedBooks((prev) =>
          prev.map((book) =>
            book.id === bookBeingNamed ? upsertedBook : book,
          ),
        );
    }
    setBookBeingUpserted('');
  };

  const deleteBook = async (bookId: string, index: number) => {
    setBookBeingDeleted(bookId);
    const res = await deleteBookAction(bookId);
    if (!res.success) toast.error(res.error);
    else setSavedBooks((prev) => prev.filter((_, i) => i !== index));
    setBookBeingDeleted('');
  };

  const bookNamingBox = (
    <div className="relative h-8 w-3/5">
      <input
        autoFocus
        onBlur={() => setBookBeingNamed('')}
        className="ring-2 border-0 focus:outline-none relative h-full w-full rounded-sm p-2 focus:ring-foreground"
        value={newBookName}
        maxLength={20}
        onChange={(e) => setNewBookName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleUpsertBook(newBookName)}
      />

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full cursor-pointer pointer-events-auto group/check',
          'absolute right-0.5 bottom-1/2 translate-y-1/2',
        )}
      >
        <Check
          onClick={() => handleUpsertBook(newBookName)}
          size={18}
          className={cn(
            'text-green-500 opacity-70 group-hover/check:opacity-100 group-hover/check:scale-110 transition-all duration-100',
          )}
        />
      </Button>
    </div>
  );

  if (isFetchingBooks)
    return (
      <div className="pb-[15%] w-full h-200 flex justify-center items-center">
        <FanOutCards />
      </div>
    );

  return (
    <div className="py-[10%] px-[12%] flex flex-wrap items-center gap-15">
      {savedBooks.length > 0 &&
        savedBooks.map((book, index) => {
          const bookName = (
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setBookBeingNamed(book.id);
              }}
            >
              <span className="text-lg">{book.name}</span>
            </Button>
          );

          const trashButton = (
            <Button
              size="icon"
              variant="destructive"
              className="absolute bottom-1/9 cursor-pointer opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                deleteBook(book.id, index);
              }}
            >
              <Trash2 />
            </Button>
          );

          let content;
          if (bookBeingNamed === book.id) {
            content = (
              <>
                {bookNamingBox}
                {trashButton}
              </>
            );
          } else if (
            bookBeingDeleted === book.id ||
            bookBeingUpserted === book.id
          ) {
            content = <LoadingCircle size={25} />;
          } else {
            content = (
              <>
                {bookName}
                {trashButton}
              </>
            );
          }

          return (
            <ClickCard
              key={book.id}
              onClick={() => handleOpenBook(book.id)}
              className="relative rounded-sm w-50 h-65 flex flex-wrap items-center justify-center p-0 pb-4 group"
            >
              {content}
            </ClickCard>
          );
        })}

      <ClickCard
        onClick={() => setBookBeingNamed('addBook')}
        className={cn(
          'rounded-sm w-50 h-65 p-0 pb-2 flex justify-center items-center',
          'dark:border-dashed bg-foreground/5',
          bookBeingUpserted === 'addBook' || bookBeingNamed === 'addBook'
            ? 'pointer-events-none opacity-70 hover:shadow-md dark:hover:border-white/15'
            : 'group/plus',
        )}
      >
        {bookBeingUpserted === 'addBook' && <LoadingCircle size={25} />}
        {!bookBeingUpserted && bookBeingNamed !== 'addBook' && (
          <Plus
            className="group-hover/plus:scale-110 transition-all duration-150 text-foreground/70 group-hover:text-foreground"
            size={25}
          />
        )}

        {bookBeingUpserted !== 'addBook' &&
          bookBeingNamed === 'addBook' &&
          bookNamingBox}
      </ClickCard>
    </div>
  );
}
