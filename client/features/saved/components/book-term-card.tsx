'use server';

import { useMemo, useState } from 'react';
import { BookTerm } from '../types/book-term';
import { Card } from '@/shared/components/ui/card';

export function BookTermCard({
  bookTermList,
  updateBookTermList,
  mode,
}: Readonly<{
  bookTermList: BookTerm[];
  updateBookTermList: (bookTermList: BookTerm[]) => void;
  mode: 'Card' | 'Review';
}>) {
  const [shown, setShown] = useState(0);
  const term = useMemo(() => bookTermList[shown], [bookTermList, shown]);
  return (
    <div>
      <Card></Card>
    </div>
  );
}
