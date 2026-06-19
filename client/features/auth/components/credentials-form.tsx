'use client';

import { cn } from '@/shared/utils/utils';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Fragment, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaLine } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

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
import { initiateSignupAction } from '../actions/initiate-signup.action';
import { useRouter } from 'next/navigation';
import { CredentialsFormProps } from '../types/credentials-form-props';
import { useAuthModalStore } from '../stores/auth.store';
import { initiateResetPasswordAction } from '../actions/initiate-reset-password.action';

export function CredentialsForm({
  setStep,
  setCredentials,
}: Readonly<CredentialsFormProps>) {
  const t = useTranslations('auth');

  const [mode, setMode] = useState<'Sign in' | 'Sign up' | 'Forgot password'>(
    'Sign in',
  );
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
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        // Mount server error to form
        setError('root.serverError', {
          type: 'server',
          message: t('invalidCredentials'),
        });
        return;
      }

      onClose();
      router.push('/');
    } else {
      const res =
        mode === 'Sign up'
          ? await initiateSignupAction(data)
          : await initiateResetPasswordAction(data);

      if (!res.success) {
        // Mount server error to form
        setError('root.serverError', {
          type: 'server',
          message: res.error ?? t('somethingWentWrong'),
        });
        return;
      }
      setCredentials({
        email: data.email,
        password: data.password,
        resetPassword: mode === 'Forgot password',
      });
      setStep('verification');
    }
  };

  const SOCIAL_PROVIDERS = [
    { id: 'github', Icon: FaGithub, label: t('signInWithGitHub') },
    { id: 'google', Icon: FcGoogle, label: t('signInWithGoogle') },
    { id: 'line', Icon: FaLine, label: t('signInWithLine') },
  ] as const;

  const renderTitleOnMode = () => {
    if (mode == 'Forgot password') {
      return (
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setMode('Sign in');
              reset();
            }}
            className={cn('cursor-pointer')}
          >
            {t('back')}
          </Button>
          <div>/</div>
          {/* Sign up */}
          <Button
            variant="ghost"
            className={cn(
              'text-foreground cursor-pointer',
              mode === 'Forgot password' && 'text-foreground',
            )}
          >
            {t('forgotPassword')}
          </Button>
        </>
      );
    } else {
      return (
        <>
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
            {t('signIn')}
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
            {t('signUp')}
          </Button>
        </>
      );
    }
  };

  const getButtonText = () => {
    if (mode === 'Forgot password') return t('resetPassword');
    if (mode === 'Sign in') return t('signIn');
    return t('signUp');
  };

  return (
    <>
      {/* Title */}
      <CardHeader className="relative items-center h-18 w-full px-0">
        <span className="h-18 text-[20px] font-semibold text-muted-foreground flex items-center pl-4 gap-1.5">
          {renderTitleOnMode()}
        </span>
      </CardHeader>

      {/* Form */}
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
                  {t('name')}
                </FieldLabel>
                <Input
                  {...register('name')}
                  id="name"
                  placeholder={t('name')}
                  className="rounded-sm h-10 text-sm focus:ring-1"
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>
            )}

            {/* Email Field */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email" className="sr-only">
                {t('email')}
              </FieldLabel>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder={t('email')}
                autoComplete={mode === 'Sign in' ? 'email' : 'off'}
                className="rounded-sm h-10 text-sm focus:ring-1"
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            {/* Password Field */}
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password" className="sr-only">
                {t('password')}
              </FieldLabel>
              {/* Uses relative and absolute to control the position of 
                  little eye without affecting Input style */}
              <div className="relative">
                {/* Password Input */}
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={
                    mode === 'Forgot password'
                      ? t('newPassword')
                      : t('password')
                  }
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
            {getButtonText()}
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
            {t('forgotPasswordHint')}
            <button
              onClick={() => {
                setMode('Forgot password');
                reset();
              }}
              className="text-blue-200! underline underline-offset-4 cursor-pointer pl-1"
            >
              {t('clickHere')}
            </button>
          </span>
        )}
      </CardContent>

      {/* Other login ways such as google, github, X */}
      <div className="grid grid-cols-3 items-center justify-items-center px-8 py-2">
        <Separator className="max-w-24" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {t('orSignInWith')}
        </span>
        <Separator className="max-w-24" />
      </div>
      <div className="flex justify-center items-center gap-8 pb-8">
        {SOCIAL_PROVIDERS.map(({ id, Icon, label }, index) => (
          <Fragment key={id}>
            {index > 0 && <Separator orientation="vertical" className="h-6" />}
            <button
              onClick={() => signIn(id)}
              aria-label={label}
              className="cursor-pointer text-center"
            >
              <Icon
                className={cn('h-6 w-6', id === 'line' ? 'h-6.5 w-6.5' : '')}
                style={
                  id === 'line'
                    ? {
                        transform: 'translate(2px, -0.25px)',
                        borderRadius: '50%',
                      }
                    : undefined
                }
              />
            </button>
          </Fragment>
        ))}
      </div>
    </>
  );
}
