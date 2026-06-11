'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftToLine } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { VerificationInput, VerificationSchema } from '../schemas/verification';
import { Field } from '@/shared/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/shared/components/ui/input-otp';
import { Button } from '@/shared/components/ui/button';
import { verifySignupAction } from '../actions/verify-signup.action';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { VerificationOTPProps } from '../types/verification-OTP-props';
import { useAuthModalStore } from '../stores/auth.store';
import { verifyResetPasswordAction } from '../actions/verify-reset-password-action';
import { resendVerificationAction } from '../actions/resend-verification.action';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/utils/utils';
import { useTranslations } from 'next-intl';

export function VerificationOTP({
  setStep,
  credentials,
}: Readonly<VerificationOTPProps>) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { onClose } = useAuthModalStore();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    clearErrors,
  } = useForm<VerificationInput>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: { email: credentials.email, verificationToken: '' },
    mode: 'onSubmit',
  });

  // Submit Logic
  const onSubmit = async (data: VerificationInput) => {
    console.log('Verification-OTP:BOOLEAN', credentials.resetPassword);

    // 1. Check type of verification and do actions
    const verified = credentials.resetPassword
      ? await verifyResetPasswordAction({
          verificationToken: data.verificationToken,
          email: credentials.email,
        })
      : await verifySignupAction({
          verificationToken: data.verificationToken,
          email: credentials.email,
        });

    // 2. If failed, mount the error to form
    if (!verified.success) {
      setError('root.serverError', {
        type: 'server',
        message: verified.error ?? t('somethingWentWrong'),
      });
      return;
    }

    // 3. Sign in User
    console.log('VERIFICATION-OTP: SIGNIN!');
    const signed = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    // 4. If sign in failed, mount the error
    if (signed?.error) {
      setError('root.serverError', {
        type: 'server',
        message: verified.error ?? t('somethingWentWrong'),
      });
      return;
    }

    // 5. Close form and move to home page
    onClose();
    router.push('/');
  };

  // Resend Logic
  const [countdown, setCountdown] = useState(60);

  // 0. Set a countdown trigger for resend interval
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const onResend = async () => {
    clearErrors();
    // 1. Do resend action
    const resent = await resendVerificationAction({ email: credentials.email });

    // 2. If failed, mount the error
    if (!resent.success) {
      setError('root.serverError', {
        type: 'server',
        message: resent.error ?? t('somethingWentWrong'),
      });
      return;
    }

    // 3. Initiate count down
    setCountdown(60);
  };

  return (
    <div className="h-70 flex flex-col items-center justify-center relative">
      <ArrowLeftToLine
        size={16}
        onClick={() => setStep('credentials')}
        className="absolute left-2.5 top-2.5 cursor-pointer"
      />
      <span className="mb-8 font-semibold text-[16px]">
        {t('verificationCode')}
      </span>{' '}
      <form>
        <Controller
          control={control}
          name="verificationToken"
          render={({ field }) => (
            <Field>
              <InputOTP
                className="flex flex-col items-center gap-2"
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
                onComplete={handleSubmit(onSubmit)}
              >
                <InputOTPGroup className="flex flex-cols gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </Field>
          )}
        />
        {errors.verificationToken && (
          <div className="py-1 mt-4 text-center ring-1 rounded-4xl text-destructive text-sm font-medium">
            {errors.verificationToken.message}
          </div>
        )}
        {errors.root?.serverError && (
          <div className="py-1 mt-4 text-center ring-1 rounded-4xl text-destructive text-sm font-medium">
            {errors.root.serverError.message}
          </div>
        )}
      </form>
      <Button
        variant="ghost"
        size="xs"
        className={cn(
          'rounded-sm bg-background mt-4',
          countdown > 0
            ? 'cursor-not-allowed pointer-events-none'
            : 'cursor-pointer',
        )}
        onClick={onResend}
      >
        {countdown > 0 ? (
          <span>{t('waiting', { countdown })}</span>
        ) : (
          <span className="underline underline-offset-2">{t('resend')}</span> //
        )}
      </Button>
    </div>
  );
}
