'use client';

import { Button } from '@/shared/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/shared/components/ui/navigation-menu';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { Book, HomeIcon } from 'lucide-react';

export default function IconsNav() {
  return (
    // Navigation menu with icon-links for different pages
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        {/* Home link */}
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <TooltipWrapper label="Home" side="bottom" leftBorder={true}>
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer rounded-md hover:[&_svg]:scale-115"
              >
                <HomeIcon className="transition-all duration-200" />
              </Button>
            </TooltipWrapper>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* My-words link */}
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <TooltipWrapper label="My words" side="bottom">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer rounded-md hover:[&_svg]:scale-115 "
              >
                <Book className="transition-all duration-200" />
              </Button>
            </TooltipWrapper>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
