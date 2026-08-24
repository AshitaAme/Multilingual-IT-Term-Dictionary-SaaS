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
        'ring-0 rounded-b-xl',
        'bg-background shadow-md hover:shadow-xl duration-100',
        'dark:bg-muted-foreground/10! dark:hover:bg-muted-foreground/20!',
        'bg-muted-foreground/2 hover:bg-muted-foreground/8',
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
