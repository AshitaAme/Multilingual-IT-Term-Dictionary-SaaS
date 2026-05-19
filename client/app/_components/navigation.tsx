'use client';

import { cn } from '@lib/utils';

import UserNav from './user-nav';
import { Search } from './search';
import IconsNav from './icons-nav';
import { ThemeToggle } from './theme-toggle';

export default function Navigation() {
  return (
    // Navigation bar on the top of all pages with three sections:
    // [<-] left (icons with links),
    // [>|<] center (search),
    // [->] right (theme toggle and user nav)
    <div
      className={cn(
        'grid grid-cols-3 items-center',
        'h-14 w-full',
        'sticky top-0 z-50', // Make the navigation bar sticky at the top
        'bg-background/80 backdrop-blur', // Make bar slightly transparent and items behind blurred
      )}
    >
      {/* Left section: Icons with links */}
      <div className="flex pl-2 gap-2 justify-start">
        <IconsNav />
      </div>

      {/* Center section: Search */}
      <div className="flex justify-center w-full">
        <Search />
      </div>

      {/* Right section: Theme toggle and user nav */}
      <div className="flex pr-2 gap-2 justify-end">
        <ThemeToggle />
        <UserNav />
      </div>
    </div>
  );
}
