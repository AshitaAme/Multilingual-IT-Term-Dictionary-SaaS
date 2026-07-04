import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/shared/components/providers';
import { Toaster } from '@/shared/components/ui/sonner';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { AuthContainer } from '@/features/auth';
import { NavigationContainer } from '@/features/navigation';
import { SearchBox } from '@/features/search';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="min-h-screen flex flex-col"
    >
      <body className="bg-background relative">
        <AppProviders messages={messages} locale={locale}>
          <NavigationContainer searchBox={<SearchBox />} />
          <AuthContainer />
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
