'use client';

import { cn } from '@/shared/utils/utils';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Fragment, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CredentialsInput, CredentialsSchema } from '../schemas/credentials';
import { CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { signupAction } from '../actions/signup.action';
import { useRouter } from 'next/navigation';
import { CredentialsFormProps } from '../types/credentials-form-props';
import { useAuthModalStore } from '../store/auth-modal.store';

export function CredentialsForm({
  setStep,
  setCredentials,
}: Readonly<CredentialsFormProps>) {
  const [mode, setMode] = useState<'Sign in' | 'Sign up'>('Sign in');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { onClose } = useAuthModalStore();

  // Use useForm to control form
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<CredentialsInput>({
    resolver: zodResolver(CredentialsSchema),
    mode: 'onSubmit',
  });

  // On form submit
  const onSubmit = async (data: CredentialsInput) => {
    if (mode === 'Sign in') {
      console.log('SIGNIN');
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log('resError', res);
      if (res?.error) {
        // Mount server error to form
        setError('root.serverError', {
          type: 'server',
          message: 'Invalid email or password',
        });
        return;
      }

      onClose();
      router.push('/');
    } else {
      console.log('SIGNUP');
      const res = await signupAction(data);

      if (!res.success) {
        // Mount server error to form

        setError('root.serverError', {
          type: 'server',
          message: res.error ?? 'Something went wrong',
        });
        return;
      }
      setCredentials({ email: data.email, password: data.password });
      setStep('verification');
    }
  };

  const SOCIAL_PROVIDERS = [
    { id: 'github', Icon: FaGithub, label: 'Sign in with GitHub' },
    { id: 'google', Icon: FcGoogle, label: 'Sign in with Google' },
    { id: 'twitter', Icon: FaXTwitter, label: 'Sign in with X (Twitter)' },
  ] as const;

  return (
    <>
      {/* Title */}
      <CardHeader className="relative items-center h-18 w-full px-0">
        <span className="h-18 text-[20px] font-semibold text-muted-foreground flex items-center pl-4 gap-1.5">
          {/* Sign in */}
          <Button
            variant="ghost"
            onClick={() => {
              setMode('Sign in');
              reset();
            }}
            className={cn(
              mode === 'Sign in' && 'text-foreground',
              'cursor-pointer',
            )}
          >
            Sign in ๐•ᴗ•๐
          </Button>
          <div>/</div>
          {/* Sign up */}
          <Button
            variant="ghost"
            onClick={() => {
              setMode('Sign up');
              reset();
            }}
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
          className="flex flex-col"
        >
          <FieldGroup key={mode}>
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
                autoComplete={mode === 'Sign in' ? 'email' : 'off'}
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
                  autoComplete={
                    mode === 'Sign in' ? 'current-password' : 'new-password'
                  }
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
            className="h-10 mt-4 rounded-sm bg-muted-foreground hover:bg-foreground transition-all cursor-pointer"
          >
            {mode === 'Sign in' ? 'Sign in' : 'Sign up'}
          </Button>

          {/* Global API Error */}
          {errors.root?.serverError && (
            <div className="py-1 mt-4 text-center ring-1 rounded-4xl text-destructive text-sm font-medium">
              {errors.root.serverError.message}
            </div>
          )}
        </form>
        {mode === 'Sign in' && (
          <span className="text-foreground pt-4 flex justify-center items-center text-xs ">
            <div className="text-blue-200! underline underline-offset-4 cursor-pointer pr-1">
              Click here
            </div>
            if you forgot your password
          </span>
        )}
      </CardContent>

      {/* Other login ways such as google, github, X */}
      <div className="grid grid-cols-3 items-center justify-items-center px-8 py-2">
        <Separator className="max-w-26" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          or
        </span>
        <Separator className="max-w-26" />
      </div>
      <div className="flex justify-center items-center gap-8 pb-8">
        {SOCIAL_PROVIDERS.map(({ id, Icon, label }, index) => (
          <Fragment key={id}>
            {index > 0 && <Separator orientation="vertical" className="h-6" />}
            <button
              onClick={() => signIn(id)}
              aria-label={label}
              className="cursor-pointer"
            >
              <Icon className="h-6 w-6" />
            </button>
          </Fragment>
        ))}
      </div>
    </>
  );
}
