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
import { useRouter } from 'next/navigation';
import { TooltipWrapper } from '@/shared/components/ui/tooltipWrapper';
import { useTranslations } from 'next-intl';

// User navigation component
export default function UserMenu() {
  const { data: session } = useSession();
  const { onOpen } = useAuthModalStore();
  const router = useRouter();
  const t = useTranslations('nav');

  if (!session) {
    // As signed in, display a button to trigger the credentials form
    return (
      <TooltipWrapper label={t('signInUp')} side="bottom" rightBorder={true}>
        <Button
          onClick={onOpen}
          size="icon"
          className="cursor-pointer group/login"
        >
          <LogIn className="group-hover/login:translate-x-0.5 transition-all duration-300" />
        </Button>
      </TooltipWrapper>
    );
  }

  // When there is session, show avatar used to trigger dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'cursor-pointer rounded-full border-0! bg-transparent! focus-visible:ring-0 focus-visible:ring-border',
            !session.user.image && 'ring-1! ring-border',
          )}
        >
          <Avatar className="after:hidden h-8 w-8 cursor-pointer ring-1 ring-border">
            <AvatarImage
              src={session.user.image ?? ''}
              alt={session.user.name ?? ''}
            />
            <AvatarFallback>{session.user.name?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu */}
      <DropdownMenuContent
        className="w-60 p-0 rounded-lg"
        align="end"
        sideOffset={8}
      >
        {/* User Avatar and Info */}
        <DropdownMenuGroup className="p-4 pb-0">
          <div className="h-34 w-full bg-muted rounded-lg flex flex-col items-center pt-3">
            <Avatar className="ring-2 ring-border after:hidden h-14 w-14">
              <AvatarImage
                src={session.user.image ?? ''}
                alt={session.user.name ?? ''}
              />
              <AvatarFallback className="text-sm font-semibold">
                N
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-30 text-[14px] mt-2 font-semibold">
              {session.user.name ?? 'User'}
            </span>
            <span className="truncate max-w-40 text-[12px]">
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
            {t('profile')}
          </DropdownMenuItem>
          {/* Settings */}
          <DropdownMenuItem className="cursor-pointer hover:bg-muted! px-2 py-1.5">
            <SettingsIcon />
            {t('settings')}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-2 my-2" />
          {/* Sign out */}

          <DropdownMenuItem
            onClick={() => signOut()}
            className="cursor-pointer hover:bg-muted! px-2 py-1.5"
          >
            <LogOut />
            {t('signOut')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
