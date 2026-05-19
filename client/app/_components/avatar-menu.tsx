import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeftRight,
  CreditCardIcon,
  LogOut,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';

// User navigation component
export default function UserNav() {
  const UserName = 'John';
  return (
    <DropdownMenu>
      {/* User-avatar as a trigger for dropdown-menu */}
      <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
          >
          <Avatar className="ring-1 ring-border after:hidden h-8 w-8 cursor-pointer">
            <AvatarImage src="" alt="shadcn" />
            <AvatarFallback>EN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu */}
      <DropdownMenuContent className="w-48" align="end">
        {/* Switch account */}
        <DropdownMenuGroup className="p-2  pb-2 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2 text-sm font-semibold">
            <Avatar className="ring-1 ring-border after:hidden h-8 w-8">
              <AvatarImage src="" alt="shadcn" />
              <AvatarFallback>EN</AvatarFallback>
            </Avatar>
            {UserName}
          </div>
          <ArrowLeftRight className="text-muted-foreground h-4 w-4 cursor-pointer" />
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-2" />
        <DropdownMenuGroup className="p-2 pt-1 pb-1 flex flex-col gap-1">
          {/* User profile */}
          <DropdownMenuItem className="cursor-pointer hover:bg-muted">
            <UserIcon />
            Profile
          </DropdownMenuItem>
          {/* Billing */}
          <DropdownMenuItem className="cursor-pointer hover:bg-muted">
            <CreditCardIcon />
            Billing
          </DropdownMenuItem>
          {/* Settings */}
          <DropdownMenuItem className="cursor-pointer hover:bg-muted">
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* Sign out */}
        <DropdownMenuSeparator className="mx-2" />
        <DropdownMenuGroup className="p-2 pt-1 items-center">
          <DropdownMenuItem className="cursor-pointer hover:bg-muted">
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
