import { cn } from '@lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@components/ui/navigation-menu';
import { HomeIcon } from 'lucide-react';

import UserNav from './user-nav';
import { ModeToggle } from './mode-toggle';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  return (
    <div
      className={cn(
        'flex flex-row justify-between items-center',
        'h-16 w-full',
        'sticky top-0 z-50',
      )}
    >
      <div className="flex flex-row h-full pt-4 pb-4 pl-2 pr-2 md:pl-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className="">
              <Button variant="outline" size="icon">
                <HomeIcon className="size-4 hover:scale-110 transition-all duration-500" />
              </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex flex-row h-full pt-4 pb-4 pl-2 pr-3 md:pr-4 gap-2">
        <ModeToggle />
        <UserNav />
      </div>
    </div>
  );
}
