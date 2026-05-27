// features/auth/store/auth-modal.store.ts
import { create } from 'zustand';

type AuthModalStore = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  open: false,
  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
}));
