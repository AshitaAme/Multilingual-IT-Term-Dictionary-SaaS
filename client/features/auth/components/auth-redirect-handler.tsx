'use client';

import { useSearchParams } from 'next/navigation';
import { useAuthModalStore } from '../store/auth-modal.store';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AUTH_ERRORS, ROUTES } from '../../../shared/constants/constants';

export function AuthRedirectHandler() {
  const searchParams = useSearchParams();
  const { onOpen } = useAuthModalStore();

  useEffect(() => {
    if (searchParams.get('error') === AUTH_ERRORS.AUTH_REQUIRED) {
      toast.error(`Sign in is required for this page T_T`);
      onOpen();
      globalThis.history.replaceState(null, '', ROUTES.HOME);
    }
  }, [searchParams, onOpen]);

  useEffect(() => {
    if (searchParams.get('error') === AUTH_ERRORS.OAUTH_ACCOUNT_NOT_LINKED) {
      toast.error(`This email is already registered`);
      onOpen();
      globalThis.history.replaceState(null, '', ROUTES.HOME);
    }
  }, [searchParams, onOpen]);

  return null;
}
