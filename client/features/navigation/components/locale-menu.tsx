'use client';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { cn } from '@/shared/utils/utils';
import { LanguagesIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LocaleMenu() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('nav');
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      router.refresh();
    });
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];
  return (
    <DropdownMenu>
      <TooltipWrapper label={t('languages')} side="bottom" preventFocus={true}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant={'outline'}
            className="hover:bg-muted  group/locale relative focus-visible:ring-0"
            disabled={isPending}
          >
            <LanguagesIcon className="group-hover/locale:scale-110 transition-all duration-300" />
          </Button>
        </DropdownMenuTrigger>
      </TooltipWrapper>

      <DropdownMenuContent align="center" sideOffset={8} className="p-2">
        <DropdownMenuGroup className="flex flex-col gap-2">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={cn(
                locale === lang.code ? 'bg-accent font-medium' : '',
                '',
              )}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
              {locale === lang.code && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
