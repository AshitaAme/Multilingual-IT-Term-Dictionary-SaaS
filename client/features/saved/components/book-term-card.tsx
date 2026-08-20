'use client';

import { useMemo, useState } from 'react';
import { BookTerm } from '../types/book-term';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function BookTermCard({
  bookTermList,
  updateBookTermList,
  mode,
}: Readonly<{
  bookTermList: BookTerm[];
  updateBookTermList: (bookTermList: BookTerm[]) => void;
  mode: 'Card' | 'Review';
}>) {
  const [shownTerm, setShownTerm] = useState(0);
  const term = useMemo(
    () => bookTermList[shownTerm],
    [bookTermList, shownTerm],
  );
  const [showText, setShowText] = useState(false);
  return (
    <Card className="w-140 h-90 bg-background relative rounded-lg py-0">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-0 bottom-0 my-auto h-8 w-8 rounded-full z-20"
        disabled={shownTerm === 0}
        onClick={() => {
          setShownTerm((prev) => prev - 1);
          setShowText(false);
        }}
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        className="absolute right-4 top-0 bottom-0 my-auto h-8 w-8 rounded-full z-20"
        disabled={shownTerm === bookTermList.length - 1}
        onClick={() => {
          setShownTerm((prev) => prev + 1);
          setShowText(false);
        }}
      >
        <ChevronRight />
      </Button>

      <CardTitle className="px-8 pt-6 flex flex-col gap-1">
        <span className="text-sm font-normal text-foreground/50">
          {shownTerm + 1} / {bookTermList.length}
        </span>
        <span className="text-2xl">{term.name}</span>
      </CardTitle>

      <CardContent className="flex flex-1 min-h-0 justify-center overflow-hidden py-4">
        <div
          className={cn(
            'w-100 h-full flex justify-center overflow-auto',
            !showText && 'relative',
          )}
        >
          {!showText && (
            <Button
              variant="outline"
              onClick={() => setShowText(true)}
              className="rounded-md absolute bottom-8"
            >
              <span>Show text</span>
            </Button>
          )}
          {showText && <span>{term.text}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
