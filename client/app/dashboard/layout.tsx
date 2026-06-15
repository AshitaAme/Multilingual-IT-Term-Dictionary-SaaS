import { retrieveRole } from '@/features/auth';
import { AUTH_ERRORS } from '@/shared/constants/constants';
import { auth } from '@/shared/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) redirect(`/?error=${AUTH_ERRORS.AUTH_REQUIRED}`);
  const res = await retrieveRole(session.user.id);
  if (!res.success || res.data != 'admin')
    redirect(`/?error=${AUTH_ERRORS.ADMIN_ONLY}`);

  return <>{children}</>;
}
