'use client';

import { getSavedBooksAction, SavedBook } from '@/features/saved';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Book,
  Bookmark,
  Check,
  Columns2,
  Menu,
  SquareDashedText,
  SquareMousePointer,
  WalletCards,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSearchOptionsStore } from '../stores/search.store';

import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';

export function SearchOptions() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const session = useSession();
  const userId = session.data?.user.id;
  const toSaveBook = useSearchOptionsStore((state) => state.toSaveBook);
  const setToSaveBook = useSearchOptionsStore((state) => state.setToSaveBook);
  const layout = useSearchOptionsStore((state) => state.layout);
  const setLayout = useSearchOptionsStore((state) => state.setLayout);
  const selectMode = useSearchOptionsStore((state) => state.selectMode);
  const setSelectMode = useSearchOptionsStore((state) => state.setSelectMode);
  const setSave = useSearchOptionsStore((state) => state.setSave);
  const setSelectAll = useSearchOptionsStore((state) => state.setSelectAll);

  useEffect(() => {
    const fetchSavedBooks = async () => {
      if (!userId) return;
      setIsFetchingBooks(true);
      const res = await getSavedBooksAction();
      if (!res.success) {
        toast.error(res.error);
        setIsFetchingBooks(false);
        return;
      } else setSavedBooks(res.data!);
      setIsFetchingBooks(false);
    };
    fetchSavedBooks();
  }, [userId]);

  useEffect(() => {
    if (savedBooks.length > 0) setToSaveBook(savedBooks[0]);
  }, [savedBooks, setToSaveBook]);

  return (
    <div className="flex gap-4">
      {/* Book to save */}
      {userId && (
        <DropdownMenu>
          <TooltipWrapper label={toSaveBook.name} side="bottom">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                disabled={isFetchingBooks || savedBooks.length === 0}
              >
                <Book />
                <span className="truncate inline-block text-left">Book</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipWrapper>
          <DropdownMenuContent
            sideOffset={8}
            align="center"
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="min-w-0 w-30 py-2"
          >
            {/* Default */}
            {savedBooks.length === 0 && (
              <DropdownMenuItem disabled={true}>
                <span>Default</span>
                <Check
                  color="#22c55e"
                  style={{ color: '#22c55e', stroke: '#22c55e' }}
                  className="absolute right-1 bottom-1/2 translate-y-1/2"
                />
              </DropdownMenuItem>
            )}
            {/* Saved books */}
            {savedBooks.map((book) => (
              <DropdownMenuItem
                key={book.id}
                onClick={() => setToSaveBook(book)}
                className="flex justify-between items-center relative"
              >
                <span className="w-20 inline-block truncate">{book.name}</span>
                {toSaveBook.id === book.id && (
                  <Check
                    color="#22c55e"
                    style={{ color: '#22c55e', stroke: '#22c55e' }}
                    className="absolute right-1 bottom-1/2 translate-y-1/2"
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Layout */}
      <TooltipWrapper label={layout + ' layout'} side="bottom">
        <Button
          variant="ghost"
          onClick={() => setLayout(layout === 'Scroll' ? 'Page' : 'Scroll')}
        >
          {layout === 'Scroll' ? <Menu /> : <Columns2 />}
          <span>Layout</span>
        </Button>
      </TooltipWrapper>

      {/* Select */}
      <TooltipWrapper
        label={'Select ' + selectMode.toLocaleLowerCase()}
        side="bottom"
      >
        <Button
          variant="ghost"
          onClick={() =>
            setSelectMode(selectMode === 'Single' ? 'Multiple' : 'Single')
          }
        >
          {selectMode === 'Single' ? (
            <SquareMousePointer />
          ) : (
            <SquareDashedText />
          )}
          <span>Select</span>
        </Button>
      </TooltipWrapper>

      <TooltipWrapper label="Save" side="bottom">
        <Button
          disabled={selectMode === 'Single'}
          variant="ghost"
          onClick={() => setSave(true)}
        >
          <Bookmark />
          <span>Save</span>
        </Button>
      </TooltipWrapper>

      <TooltipWrapper label="Select All" side="bottom">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectMode('Multiple');
            setSelectAll(true);
          }}
        >
          <WalletCards />
          <span>Select all</span>
        </Button>
      </TooltipWrapper>
    </div>
  );
}
