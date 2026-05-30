'use client';

import { useTranslations } from 'next-intl';
import TagCard from './tag-card';
import { cn } from '@/shared/utils/utils';

const tagKeys = [
  'all',
  'computerArchitecture',
  'frontend',
  'backend',
  'ai',
  'data',
  'cloudService',
  'git',
  'nextjs',
] as const;

export function TagCardDisplay() {
  const t = useTranslations('tag');

  return (
    <div
      className={cn(
        'grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10',
        'pt-[6.5%] lg:pt-[5.5%] pb-[15%] md:pl-[20%] md:pr-[20%]',
      )}
    >
      {tagKeys.map((tagKey) => {
        const tagName = t(tagKey);
        return (
          <div key={tagKey} className="flex items-center justify-center">
            <TagCard tagKey={tagKey} tagName={tagName} />
          </div>
        );
      })}
    </div>
  );
}
