'use client';

import { tagIcons } from '@/shared/lib/icons/tag-icons';
import { CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ClickCard } from '@/shared/components/ui/click-card';

export default function TagCard({
  tagKey,
  tagName,
}: Readonly<{ tagKey: string; tagName: string }>) {
  return (
    <ClickCard className=" w-60 h-70 relative grid grid-rows-2 p-0">
      <div className="row-start-1 flex relative pt-[30%] justify-center">
        {tagIcons[tagKey]}
      </div>
      <CardHeader className="row-start-2 flex items-center justify-center">
        <CardTitle>{tagName}</CardTitle>
      </CardHeader>
    </ClickCard>
  );
}
