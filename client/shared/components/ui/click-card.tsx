import React from 'react';
import { Card } from './card';
import { cn } from '@/shared/utils/utils';

export type ClickCardProps = React.HTMLAttributes<HTMLDivElement>;

export function ClickCard({
  children,
  className,
  ...props
}: Readonly<ClickCardProps>) {
  return (
    <Card
      className={cn(
        'ring-0 rounded-b-xl cursor-pointer',
        'bg-background shadow-md hover:shadow-xl ',
        'dark:border dark:border-white/15 dark:hover:border-foreground transition-all duration-100',
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
