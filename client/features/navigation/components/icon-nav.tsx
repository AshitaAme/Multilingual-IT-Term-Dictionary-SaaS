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
import { useTranslations } from 'next-intl';

export default function IconNav() {
  const t = useTranslations('nav');
  return (
    // Navigation menu with icon-links for different pages
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        {/* Home */}
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <TooltipWrapper label={t('home')} side="bottom" leftBorder={true}>
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer rounded-md hover:[&_svg]:scale-115"
              >
                <HomeIcon className="transition-all duration-300" />
              </Button>
            </TooltipWrapper>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Saved Words*/}
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <TooltipWrapper label={t('savedWords')} side="bottom">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer rounded-md hover:[&_svg]:scale-110 "
              >
                <Book className="transition-all duration-300" />
              </Button>
            </TooltipWrapper>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
