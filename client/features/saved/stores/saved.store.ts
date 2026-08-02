import { create } from 'zustand';

interface BookState {
  openBook: boolean; // bookId
  setOpenBook: (openBook: boolean) => void;
  bookId: string;
  setBookId: (bookId: string) => void;
  isSelecting: boolean;
  setIsSelecting: (isSelecting: boolean) => void;
}

interface OptionState {
  mode: 'List' | 'Card' | 'Review';
  setMode: (mode: 'List' | 'Card' | 'Review') => void;
  query: string;
  setQuery: (query: string) => void;
  all: boolean;
  setAll: (all: boolean) => void;
  clear: boolean;
  setClear: (clear: boolean) => void;
  doReview: boolean;
  setDoReview: (doReview: boolean) => void;
  deReview: boolean;
  setDeReview: (deReview: boolean) => void;
  moveTo: string; // bookId;
  setMoveTo: (move: string) => void;
  remove: boolean;
  setRemove: (remove: boolean) => void;
}

export const useBookStore = create<BookState>((set) => ({
  openBook: false,
  setOpenBook: (openBook) => set({ openBook }),
  bookId: '',
  setBookId: (bookId) => set({ bookId }),
  isSelecting: false,
  setIsSelecting: (isSelecting) => set({ isSelecting }),
}));

export const useBookOptionStore = create<OptionState>((set) => ({
  mode: 'List',
  setMode: (mode) => set({ mode }),
  query: '',
  setQuery: (query) => set({ query }),
  all: false,
  setAll: (all) => set({ all }),
  clear: false,
  setClear: (clear) => set({ clear }),
  doReview: false,
  setDoReview: (doReview) => set({ doReview: doReview }),
  deReview: false,
  setDeReview: (deReview) => set({ deReview }),
  moveTo: '',
  setMoveTo: (moveTo) => set({ moveTo }),
  remove: false,
  setRemove: (remove) => set({ remove }),
}));
