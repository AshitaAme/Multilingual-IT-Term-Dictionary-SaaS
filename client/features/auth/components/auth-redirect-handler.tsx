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
    if (searchParams.get('auth') === 'existent_OAUTH') {
      const provider = searchParams.get('provider');
      toast.error(`This email is already registered with ${provider}.`);
      onOpen();
      globalThis.history.replaceState(null, '', '/');
    }
  }, [searchParams, onOpen]);

  return null;
}
