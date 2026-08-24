import { cn } from '@/shared/utils/utils';
import { Loader2Icon } from 'lucide-react';

export function LoadingCircle({
  size,
  className,
}: Readonly<{ size?: number; className?: string }>) {
  return (
    <Loader2Icon
      size={size || 25}
      className={cn('animate-spin text-muted-foreground', className)}
    />
  );
}
