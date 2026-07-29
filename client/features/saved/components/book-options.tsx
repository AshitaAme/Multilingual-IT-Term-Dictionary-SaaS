'use client';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';
import {
  ChevronLeft,
  List,
  Diamond,
  Clock,
  WalletCards,
  Eraser,
  ClockPlus,
  ClockFading,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { useBookOptionStore, useBookStore } from '../stores/saved.store';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';

export function BookOptions() {
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const isSelecting = useBookStore((state) => state.isSelecting);

  const review = useBookOptionStore((state) => state.review);
  const deReview = useBookOptionStore((state) => state.deReview);
  const remove = useBookOptionStore((state) => state.remove);
  const moveTo = useBookOptionStore((state) => state.moveTo);
  const setAll = useBookOptionStore((state) => state.setAll);
  const setClear = useBookOptionStore((state) => state.setClear);
  const setReview = useBookOptionStore((state) => state.setReview);
  const setDeReview = useBookOptionStore((state) => state.setDeReview);
  const setRemove = useBookOptionStore((state) => state.setRemove);
  const setMoveTo = useBookOptionStore((state) => state.setMoveTo);
  const setMode = useBookOptionStore((state) => state.setMode);

  return (
    <div
      className={cn(
        'flex gap-2',
        !isSelecting ? 'justify-between' : 'justify-center',
      )}
    >
      {!isSelecting && (
        <div>
          <Button variant="ghost" onClick={() => setOpenBook(false)}>
            <ChevronLeft />
            <span>Back</span>
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        {!isSelecting && (
          <>
            <Button variant="ghost" onClick={() => setMode('List')}>
              <List />
              <span>List</span>
            </Button>
            <Button variant="ghost" onClick={() => setMode('Card')}>
              <Diamond />
              <span>Card</span>
            </Button>
            <Button variant="ghost" onClick={() => setMode('Review')}>
              <Clock />
              <span>Review</span>
            </Button>
          </>
        )}
        {isSelecting && (
          <>
            {/* All */}
            <Button variant="ghost" onClick={() => setAll(true)}>
              <WalletCards />
              <span>All</span>
            </Button>

            {/* Clear */}
            <Button variant="ghost" onClick={() => setClear(true)}>
              <Eraser />
              <span>Clear</span>
            </Button>

            {/* Review */}
            <Button
              disabled={review}
              variant="ghost"
              onClick={() => setReview(true)}
            >
              {review ? (
                <>
                  <ClockPlus />
                  <span>Review</span>
                </>
              ) : (
                <LoadingCircle />
              )}
            </Button>

            {/* De-review */}
            <Button
              disabled={deReview}
              variant="ghost"
              onClick={() => setDeReview(true)}
            >
              {deReview ? (
                <>
                  <ClockFading />
                  <span>De-review</span>
                </>
              ) : (
                <LoadingCircle />
              )}
            </Button>

            {/* Remove */}
            <Button
              disabled={remove}
              variant="ghost"
              onClick={() => setRemove(true)}
            >
              {remove ? (
                <>
                  <Trash2 />
                  <span>Remove</span>
                </>
              ) : (
                <LoadingCircle />
              )}
            </Button>

            {/* Move to */}
            <Button
              disabled={moveTo !== ''}
              variant="ghost"
              onClick={() => setMoveTo('')}
            >
              {moveTo !== '' ? (
                <>
                  <FolderPlus />
                  <span>Move to</span>
                </>
              ) : (
                <LoadingCircle />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
