'use client';

import { getSavedBooksAction, SavedBook } from '@/features/saved';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Book } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function SearchOptions() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const session = useSession();
  const userId = session.data?.user.id;
  const [toSaveBook, setToSaveBook] = useState('Default');
  const [displayMode, setDisplayMode] = useState<'Scroll' | 'Page'>('Scroll');
  const [selectMode, setSelectMode] = useState<'Single' | 'Multiple'>('Single');

  useEffect(() => {
    const fetchSavedBooks = async () => {
      if (!userId) return;
      setIsFetchingBooks(true);
      const res = await getSavedBooksAction();
      if (!res.success) toast.error(res.error);
      else setSavedBooks(res.data!);
      setToSaveBook(savedBooks[0].id);
      setIsFetchingBooks(false);
    };
    fetchSavedBooks();
  }, [savedBooks, userId]);

  return (
    <div className="flex gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button disabled={isFetchingBooks}>
            <Book />
            <span>{toSaveBook}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {savedBooks.map((book) => (
            <DropdownMenuItem
              key={book.id}
              onClick={() => setToSaveBook(book.id)}
            >
              <span>{book.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
