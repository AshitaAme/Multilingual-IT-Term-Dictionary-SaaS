'use client';

import { Button } from '@/shared/components/ui/button';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const t = useTranslations('nav');
  const { resolvedTheme, setTheme } = useTheme();
  function toggleTheme() {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }

  return (
    <TooltipWrapper label={t('theme')} side="bottom">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="relative group border-0! bg-muted-foreground/10! hover:bg-muted-foreground/20!"
      >
        <div className="relative flex items-center justify-center">
          <Sun className="absolute scale-100 rotate-0 transition-all duration-300  dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0" />
        </div>
      </Button>
    </TooltipWrapper>
  );
}
