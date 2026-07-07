'use client';

import { AUTH_ERRORS } from '@/shared/constants/constants';
import { useSession } from 'next-auth/react';
import router from 'next/router';
import { useEffect, useState } from 'react';

export function SavedContainer() {
  const [savedBooks, setSavedBooks] = useState();
  const session = useSession();
  const userId = session.data?.user.id;
  useEffect(() => {
    const fetchBook = async () => {
      if (!userId) {
        router.replace(`/?error=${AUTH_ERRORS.AUTH_REQUIRED}`);
      }
    };
  }, []);
  return <></>;
}
