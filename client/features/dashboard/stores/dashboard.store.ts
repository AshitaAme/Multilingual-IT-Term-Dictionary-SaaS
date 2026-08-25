import { create } from 'zustand';
import { TermFormInput } from '../schemas/term-form.schema';

export interface TermFormState {
  openTermForm: boolean;
  setOpenTermForm: (openTermForm: boolean) => void;
  termForm: TermFormInput | null;
  setTermForm: (input: TermFormInput | null) => void;
  isUpdated: boolean;
  setIsUpdated: (isUpdate: boolean) => void;
}

export const useTermFormStore = create<TermFormState>((set) => ({
  openTermForm: false,
  setOpenTermForm: (openTermForm) => set({ openTermForm: openTermForm }),
  termForm: null,
  setTermForm: (input) => set({ termForm: input }),
  isUpdated: false,
  setIsUpdated: (isUpdate) => set({ isUpdated: isUpdate }),
}));
