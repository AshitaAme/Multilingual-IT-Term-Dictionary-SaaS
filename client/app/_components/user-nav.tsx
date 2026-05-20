'use client';

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
  LogIn,
  LogOut,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { LoginForm } from './login-form';
import { createPortal } from 'react-dom';

// User navigation component
export default function UserNav() {
  const { data: session } = useSession();
  const [show, setShow] = useState(false);

  if (!session) {
    // If show is false, the place will be a button to trigger the login-form
    if (!show) {
      return (
        <Button
          onClick={() => {
            setShow(true);
          }}
          size="icon"
          className="cursor-pointer group/login"
        >
          <LogIn className="group-hover/login:translate-x-0.5 transition-all duration-300" />
        </Button>
      );
    }

    // Show login form with full-page overlay via portal
    // Portal to body to make sure overlay over not only navigation but full-page
    return createPortal(
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
        <LoginForm onClose={() => setShow(false)} />
      </div>,
      document.body,
    );
  }

  // When there is session, show avatar which on click triggers a dropdown menu
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
            <AvatarImage
              src={session.user.image ?? ''}
              alt={session.user.name ?? ''}
            />
            <AvatarFallback>{session.user.name?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* dropdown menu */}
      <DropdownMenuContent className="w-48" align="end">
        {/* Switch account */}
        <DropdownMenuGroup className="p-2  pb-2 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2 text-sm font-semibold">
            <Avatar className="ring-1 ring-border after:hidden h-8 w-8">
              <AvatarImage
                src={session.user.image ?? ''}
                alt={session.user.name ?? ''}
              />
              <AvatarFallback>{session.user.name?.[0] ?? '?'}</AvatarFallback>
            </Avatar>
            {session.user.name ?? 'User'}
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
          <DropdownMenuItem
            onClick={() => signOut()}
            className="cursor-pointer hover:bg-muted"
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
