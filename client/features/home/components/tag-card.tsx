'use client';

import { tagIcons } from '@/shared/lib/icons/tag-icons';
import { CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ClickCard } from '@/shared/components/ui/click-card';
import { useRouter } from 'next/navigation';

export default function TagCard({
  tagKey,
  tagName,
}: Readonly<{ tagKey: string; tagName: string }>) {
  const router = useRouter();

  const handleTagQuery = () => {
    router.push(`/search?tag=${tagName}`);
  };

  return (
    <ClickCard
      className="w-60 h-70 relative grid grid-rows-2 p-0"
      onClick={handleTagQuery}
    >
      <div className="row-start-1 pt-20 flex justify-center">
        {tagIcons[tagKey]}
      </div>
      <CardHeader className="row-start-2 flex items-center justify-center">
        <CardTitle>{tagName}</CardTitle>
      </CardHeader>
    </ClickCard>
  );
}
