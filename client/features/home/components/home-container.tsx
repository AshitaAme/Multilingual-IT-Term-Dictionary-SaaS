'use client';

import { useTranslations } from 'next-intl';
import TagCard from './tag-card';
import { cn } from '@/shared/utils/utils';
import { TypingAnimation } from '@/shared/components/ui/typing-animation';

export const tagKeys = [
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

export function HomeContainer() {
  const t = useTranslations('tag');

  return (
    <div
      className={cn(
        'w-full h-full py-6 md:px-40 xl:px-100',
        'flex flex-col justify-center items-center',
      )}
    >
      <div className="flex items-center justify-center text-4xl font-bold">
        <TypingAnimation>{t('leafDictionary')}</TypingAnimation>
      </div>

      <div
        className={cn('py-14', 'flex flex-wrap justify-center gap-8 lg:gap-12')}
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
    </div>
  );
}
