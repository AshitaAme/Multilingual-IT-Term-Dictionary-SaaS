import { cn } from '@lib/utils';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@components/ui/navigation-menu';
import ThemeToggle from './theme-toggle';

export default function Navigation() {
  return (
    <div
      className={cn(
        'flex flex-row justify-between items-center',
        'h-12 w-full',
      )}
    >
      <div className={cn(
        'flex flex-row gap-6 h-full', 
        'text-4xl'
      )}>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/">Home</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {/* TODO: Add user avatar and dropdown menu here */}
      {/* <Avatar className={cn("flex flex-row items-center")}>
      <ThemeToggle></ThemeToggle>
      </Avatar> */}
    </div>
  );
}
