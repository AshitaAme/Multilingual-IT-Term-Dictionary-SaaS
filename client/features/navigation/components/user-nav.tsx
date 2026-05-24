'use client';

import { CreditCardIcon, LogIn, LogOut, SettingsIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { cn } from '@/shared/utils/utils';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { useRouter } from 'next/navigation';

// User navigation component
export default function UserNav() {
  const { data: session } = useSession();
  const { onOpen } = useAuthModalStore();
  const router = useRouter();

  if (!session) {
    // As signed in, display a button to trigger the credentials form
    return (
      <Button
        onClick={onOpen}
        size="icon"
        className="cursor-pointer group/login"
      >
        <LogIn className="group-hover/login:translate-x-0.5 transition-all duration-300" />
      </Button>
    );
  }

  // When there is session, show avatar which on click triggers a dropdown menu
  return (
    <DropdownMenu>
      {/* User-avatar as a trigger for dropdown-menu */}
      <TooltipWrapper label="Home" side="bottom" rightBorder={true}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'cursor-pointer rounded-full border-0! bg-transparent! focus-visible:ring-0 focus-visible:ring-border',
              !session.user.image && 'ring-1! ring-border',
            )}
          >
            <Avatar className={cn('after:hidden h-7 w-7 cursor-pointer')}>
              <AvatarImage
                src={session.user.image ?? ''}
                alt={session.user.name ?? ''}
              />
              <AvatarFallback>{session.user.name?.[0] ?? '?'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
      </TooltipWrapper>

      {/* dropdown menu */}
      <DropdownMenuContent
        className="w-54 p-0 rounded-lg"
        align="end"
        sideOffset={6}
      >
        {/* Switch account */}
        <DropdownMenuGroup className="p-4 pb-0">
          <div className="h-25 w-full bg-muted rounded-lg flex flex-col items-center pt-2">
            <Avatar className="ring-1 ring-border after:hidden h-10 w-10">
              <AvatarImage
                src={session.user.image ?? ''}
                alt={session.user.name ?? ''}
              />
              <AvatarFallback className="text-sm font-semibold">
                {session.user.name?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-24 text-[14px] mt-1">
              {session.user.name ?? 'User'}
            </span>
            <span className="truncate max-w-34 text-[10px]">
              {session.user.email ?? 'User'}
            </span>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuGroup className="p-2">
          <DropdownMenuSeparator className="mx-2 my-2" />
          {/* Profile */}
          <DropdownMenuItem
            onClick={() => router.push('/profile')}
            className="cursor-pointer hover:bg-muted! px-2 py-1.5"
          >
            <CreditCardIcon />
            Profile
          </DropdownMenuItem>
          {/* Settings */}
          <DropdownMenuItem className="cursor-pointer hover:bg-muted! px-2 py-1.5">
            <SettingsIcon />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-2 my-2" />
          {/* Sign out */}

          <DropdownMenuItem
            onClick={() => signOut()}
            className="cursor-pointer hover:bg-muted! px-2 py-1.5"
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
