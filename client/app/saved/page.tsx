import { SavedContainer } from '@/features/saved';
import { AUTH_ERRORS } from '@/shared/constants/constants';
import { auth } from '@/shared/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function Saved() {
  const session = await auth();
  if (!session) redirect(`/?error=${AUTH_ERRORS.AUTH_REQUIRED}`);
  return <SavedContainer />;
}
