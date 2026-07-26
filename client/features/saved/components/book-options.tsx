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

export function BookOptions() {
  const selected = new Set();

  return (
    <div
      className={cn(
        'flex gap-2',
        //   selected.size === 0 ? 'justify-between' : 'justify-center',
      )}
    >
      {selected.size === 0 && (
        <div>
          <Button variant="ghost" onClick={() => setOpenBook(false)}>
            <ChevronLeft />
            <span>Back</span>
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        {selected.size === 0 && (
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
        {selected.size !== 0 && (
          <>
            <Button variant="ghost" onClick={handleAllClick}>
              <WalletCards />
              <span>All</span>
            </Button>
            <Button variant="ghost">
              <Eraser />
              <span>Clear</span>
            </Button>
            <Button variant="ghost">
              <ClockPlus />
              <span>Review</span>
            </Button>
            <Button variant="ghost">
              <ClockFading />
              <span>De-review</span>
            </Button>
            <Button variant="ghost">
              <FolderPlus />
              <span>Move</span>
            </Button>
            <Button variant="ghost">
              <Trash2 />
              <span>Delete</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
