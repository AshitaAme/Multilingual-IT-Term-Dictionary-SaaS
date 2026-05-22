'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShineBorder } from '@/components/ui/shine-border';
import { cn } from '@/lib/utils';
import { RegisterInput, registerSchema } from '@/validations/register-schema';
import { Eye, EyeOff, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { VerificationForm } from './verification-form';

interface AuthFormProps {
  onClose: () => void;
}

export function AuthForm({ onClose }: Readonly<AuthFormProps>) {
  const [goVerify, setGoVerify] = useState(false);
  const [mode, setMode] = useState<'Log in' | 'Sign up'>('Log in');
  const [showPassword, setShowPassword] = useState(false);

  // Use useForm to control form dynamically
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  // On form submit
  const onSubmit = async (data: RegisterInput) => {
    if (mode === 'Sign up') {
      // Transfer form-data to database
      const res = await fetch('api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Mount the error onto form, so that
        // the display of error can be dynamically dealt with
        const { error } = await res.json();
        setError('root.serverError', {
          type: 'server',
          message: error,
        });
        return;
      }
    }

    reset();

    if (mode === 'Log in') {
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirectTo: '/',
      });
    } else {
      // After form input, go to verification page to verify email
      setGoVerify(true);
    }
  };

  const credentialsForm = () => (
    <>
      <CardHeader className="relative items-center h-18 w-full px-0">
        {/* Close icon to close form */}
        <div className="absolute right-2.5 top-2.5">
          <X size={16} onClick={onClose} className="cursor-pointer" />
        </div>
        {/* Title */}
        <span className="h-18 text-[20px] font-semibold text-muted-foreground flex items-center pl-4 gap-1.5">
          {/* Sign in */}
          <Button
            variant="ghost"
            onClick={() => setMode('Log in')}
            className={cn(
              mode === 'Log in' && 'text-foreground',
              'cursor-pointer',
            )}
          >
            Log in ๐•ᴗ•๐
          </Button>
          <div>/</div>
          {/* Sign up */}
          <Button
            variant="ghost"
            onClick={() => setMode('Sign up')}
            className={cn(
              mode === 'Sign up' && 'text-foreground',
              'cursor-pointer',
            )}
          >
            Sign up つ♡⊂
          </Button>
        </span>
      </CardHeader>

      {/* Information Form */}
      <CardContent className="px-6 gap-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          onChange={() => {
            if (errors.root?.serverError) clearErrors('root.serverError');
          }}
          noValidate
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            {/* Name Field */}
            {mode === 'Sign up' && (
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name" className="sr-only">
                  Name
                </FieldLabel>
                <Input
                  {...register('name')}
                  id="name"
                  placeholder="Name"
                  className="rounded-sm h-10 text-sm focus:ring-1"
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>
            )}

            {/* Email Field */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email" className="sr-only">
                Email
              </FieldLabel>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="Email"
                className="rounded-sm h-10 text-sm focus:ring-1"
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            {/* Password Field */}
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password" className="sr-only">
                Password
              </FieldLabel>
              {/* Uses relative and absolute to control the position of 
                  little eye without affecting Input style */}
              <div className="relative">
                {/* Password Input */}
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="rounded-sm h-10 text-sm pr-10 focus:ring-1"
                />

                {/* Little eye used to show and hide password   */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-10 rounded-sm bg-muted-foreground hover:bg-foreground transition-all cursor-pointer"
          >
            {mode === 'Log in' ? 'Log in' : 'Sign up'}
          </Button>

          {/* Global API Error */}
          {errors.root?.serverError && (
            <div className="text-destructive text-sm text-center font-medium">
              {errors.root.serverError.message}
            </div>
          )}
        </form>

        {/* TODO: Implement "Forgot your password?" for login-form
                  <a
                    href="#"D
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
      </CardContent>

      {/* Other login ways such as google, github, X */}
      <div className="grid grid-cols-3 items-center justify-items-center px-8 py-2">
        <Separator className="max-w-26" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          or log in with
        </span>
        <Separator className="max-w-26" />
      </div>
      <div className="flex justify-center items-center gap-8 pb-8">
        <FaGithub
          onClick={() => signIn('github')}
          className="h-6 w-6 cursor-pointer"
        />
        <Separator orientation="vertical" className="h-6" />
        <FcGoogle
          onClick={() => signIn('google')}
          className="h-6 w-6 cursor-pointer"
        />
        <Separator orientation="vertical" className="h-6" />
        <FaXTwitter className="h-6 w-6 cursor-pointer" />
      </div>
    </>
  );

  return (
    <Card className="relative w-full max-w-sm rounded-md bg-background py-0">
      {/* ShineBorder uses currentColor to switch color mode on theme change */}
      <ShineBorder shineColor="currentColor" />
      {goVerify ? (
        <VerificationForm setGoVerify={setGoVerify} />
      ) : (
        credentialsForm()
      )}
    </Card>
  );
}
