import { create } from 'zustand';
import { SearchItem } from '../types/search-item';
import { SavedBook } from '@/features/saved';

interface SearchState {
  query: string;
  setQuery: (query: string) => void;
}

interface InputState {
  input: string;
  setInput: (input: string) => void;
}

interface OpenTermState {
  openTerm: boolean;
  setOpenTerm: (openTerm: boolean) => void;
  term: SearchItem | null;
  setTerm: (term: SearchItem) => void;
}

interface SearchOptionsState {
  toSaveBook: SavedBook;
  setToSaveBook: (toSaveBook: SavedBook) => void;
  layout: 'Scroll' | 'Page';
  setLayout: (layout: 'Scroll' | 'Page') => void;
  selectMode: 'Single' | 'Multiple';
  setSelectMode: (selectMode: 'Single' | 'Multiple') => void;
  save: boolean;
  setSave: (save: boolean) => void;
  selectAll: boolean;
  setSelectAll: (selectAll: boolean) => void;
}

// Used by server to fetch data
export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}));

// Used by SearchBox to display input
export const useInputStore = create<InputState>((set) => ({
  input: '',
  setInput: (input) => set({ input }),
}));

// Used by TermInfo to display term info card
export const useOpenTermStore = create<OpenTermState>((set) => ({
  openTerm: false,
  setOpenTerm: (openTerm) => set({ openTerm }),
  term: null,
  setTerm: (term: SearchItem) => set({ term }),
}));

export const useSearchOptionsStore = create<SearchOptionsState>((set) => ({
  toSaveBook: { id: '', name: 'Default' },
  setToSaveBook: (toSaveBook) => set({ toSaveBook: toSaveBook }),
  layout: 'Scroll',
  setLayout: (layout) => set({ layout: layout }),
  selectMode: 'Single',
  setSelectMode: (selectMode) => set({ selectMode }),
  save: false,
  setSave: (save) => set({ save }),
  selectAll: false,
  setSelectAll: (selectAll) => set({ selectAll }),
}));
