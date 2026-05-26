'use client';

import { useSearchParams } from 'next/navigation';
import { useAuthModalStore } from '../store/auth-modal.store';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function AuthRedirectHandler() {
  const searchParams = useSearchParams();
  const { onOpen } = useAuthModalStore();

  useEffect(() => {
    if (searchParams.get('auth') === 'required') {
      onOpen();
      globalThis.history.replaceState(null, '', '/');
    }
  }, [searchParams, onOpen]);

  useEffect(() => {
    if (searchParams.get('error') === 'OAuthAccountNotLinked') {
      toast.error(`This email is already registered`);
      onOpen();
      globalThis.history.replaceState(null, '', '/');
    }
  }, [searchParams, onOpen]);

  return null;
}
