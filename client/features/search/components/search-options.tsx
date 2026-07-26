'use client';

import {
  getSavedBooksAction,
  SavedBook,
  upsertBookAction,
} from '@/features/saved';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Book,
  Bookmark,
  Check,
  Columns2,
  Menu,
  Plus,
  SquareDashedText,
  SquareMousePointer,
  WalletCards,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSearchOptionStore } from '../stores/search.store';

import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { LoadingCircle } from '@/shared/components/ui/loading-circle';
import { cn } from '@/shared/utils/utils';
import { Separator } from 'radix-ui';

export function SearchOptions() {
  const session = useSession();
  const userId = session.data?.user.id;

  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const [isNamingBook, setIsNamingBook] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);

  const toSaveBook = useSearchOptionStore((state) => state.toSaveBook);
  const setToSaveBook = useSearchOptionStore((state) => state.setToSaveBook);
  const layout = useSearchOptionStore((state) => state.layout);
  const setLayout = useSearchOptionStore((state) => state.setLayout);
  const selectMode = useSearchOptionStore((state) => state.selectMode);
  const setSelectMode = useSearchOptionStore((state) => state.setSelectMode);
  const doSave = useSearchOptionStore((state) => state.doSave);
  const setDoSave = useSearchOptionStore((state) => state.setDoSave);
  const setSelectAll = useSearchOptionStore((state) => state.setSelectAll);

  // Fetch saved books
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

  const handleAddBook = async (name: string) => {
    setIsAddingBook(true);
    const bookId = crypto.randomUUID();
    const res = await upsertBookAction({ bookId, name });
    if (!res.success) toast.error(res.error);
    else setSavedBooks((prev) => [...prev, { id: bookId, name }]);
    setNewBookName('');
    setIsNamingBook(false);
    setIsAddingBook(false);
  };

  const handleCancelAdding = () => {
    setIsNamingBook(false);
    setNewBookName('');
  };

  return (
    <div className="flex gap-4">
      {/* Book to save */}
      {userId && (
        <DropdownMenu onOpenChange={handleCancelAdding}>
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
            <DropdownMenuGroup>
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
                  onSelect={(e) => e.preventDefault()}
                  key={book.id}
                  onClick={() => {
                    setToSaveBook(book);
                    setIsNamingBook(false);
                  }}
                  className="flex justify-between items-center relative group"
                >
                  <span
                    className={cn(
                      'w-20 inline-block truncate',
                      toSaveBook.id !== book.id &&
                        'opacity-70 group-hover:opacity-100',
                    )}
                  >
                    {book.name}
                  </span>
                  {toSaveBook.id === book.id && (
                    <Check
                      color="#22c55e"
                      style={{ color: '#22c55e', stroke: '#22c55e' }}
                      className="absolute right-1 bottom-1/2 translate-y-1/2"
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-2 mt-1" />
            <DropdownMenuGroup>
              {/* Add book */}
              <DropdownMenuItem
                disabled={isAddingBook}
                onSelect={(e) => e.preventDefault()}
                onClick={() => setIsNamingBook(true)}
                className={cn(
                  'h-8 flex items-center justify-center relative group',
                  isNamingBook && 'pointer-events-none',
                )}
              >
                {isAddingBook && <LoadingCircle />}
                {!isAddingBook && !isNamingBook && (
                  <Plus
                    size={8}
                    className="absolute opacity-70 group-hover:opacity-100 transition-all duration-100"
                  />
                )}
                {!isAddingBook && isNamingBook && (
                  <input
                    autoFocus
                    onPointerLeave={(e) => e.preventDefault()}
                    onPointerMove={(e) => e.stopPropagation()}
                    className={cn(
                      'pointer-events-auto ring-1 opacity-70 hover-opacity-100 focus:opacity-100 border-0',
                      'focus:outline-none relative h-full w-full rounded-sm p-2 focus:ring-foreground',
                      'px-2 pb-2.5',
                    )}
                    value={newBookName}
                    maxLength={20}
                    onChange={(e) => {
                      setNewBookName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        handleAddBook(newBookName);
                      }
                    }}
                  />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
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

      {/* Select all */}
      <TooltipWrapper label="Select All" side="bottom">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectMode('Multiple');
            setSelectAll(true);
          }}
        >
          <WalletCards />
          <span>All</span>
        </Button>
      </TooltipWrapper>

      {/* Save */}
      <TooltipWrapper label="Save" side="bottom">
        <Button
          disabled={selectMode === 'Single' || doSave}
          variant="ghost"
          onClick={() => setDoSave(true)}
        >
          {doSave ? <LoadingCircle /> : <Bookmark />}
          <span>Save</span>
        </Button>
      </TooltipWrapper>
    </div>
  );
}
