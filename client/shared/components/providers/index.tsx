'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './theme-provider';
import { TooltipProvider } from '../ui/tooltip';
import { NextIntlClientProvider } from 'next-intl';
import type { Messages } from 'next-intl';

export default function AppProviders({
  children,
  messages,
  locale,
}: Readonly<{
  children: React.ReactNode;
  messages: Messages;
  locale: string;
}>) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
