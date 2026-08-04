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
  Search,
} from 'lucide-react';
import { useBookOptionStore, useBookStore } from '../stores/saved.store';
import { Input } from '@/shared/components/ui/input';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { MAX_SEARCH_LIST_QUERY_LENGTH } from '@/features/search/constants/search.constants';

export function BookOptions() {
  const setOpenBook = useBookStore((state) => state.setOpenBook);
  const isSelecting = useBookStore((state) => state.isSelecting);

  const doReview = useBookOptionStore((state) => state.doReview);
  const deReview = useBookOptionStore((state) => state.deReview);
  const remove = useBookOptionStore((state) => state.remove);
  const moveTo = useBookOptionStore((state) => state.moveTo);
  const setMode = useBookOptionStore((state) => state.setMode);
  const setQuery = useBookOptionStore((state) => state.setQuery);
  const setAll = useBookOptionStore((state) => state.setAll);
  const setClear = useBookOptionStore((state) => state.setClear);
  const setDoReview = useBookOptionStore((state) => state.setDoReview);
  const setDeReview = useBookOptionStore((state) => state.setDeReview);
  const setRemove = useBookOptionStore((state) => state.setRemove);
  const setMoveTo = useBookOptionStore((state) => state.setMoveTo);

  return (
    <div
      className={cn(
        'flex gap-2 w-140',
        !isSelecting ? 'justify-between' : 'justify-center',
      )}
    >
      {!isSelecting && (
        <Button variant="ghost" onClick={() => setOpenBook(false)}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      )}
      {!isSelecting && (
        <div className="w-40 relative">
          <Search
            size={15}
            className="absolute right-2 bottom-1/2 translate-y-1/2"
          />
          <Input
            maxLength={MAX_SEARCH_LIST_QUERY_LENGTH}
            className="bg-muted-foreground/10! focus:bg-muted-foreground/20! w-full border-0 pl-3 pr-8 rounded-md"
            onChange={(e) => setQuery(e.target.value)}
          />
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
              disabled={doReview}
              variant="ghost"
              onClick={() => setDoReview(true)}
            >
              <ClockPlus />

              <span>Do-review</span>
            </Button>

            {/* De-review */}
            <Button
              disabled={deReview}
              variant="ghost"
              onClick={() => setDeReview(true)}
            >
              <ClockFading />

              <span>De-review</span>
            </Button>

            {/* Remove */}
            <Button
              disabled={remove}
              variant="ghost"
              onClick={() => setRemove(true)}
            >
              <Trash2 />
              <span>Remove</span>
            </Button>

            {/* Move to */}
            <Button
              disabled={moveTo !== ''}
              variant="ghost"
              onClick={() => setMoveTo('')}
            >
              <FolderPlus />
              <span>Move to</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
