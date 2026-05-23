'use client';

import { cn } from '@/shared/utils/utils';
import { tagIcons } from '@/shared/lib/tag-icons';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function TagCard({ tagName }: Readonly<{ tagName: string }>) {
  // TODO: const wordCount = getWordCountByName(tagName);

  return (
    <Card
      className={cn(
        'grid grid-rows-2',
        'relative cursor-pointer w-60 h-70 ring-0 rounded-b-xl bg-background shadow-sm hover:shadow-md dark:border dark:border-white/15 transition-all duration-300 p-0',
      )}
    >
      {/* <ShineBorder shineColor="currentColor" /> */}
      <div className="row-start-1 flex relative pt-[30%] justify-center">
        {tagIcons[tagName]}
      </div>
      <CardHeader className="row-start-2 flex items-center justify-center">
        <CardTitle>{tagName}</CardTitle>
      </CardHeader>
    </Card>
  );
}
