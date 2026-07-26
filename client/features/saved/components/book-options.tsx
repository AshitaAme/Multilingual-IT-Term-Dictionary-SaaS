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

export function BookOptions() {
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const isSelecting = useBookStore((state) => state.isSelecting);

  const setAll = useBookOptionStore((state) => state.setAll);
  const setClear = useBookOptionStore((state) => state.setClear);
  const setReview = useBookOptionStore((state) => state.setReview);
  const setDeReview = useBookOptionStore((state) => state.setDeReview);
  const setMode = useBookOptionStore((state) => state.setMode);
  const setMoveTo = useBookOptionStore((state) => state.setMoveTo);
  const setRemove = useBookOptionStore((state) => state.setRemove);

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
            <Button variant="ghost" onClick={() => setAll(true)}>
              <WalletCards />
              <span>All</span>
            </Button>
            <Button variant="ghost" onClick={() => setClear(true)}>
              <Eraser />
              <span>Clear</span>
            </Button>
            <Button variant="ghost" onClick={() => setReview(true)}>
              <ClockPlus />
              <span>Review</span>
            </Button>
            <Button variant="ghost" onClick={() => setDeReview(true)}>
              <ClockFading />
              <span>De-review</span>
            </Button>
            <Button variant="ghost" onClick={() => setRemove(true)}>
              <Trash2 />
              <span>Remove</span>
            </Button>
            <Button variant="ghost" onClick={() => setMoveTo('')}>
              <FolderPlus />
              <span>Move to</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
