'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  function toggleTheme() {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-border hover:bg-muted cursor-pointer relative group"
    >
      <div className="relative h-[1.2rem] w-[1.2rem] flex items-center justify-center">
        <Sun className="absolute scale-100 rotate-0 transition-all duration-500 group-hover:scale-110 dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute scale-0 rotate-90 transition-all duration-500 dark:scale-100 dark:group-hover:scale-110 dark:rotate-0" />
      </div>
    </Button>
  );
}
