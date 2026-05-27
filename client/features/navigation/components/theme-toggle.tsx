'use client';

import { Button } from '@/shared/components/ui/button';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  function toggleTheme() {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }

  return (
    <TooltipWrapper label="Theme" side="bottom">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="hover:bg-muted cursor-pointer relative group"
      >
        <div className="relative flex items-center justify-center">
          <Sun className="absolute scale-100 group-hover:scale-110 rotate-0 transition-all duration-300  dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:group-hover:scale-110 dark:rotate-0" />
        </div>
      </Button>
    </TooltipWrapper>
  );
}
