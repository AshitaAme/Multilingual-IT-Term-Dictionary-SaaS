// features/auth/store/auth-modal.store.ts
import { create } from 'zustand';
import { checkAdminAction } from '../actions/check-admin.action';

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

type AuthRoleStore = {
  role: string;
  loading: boolean;
  setRole: (role: string) => void;
  fetchRole: () => Promise<void>;
  clearRole: () => void;
};

export const useAuthRoleStore = create<AuthRoleStore>((set, get) => ({
  role: '',
  loading: true,

  setRole: (role) => set({ role }),
  clearRole: () => set({ role: '', loading: false }),

  fetchRole: async () => {
    if (get().role !== '') {
      set({ loading: false });
      return;
    }

    try {
      set({ loading: true });
      const res = await checkAdminAction();
      if (res.success) set({ role: 'admin' });
      else set({ role: 'user' });
    } catch {
      set({ role: 'user' });
    } finally {
      set({ loading: false });
    }
  },
}));
