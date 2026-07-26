import { create } from 'zustand';

interface BookState {
  openBook: boolean;
  setOpenBook: (openBook: boolean) => void;
  bookId: string;
  setBookId: (bookId: string) => void;
}

interface ReviewState {
  openReview: boolean;
  setOpenReview: (openReview: boolean) => void;
  savedTermId: string;
  setSavedTermId: (savedTermId: string) => void;
}

interface OptionState {
  mode: 'List' | 'Card' | 'Review';
  setMode: (mode: 'List' | 'Card' | 'Review') => void;
}

export const useBookStore = create<BookState>((set) => ({
  openBook: false,
  setOpenBook: (openBook) => set({ openBook }),
  bookId: '',
  setBookId: (bookId) => set({ bookId }),
}));

export const useReviewStore = create<ReviewState>((set) => ({
  openReview: false,
  setOpenReview: (openReview) => set({ openReview }),
  savedTermId: '',
  setSavedTermId: (savedTermId) => set({ savedTermId }),
}));
