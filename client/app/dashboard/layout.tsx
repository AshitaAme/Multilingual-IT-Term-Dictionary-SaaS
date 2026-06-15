import { checkAdminAction } from '@/features/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const res = await checkAdminAction();
  if (!res.success) redirect(`/?error=${res.error}`);

  return <>{children}</>;
}
