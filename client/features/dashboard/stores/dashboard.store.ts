import { create } from 'zustand';
import { TermFormInput } from '../schemas/term-form.schema';
import { TagFormInput } from '../schemas/tag-form.schema';

export interface TermFormState {
  openForm: boolean;
  setOpenForm: (openForm: boolean) => void;
  formInput: TermFormInput | null;
  setFormInput: (formInput: TermFormInput | null) => void;
  isUpdated: boolean;
  setIsUpdated: (isUpdate: boolean) => void;
}

export interface TagFormState {
  openForm: boolean;
  setOpenForm: (openForm: boolean) => void;
  formInput: TagFormInput | null;
  setFormInput: (formInput: TagFormInput | null) => void;
  isUpdated: boolean;
  setIsUpdated: (isUpdate: boolean) => void;
}

export const useTermFormStore = create<TermFormState>((set) => ({
  openForm: false,
  setOpenForm: (openForm) => set({ openForm: openForm }),
  formInput: null,
  setFormInput: (formInput) => set({ formInput: formInput }),
  isUpdated: false,
  setIsUpdated: (isUpdate) => set({ isUpdated: isUpdate }),
}));

export const useTagFormStore = create<TagFormState>((set) => ({
  openForm: false,
  setOpenForm: (openForm) => set({ openForm: openForm }),
  formInput: null,
  setFormInput: (formInput) => set({ formInput: formInput }),
  isUpdated: false,
  setIsUpdated: (isUpdate) => set({ isUpdated: isUpdate }),
}));
