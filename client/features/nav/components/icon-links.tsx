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

export default function IconLinks() {
  const t = useTranslations('nav');
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        {/* Home */}
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <TooltipWrapper label={t('home')} side="bottom" leftBorder={true}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-md border-0! bg-muted-foreground/10! hover:bg-muted-foreground/20!"
              >
                <HomeIcon />
              </Button>
            </TooltipWrapper>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Saved */}
        <NavigationMenuItem>
          <NavigationMenuLink href="/saved">
            <TooltipWrapper label={t('savedWords')} side="bottom">
              <Button
                variant="outline"
                size="icon"
                className="rounded-md border-0! bg-muted-foreground/10! hover:bg-muted-foreground/20!"
              >
                <Book />
              </Button>
            </TooltipWrapper>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
