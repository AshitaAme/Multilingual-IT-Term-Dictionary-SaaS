'use client';

import { DropZone } from '@/shared/components/ui/drop-zone';
import { cn } from '@/shared/utils/utils';
import { FileUp } from 'lucide-react';

export function ImportTerm() {
  return (
    <DropZone
      className={cn(
        'w-50 h-50 border-2 border-dashed border-foreground rounded-lg',
        'flex flex-col items-center justify-center p-0 cursor-pointer ',
        'bg-muted/40 hover:bg-muted gap-0',
      )}
    >
      <FileUp size={50} className="mb-4" />
      <span className="p-0 mb-1 font-semibold">
        Choose a file or drag it here
      </span>
      <span className="text-xs">allowed extension: .csv, .tbx</span>
    </DropZone>
  );
}
