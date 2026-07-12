'use client';

import { useEffect, useState } from 'react';
import { getSavedBooksAction } from '../actions/get-saved-books.action';
import { toast } from 'sonner';
import { useBookStore } from '../stores/saved.store';
import { useRouter } from 'next/navigation';
import { Check, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { SavedBook } from '../types/saved-book';
import { addBookAction } from '../actions/add-book.action';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { ClickCard } from '@/shared/components/ui/click-card';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';

export function SavedBooksDisplay() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const setBookId = useBookStore((state) => state.setBookId);
  const router = useRouter();
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isNamingBook, setIsNamingBook] = useState<string>('');

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

  const deleteBook = async (bookId: string, index: number) => {};

  const bookNamingBox = (
    <div className="relative h-8 w-3/5">
      <input
        autoFocus
        onBlur={() => setIsNamingBook('')}
        className="ring-2 border-0 focus:outline-none relative h-full w-full rounded-sm p-2 focus:ring-foreground"
        value={nameInput}
        maxLength={20}
        onChange={(e) => setNameInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsNamingBook('');
            addBook(nameInput);
          }
        }}
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
          onClick={() => {
            setIsNamingBook('');
            addBook(nameInput);
          }}
          size={18}
          className={cn(
            'text-green-500 opacity-70 group-hover/check:opacity-100 group-hover/check:scale-110 transition-all duration-100',
          )}
        />
      </Button>
    </div>
  );

  return (
    <div className="py-[10%] px-[12%] flex flex-wrap items-center gap-15">
      {savedBooks.length > 0 &&
        savedBooks.map((book, index) => {
          return (
            <ClickCard
              key={book.id}
              onClick={() => handleOpenBook(book.id)}
              className="relative rounded-sm w-50 h-65 flex flex-wrap items-center justify-center p-0 pb-4 group"
            >
              {isNamingBook === book.id ? (
                bookNamingBox
              ) : (
                <Button
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNamingBook(book.id);
                  }}
                >
                  <span className="text-lg">{book.name}</span>
                </Button>
              )}

              <Button
                size="icon"
                variant="destructive"
                className="absolute bottom-1/9 cursor-pointer opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBook(book.id, index);
                }}
              >
                <Trash2 className="" />
              </Button>
            </ClickCard>
          );
        })}
      <ClickCard
        onClick={() => setIsNamingBook('addBook')}
        className={cn(
          'rounded-sm w-50 h-65 p-0 pb-2 flex justify-center items-center',
          'dark:border-dashed bg-foreground/5',
          isAddingBook || isNamingBook === 'addBook'
            ? 'pointer-events-none opacity-70 hover:shadow-md dark:hover:border-white/15'
            : 'group/plus',
        )}
      >
        {isAddingBook && <LoadingCircle size={25} />}
        {!isAddingBook && isNamingBook !== 'addBook' && (
          <Plus
            className="group-hover/plus:scale-110 transition-all duration-150 text-foreground/70 group-hover:text-foreground"
            size={25}
          />
        )}

        {!isAddingBook && isNamingBook === 'addBook' && bookNamingBox}
      </ClickCard>
    </div>
  );
}
