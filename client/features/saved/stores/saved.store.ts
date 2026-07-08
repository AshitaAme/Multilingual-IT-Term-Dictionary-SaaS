import { create } from 'zustand';

interface BookState {
  openBook: boolean;
  setOpenBook: (openBook: boolean) => void;
  bookId: string;
  setBookId: (bookId: string) => void;
}

export const useBookStore = create<BookState>((set) => ({
  openBook: false,
  setOpenBook: (openBook) => set({ openBook }),
  bookId: '',
  setBookId: (bookId) => set({ bookId }),
}));
