'use client';

import { useMemo, useState } from 'react';
import { BookTerm } from '../types/book-term';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, SquarePen } from 'lucide-react';
import { useTermTextStore } from '../stores/saved.store';
import { cn } from '@/shared/utils/utils';
import { Rating } from 'ts-fsrs';
import { updateReviewAction } from '../actions/update-review.action';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { useTranslations } from 'next-intl';
import { TermTextSchema } from '../schemas/term-text-form.schema';
import { DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';

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

  // Initial list of terms to be reviewed
  const initialWaitReview = bookTermList.filter(
    (t) => t.reviewCard && t.reviewCard.nextReviewAt.getTime() < now.getTime(),
  );

  // Total terms for showing due to mode
  const total = cardMode ? bookTermList.length : initialWaitReview.length;

  // Index of initial shown term
  const initialShownTermIdx = () =>
    cardMode ? 0 : Math.floor(Math.random() * initialWaitReview.length);

  const [waitReview, updateWaitReview] = useImmer(initialWaitReview); // Terms to be reviewed
  const [shownTermIdx, setShownTermIdx] = useState(initialShownTermIdx); // Index of current shown term
  const [reviewed, setReviewed] = useState(0);

  const reviewEnd = useMemo(
    () => !cardMode && reviewed === total,
    [cardMode, reviewed, total],
  );

  const shownTerm = useMemo(() => {
    if (reviewEnd) return null;
    if (cardMode) {
      return bookTermList[shownTermIdx];
    } else {
      return waitReview[shownTermIdx];
    }
  }, [bookTermList, cardMode, reviewEnd, shownTermIdx, waitReview]);

  const termTranslations = useMemo(() => {
    if (reviewEnd || !shownTerm) return [];
    const obj = JSON.parse(shownTerm.text);
    const parsed = TermTextSchema.safeParse(obj);
    console.log('[term text]: ', parsed);
    if (parsed.success) return parsed.data;
    else return [];
  }, [reviewEnd, shownTerm]);

  const [showDef, setShowDef] = useState(false);
  const setModifiedTerm = useTermTextStore((state) => state.setTerm);

  // Review
  const handleReviewClick = async (rating: 1 | 2 | 3 | 4) => {
    const currentTerm = shownTerm;
    if (!currentTerm) return;
    const updateTerm = () =>
      updateWaitReview((draft) => draft.filter((_, i) => i !== shownTermIdx));

    if (rating === 1) {
      updateTerm();
      return;
    }

    let nextWaitReviewLength = waitReview.length;
    updateTerm();
    setReviewed((prev) => prev + 1);
    nextWaitReviewLength -= 1;
    if (nextWaitReviewLength <= 0) {
      setShownTermIdx(0);
    } else {
      const nextIdx = Math.floor(Math.random() * nextWaitReviewLength);
      setShownTermIdx(nextIdx);
    }

    setShowDef(false);
    const res = await updateReviewAction({
      savedTermId: shownTerm.savedTermId,
      rating,
    });
    if (!res.success) {
      toast.error(res.error);
    }
  };

  const cardInfo = reviewEnd ? (
    <div className="h-80 flex flex-col items-center justify-center text-2xl font-semibold pb-6">
      {t('congratulations')}
    </div>
  ) : (
    <>
      <CardTitle className="px-8 pt-6 flex flex-col gap-1">
        <span className="text-sm font-normal text-foreground/50">
          {cardMode ? shownTermIdx + 1 : reviewed} / {total}
        </span>
        <div className="flex items-baseline gap-1">
          {/* Modify term */}
          <span className="text-2xl">{shownTerm!.name}</span>
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
          'flex flex-1 overflow-auto relative px-10 py-2 pb-6',
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
          <span className="max-h-full overflow-auto px-4 flex flex-col">
            {termTranslations.map((translation, index) => {
              return (
                <div key={translation.lang} className="flex flex-col gap-2">
                  {index !== 0 && (
                    <DropdownMenuSeparator className="mt-4 mb-4" />
                  )}
                  <div className="flex gap-2">
                    <span className="font-bold">{translation.lang}</span>
                    <span className="pb-1 font-light font-">|</span>
                    <span>{translation.name}</span>
                  </div>
                  <span className="pl-4">{translation.def}</span>
                </div>
              );
            })}
          </span>
        )}
      </CardContent>
    </>
  );

  return (
    <div className="flex flex-col items-center w-160 h-90 gap-6">
      <div className="w-160 h-80 relative flex flex-col items-center p-0 space-y-0">
        {/* Card changing */}
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
          {cardInfo}
        </Card>
      </div>

      {/* Rating for review */}
      {!cardMode && !reviewEnd && (
        <div className="w-160 flex gap-6 items-center justify-center">
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
