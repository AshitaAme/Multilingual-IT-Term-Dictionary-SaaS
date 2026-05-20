'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';

interface LoginFormProps {
  onClose: () => void;
}

export function LoginForm({ onClose }: Readonly<LoginFormProps>) {
  const [mode, setMode] = useState<'Log in' | 'Sign up'>('Log in');

  return (
    <Card className="w-full max-w-sm rounded-md bg-background py-0">
      {/* Title and close icon  */}
      <CardHeader className="grid grid-cols-2 items-center h-18 w-full px-0">
        <span className="h-18 text-[20px] font-semibold text-muted-foreground flex items-center pl-4 gap-1.5">
          <Button
            variant="ghost"
            onClick={() => setMode('Log in')}
            className={cn(
              mode === 'Log in' && 'text-foreground',
              'cursor-pointer',
            )}
          >
            Log in
          </Button>
          <div>/</div>
          <Button
            variant="ghost"
            onClick={() => setMode('Sign up')}
            className={cn(
              mode === 'Sign up' && 'text-foreground',
              'cursor-pointer',
            )}
          >
            Sign up
          </Button>
        </span>
        <div className="flex justify-end h-18 w-full pt-2.5 pr-2.5">
          <X size={16} onClick={onClose} className="cursor-pointer" />
        </div>
      </CardHeader>

      {/* Information input */}
      <CardContent className="px-6 gap-4">
        <form className="flex flex-col gap-4">
          {mode === 'Sign up' && (
            <Input
              className="rounded-none flex items-center h-10 text-sm"
              id="name"
              type="name"
              placeholder="Name"
              required
            />
          )}
          <Input
            className="rounded-none flex items-center h-10 text-sm"
            id="email"
            type="email"
            placeholder="Email"
            required
          />
          <Input
            className="rounded-none flex items-center h-10 text-sm"
            id="password"
            type="password"
            placeholder="Password"
            required
          />
          {mode === 'Sign up' && (
            <Input
              className="rounded-none flex items-center h-10 text-sm"
              id="retype password"
              type="retype password"
              placeholder="Retype Password"
              required
            />
          )}
          <Button className="cursor-pointer h-10 rounded-none">
            {mode === 'Log in' ? 'Log in' : 'Sign up'}
          </Button>
        </form>
        {/* TODO: Implement "Forgot your password?" for login-form
                  <a
                    href="#"D
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
      </CardContent>

      <div className="grid grid-cols-3 items-center justify-items-center px-8 py-2">
        <Separator className="max-w-26" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          or log in with
        </span>
        <Separator className="max-w-26" />
      </div>
      {/* Login, Signup, and other login ways such as google */}

      <div className="flex justify-center items-center gap-8 pb-8">
        <FaGithub className="h-6 w-6 cursor-pointer" />

        <Separator orientation="vertical" className="h-6" />
        <FcGoogle className="h-6 w-6 cursor-pointer" />
        <Separator orientation="vertical" className="h-6" />
        <FaXTwitter className="h-6 w-6 cursor-pointer" />
      </div>
    </Card>
  );
}
