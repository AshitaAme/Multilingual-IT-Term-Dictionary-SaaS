// features/auth/store/auth-modal.store.ts
import { create } from 'zustand';
import { retrieveRole } from '../actions/retrieve-role.action';
import { getSession } from 'next-auth/react';

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

type AuthRole = 'admin' | 'user' | 'guest' | '';
const VALID_ROLES = new Set(['admin', 'user', 'guest']);

type AuthRoleStore = {
  role: AuthRole;
  loading: boolean;
  setRole: (role: AuthRole) => void;
  fetchRole: () => Promise<void>;
  clearRole: () => void;
};

export const useAuthRoleStore = create<AuthRoleStore>((set, get) => ({
  role: '',
  loading: false,

  setRole: (role) => set({ role }),
  clearRole: () => set({ role: '', loading: false }),

  fetchRole: async () => {
    if (get().role !== '') return;

    try {
      set({ loading: true });

      const session = await getSession();
      if (!session) {
        set({ role: 'guest' });
        return;
      }
      const res = await retrieveRole(session.user.id);
      const role = VALID_ROLES.has(res.data) ? res.data : 'guest';
      set({ role: role as AuthRole });
    } catch {
      set({ role: 'guest' });
    } finally {
      set({ loading: false });
    }
  },
}));
