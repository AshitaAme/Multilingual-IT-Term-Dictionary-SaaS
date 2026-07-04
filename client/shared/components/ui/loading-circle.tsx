import { cn } from '@/shared/utils/utils';
import { Loader2Icon } from 'lucide-react';

export function LoadingCircle({
  size,
  className,
}: Readonly<{ size?: number; className?: string }>) {
  return (
    <Loader2Icon
      size={size || 8}
      className={cn('animate-spin text-muted-foreground', className)}
    />
  );
}
