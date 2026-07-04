import { create } from 'zustand';
import { SearchItem } from '../types/search-item';

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
