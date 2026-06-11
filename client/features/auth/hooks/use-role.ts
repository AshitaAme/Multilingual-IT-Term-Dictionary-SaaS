'use client';
// features/auth/hooks/use-role.ts
import { useEffect } from 'react';
import { useAuthRoleStore } from '../stores/auth.store';
export const useRole = () => {
  const role = useAuthRoleStore((state) => state.role);
  const loading = useAuthRoleStore((state) => state.loading);
  const fetchRole = useAuthRoleStore((state) => state.fetchRole);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return { role, loading };
};
