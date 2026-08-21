'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookTerm } from '../types/book-term';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  SeparatorVertical,
  SquarePen,
} from 'lucide-react';
import { useModifyStore } from '../stores/saved.store';
import { cn } from '@/shared/utils/utils';
import { Separator } from '@/shared/components/ui/separator';

export function BookTermCard({
  bookTermList,
  mode,
}: Readonly<{
  bookTermList: BookTerm[];
  mode: 'Card' | 'Review';
}>) {
  const cardMode = mode === 'Card';
  const waitReview = bookTermList.filter(
    (t) =>
      t.reviewCard &&
      t.reviewCard.nextReviewAt.getTime() < new Date().getTime(),
  );
  const total = cardMode ? bookTermList.length : waitReview.length;
  const [shownTerm, setShownTerm] = useState(() =>
    cardMode ? 0 : Math.floor(Math.random() * waitReview.length),
  );
  const [reviewed, setReviewed] = useState(0);

  const term = useMemo(
    () => bookTermList[shownTerm],
    [bookTermList, shownTerm],
  );

  const [showText, setShowText] = useState(false);
  const setModifiedTerm = useModifyStore((state) => state.setModifiedTerm);
  const handleReviewClick = (remember: boolean) => {
    if (remember) {
      setReviewed((prev) => prev + 1);
    }
  };

  return (
    <div className="w-160 h-90">
      <div className="w-160 h-90 relative flex justify-center items-center p-0 space-y-0">
        {cardMode && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-0 bottom-0 my-auto h-8 w-8 rounded-full z-20"
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
              className="absolute right-0 top-0 bottom-0 my-auto h-8 w-8 rounded-full z-20"
              disabled={shownTerm === total - 1}
              onClick={() => {
                setShownTerm((prev) => prev + 1);
                setShowText(false);
              }}
            >
              <ChevronRight />
            </Button>
          </>
        )}

        <Card className="w-130 h-80 bg-background relative rounded-lg py-0 space-y-0">
          <CardTitle className="px-8 pt-6 flex flex-col gap-1">
            <span className="text-sm font-normal text-foreground/50">
              {shownTerm + 1} / {total}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl">{term.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setModifiedTerm(term)}
              >
                <SquarePen />
              </Button>
            </div>
          </CardTitle>

          <CardContent
            className={cn(
              'flex flex-1 overflow-auto relative px-10 pb-6 py-2',
              showText && cardMode ? 'justify-start' : 'justify-center',
            )}
          >
            {!showText && (
              <Button
                variant="outline"
                onClick={() => setShowText(true)}
                className="rounded-md absolute bottom-25"
              >
                <span>Show text</span>
              </Button>
            )}
            {showText && (
              <span className="max-h-full overflow-auto px-4">{term.text}</span>
            )}
          </CardContent>
        </Card>
      </div>
      {!cardMode && (
        <div className="w-160 flex gap-4 items-center justify-center">
          <Button variant="ghost" onClick={() => handleReviewClick(true)}>
            Yes
          </Button>
          <span>|</span>
          <Button variant="ghost" onClick={() => handleReviewClick(true)}>
            No
          </Button>
        </div>
      )}
    </div>
  );
}
