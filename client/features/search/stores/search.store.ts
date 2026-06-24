import { create } from 'zustand';

interface SearchState {
  query: string;
  setQuery: (query: string) => void;
}

interface InputState {
  input: string;
  setInput: (input: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}));

export const useInputStore = create<InputState>((set) => ({
  input: '',
  setInput: (input) => set({ input }),
}));
