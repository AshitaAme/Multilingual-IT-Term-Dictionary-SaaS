import { auth } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect('/?auth=required');
  return <>{children}</>;
}
