'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthModalStore } from '../stores/auth.store';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AUTH_ERRORS, ROUTES } from '../../../shared/constants/constants';

export function AuthRedirectHandler() {
  const searchParams = useSearchParams();
  const { onOpen } = useAuthModalStore();
  const router = useRouter();

  useEffect(() => {
    const errorType = searchParams.get('error');
    if (!errorType) return;

    let errorMessage = '';

    switch (errorType) {
      case AUTH_ERRORS.AUTH_REQUIRED:
        errorMessage = 'Signin is required for this page';
        break;
      case AUTH_ERRORS.AUTH_FAILURE:
        errorMessage = 'Auth information retrieval failed';
        break;
      case AUTH_ERRORS.OAUTH_ACCOUNT_NOT_LINKED:
        errorMessage = 'This email is already registered';
        break;
      case AUTH_ERRORS.ADMIN_ONLY:
        errorMessage = 'This page is only allowed for admin';
        break;
      default:
        return;
    }

    toast.error(errorMessage);
    onOpen();
    router.replace(ROUTES.HOME);
  }, [searchParams, onOpen, router]);

  return null;
}
