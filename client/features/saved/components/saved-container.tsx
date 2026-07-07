'use client';

import { AUTH_ERRORS } from '@/shared/constants/constants';
import { useSession } from 'next-auth/react';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { SavedBook } from '../types/saved-books';
import { getSavedBooksAction } from '../actions/get-saved-books.action';
import { toast } from 'sonner';
import { Card } from '@/shared/components/ui/card';

export function SavedContainer() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const session = useSession();
  const userId = session.data?.user.id;
  useEffect(() => {
    const fetchBook = async () => {
      if (!userId) {
        router.replace(`/?error=${AUTH_ERRORS.AUTH_REQUIRED}`);
        return;
      }
      const res = await getSavedBooksAction(userId);
      if (!res.success) toast.error(res.error);
      else setSavedBooks(res.data!);
    };
    fetchBook();
  }, [userId]);
  return (
    <div>
      {savedBooks.map((savedBooks) => {
        return <Card key={savedBooks.id}></Card>;
      })}
    </div>
  );
}
