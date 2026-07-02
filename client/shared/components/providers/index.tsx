'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './theme-provider';
import { TooltipProvider } from '../ui/tooltip';
import { NextIntlClientProvider } from 'next-intl';
import type { Messages } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function AppProviders({
  children,
  messages,
  locale,
}: Readonly<{
  children: React.ReactNode;
  messages: Messages;
  locale: string;
}>) {
  const [client] = useState(() => new QueryClient());
  return (
    <NextIntlClientProvider
      timeZone="America/New_York"
      messages={messages}
      locale={locale}
    >
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <TooltipProvider>
            <QueryClientProvider client={client}>
              {children}
            </QueryClientProvider>
          </TooltipProvider>
        </ThemeProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
