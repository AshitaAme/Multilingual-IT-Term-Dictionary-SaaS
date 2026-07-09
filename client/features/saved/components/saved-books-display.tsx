'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getSavedBooksAction } from '../actions/get-saved-books.action';
import { toast } from 'sonner';
import { Card } from '@/shared/components/ui/card';
import { useBookStore } from '../stores/saved.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { SavedBook } from '../types/saved-book';
import { addBookAction } from '../actions/add-book.action';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

export function SavedBooksDisplay() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const session = useSession();
  const userId = session.data?.user.id;
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const setBookId = useBookStore((state) => state.setBookId);
  const router = useRouter();
  const [isAddingBook, setIsAddingBook] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      const res = await getSavedBooksAction(userId!);
      if (!res.success) toast.error(res.error);
      else setSavedBooks(res.data!);
    };
    fetchBook();
  }, [router, userId]);

  const handleBookClick = (bookId: string) => {
    setBookId(bookId);
    setOpenBook(true);
  };

  const handleAddBook = async () => {
    setIsAddingBook(true);
    const name = '';
    const res = await addBookAction({ name, userId: userId! });
    if (!res.success) toast.error(res.error);
    else {
      const id = res.data!;
      setSavedBooks((prev) => [...prev, { id, name }]);
    }
    setIsAddingBook(false);
  };

  return (
    <div>
      {savedBooks.length > 0 &&
        savedBooks.map((savedBooks) => {
          return (
            <Card
              key={savedBooks.id}
              onClick={() => handleBookClick(savedBooks.id)}
            ></Card>
          );
        })}
      <Button variant="outline" onClick={handleAddBook} disabled={isAddingBook}>
        {isAddingBook && <LoadingCircle />}
        {!isAddingBook && (
          <>
            <span>Add saved books</span>
            <Plus size={8}></Plus>
          </>
        )}
      </Button>
    </div>
  );
}
