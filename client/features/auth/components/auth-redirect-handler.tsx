'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthModalStore } from '../store/auth-modal.store';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AUTH_ERRORS, ROUTES } from '../../../shared/constants/constants';

export function AuthRedirectHandler() {
  const searchParams = useSearchParams();
  const { onOpen } = useAuthModalStore();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('error') === AUTH_ERRORS.AUTH_REQUIRED) {
      toast.error(`Signin is required for this page`);
      onOpen();
      router.replace(ROUTES.HOME);
    }
  }, [searchParams, onOpen, router]);

  useEffect(() => {
    if (searchParams.get('error') === AUTH_ERRORS.OAUTH_ACCOUNT_NOT_LINKED) {
      toast.error(`This email is already registered`);
      onOpen();
      router.replace(ROUTES.HOME);
    }
  }, [searchParams, onOpen, router]);

  useEffect(() => {
    if (searchParams.get('error') === AUTH_ERRORS.ADMIN_ONLY) {
      toast.error(`This page is only allowed for admin`);
      onOpen();
      router.replace(ROUTES.HOME);
    }
  }, [searchParams, onOpen, router]);

  return null;
}
