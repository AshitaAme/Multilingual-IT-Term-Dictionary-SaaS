'use client';


import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { HomeIcon } from '@/components/icons/heroicons-home';
import { TooltipWrapper } from '@/components/ui/tooltipWrapper';
import { Book } from 'lucide-react';

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
                className="cursor-pointer rounded-md group/home"
                
              >
                <HomeIcon className="group-hover/home:scale-115 transition-all duration-500" />
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
                className="cursor-pointer rounded-md group/book"
              >
                <Book className="group-hover/book:scale-110 transition-all duration-500" />
              </Button>
            </TooltipWrapper>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
