import React from 'react';
import { Card } from './card';
import { cn } from '@/shared/utils/utils';

export function ClickCard({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <Card
      className={cn(
        'ring-0 rounded-b-xl cursor-pointer',
        'bg-background shadow-md hover:shadow-xl ',
        'dark:border dark:border-white/15 dark:hover:border-foreground transition-all duration-100',
        className,
      )}
    >
      {children}
    </Card>
  );
}
