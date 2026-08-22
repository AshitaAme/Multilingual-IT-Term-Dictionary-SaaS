'use client';

import { useMemo, useState } from 'react';
import { BookTerm } from '../types/book-term';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, SquarePen } from 'lucide-react';
import { useModifyStore } from '../stores/saved.store';
import { cn } from '@/shared/utils/utils';
import { Rating } from 'ts-fsrs';
import { updateReviewAction } from '../actions/update-review.action';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { useTranslations } from 'next-intl';

export function BookTermCard({
  bookTermList,
  mode,
}: Readonly<{
  bookTermList: BookTerm[];
  mode: 'Card' | 'Review';
}>) {
  const t = useTranslations('saved.bookTermCard');
  const now = new Date();
  const cardMode = mode === 'Card';
  const initialWaitReview = bookTermList.filter(
    (t) => t.reviewCard && t.reviewCard.nextReviewAt.getTime() < now.getTime(),
  );

  const initialShownTermIdx = () =>
    cardMode ? 0 : Math.floor(Math.random() * initialWaitReview.length);
  const total = cardMode ? bookTermList.length : initialWaitReview.length;

  const [waitReview, updateWaitReview] = useImmer(initialWaitReview); // Terms to be reviewed
  const [shownTermIdx, setShownTermIdx] = useState(initialShownTermIdx); // Index of current shown term
  const [reviewed, setReviewed] = useState(0);

  const shownTerm = useMemo(
    () => bookTermList[shownTermIdx],
    [bookTermList, shownTermIdx],
  );
  const [showDef, setShowDef] = useState(false);
  const setModifiedTerm = useModifyStore((state) => state.setModifiedTerm);

  // Review
  const handleReviewClick = async (rating: 1 | 2 | 3 | 4) => {
    setReviewed((prev) => prev + 1);

    if (rating !== 1) {
      updateWaitReview((draft) => draft.filter((_, i) => i !== shownTermIdx));
    }
    setShownTermIdx(Math.floor(Math.random() * waitReview.length));

    const res = await updateReviewAction({
      savedTermId: shownTerm.savedTermId,
      rating,
    });
    if (!res.success) toast.error(res.error);
  };

  return (
    <div className="w-160 h-90">
      <div className="w-160 h-90 relative flex justify-center items-center p-0 space-y-0">
        {/* Page turing buttons in card mode */}
        {cardMode && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-0 bottom-0 my-auto h-8 w-8 rounded-full z-20"
              disabled={shownTermIdx === 0}
              onClick={() => {
                setShownTermIdx((prev) => prev - 1);
                setShowDef(false);
              }}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="absolute right-0 top-0 bottom-0 my-auto h-8 w-8 rounded-full z-20"
              disabled={shownTermIdx === total - 1}
              onClick={() => {
                setShownTermIdx((prev) => prev + 1);
                setShowDef(false);
              }}
            >
              <ChevronRight />
            </Button>
          </>
        )}

        {/* Term info */}
        <Card className="w-130 h-80 bg-background relative rounded-lg py-0 space-y-0">
          <CardTitle className="px-8 pt-6 flex flex-col gap-1">
            <span className="text-sm font-normal text-foreground/50">
              {cardMode ? shownTermIdx + 1 : reviewed} / {total}
            </span>
            <div className="flex items-baseline gap-1">
              {/* Modify term */}
              <span className="text-2xl">{shownTerm.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setModifiedTerm(shownTerm)}
              >
                <SquarePen />
              </Button>
            </div>
          </CardTitle>

          {/* Term definition */}
          <CardContent
            className={cn(
              'flex flex-1 overflow-auto relative px-10 pb-6 py-2',
              showDef && cardMode ? 'justify-start' : 'justify-center',
            )}
          >
            {!showDef && (
              <Button
                variant="outline"
                onClick={() => setShowDef(true)}
                className="rounded-md absolute bottom-25"
              >
                {t('showDef')}
              </Button>
            )}
            {showDef && (
              <span className="max-h-full overflow-auto px-4">
                {shownTerm.text}
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rating for review */}
      {!cardMode && (
        <div className="w-160 flex gap-4 items-center justify-center">
          <Button
            variant="ghost"
            onClick={() => handleReviewClick(Rating.Easy)}
          >
            {t('easy')}
          </Button>
          <span>|</span>
          <Button
            variant="ghost"
            onClick={() => handleReviewClick(Rating.Good)}
          >
            {t('good')}
          </Button>
          <span>|</span>
          <Button
            variant="ghost"
            onClick={() => handleReviewClick(Rating.Hard)}
          >
            {t('hard')}
          </Button>
          <span>|</span>
          <Button
            variant="ghost"
            onClick={() => handleReviewClick(Rating.Again)}
          >
            {t('again')}
          </Button>
        </div>
      )}
    </div>
  );
}
