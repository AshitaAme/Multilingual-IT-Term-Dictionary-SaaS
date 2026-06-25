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

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}));

export const useInputStore = create<InputState>((set) => ({
  input: '',
  setInput: (input) => set({ input }),
}));

export const useOpenTermStore = create<OpenTermState>((set) => ({
  openTerm: false,
  setOpenTerm: (openTerm) => set({ openTerm }),
  term: null,
  setTerm: (term: SearchItem) => set({ term }),
}));
