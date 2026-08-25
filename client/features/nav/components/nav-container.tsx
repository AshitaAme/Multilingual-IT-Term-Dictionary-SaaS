'use client';

import { cn } from '@/shared/utils/utils';

import UserMenu from './user-menu';
import IconLinks from './icon-links';
import { ThemeToggle } from './theme-toggle';
import { LocaleMenu } from './locale-menu';
import { ReactNode } from 'react';

export function NavContainer({
  searchBox,
}: Readonly<{ searchBox: ReactNode }>) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 items-center',
        'h-14 w-full',
        'sticky top-0 z-50', // Make the navigation bar sticky at the top
        'bg-background/80 backdrop-blur', // Make bar slightly transparent and items behind blurred
      )}
    >
      {/* Icon links */}
      <div className="flex pl-2 gap-2 justify-start">
        <IconLinks />
      </div>

      {/* Search */}
      <div className="flex justify-center w-full">{searchBox}</div>

      {/* Locale, theme, and user */}
      <div className="flex pr-2 gap-2 justify-end">
        <LocaleMenu />
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
