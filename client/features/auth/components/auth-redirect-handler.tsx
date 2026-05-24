'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthModalStore } from '../store/auth-modal.store';
import { useEffect } from 'react';

export function AuthRedirectHandler() {
  const searchParams = useSearchParams();
  const { onOpen } = useAuthModalStore();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('auth') === 'required') {
      onOpen();
      globalThis.history.replaceState(null, '', '/');
    }
  }, [searchParams, onOpen, router]);

  return null;
}
