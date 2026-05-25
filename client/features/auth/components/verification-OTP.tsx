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
import { useAuthModalStore } from '../store/auth-modal.store';

export function VerificationOTP({
  setStep,
  credentials,
}: Readonly<VerificationOTPProps>) {
  const router = useRouter();
  const { onClose } = useAuthModalStore();
  const { control, handleSubmit, setError } = useForm<VerificationInput>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: { email: credentials.email, verificationToken: '' },
  });

  const onSubmit = async (data: VerificationInput) => {
    const signinUser = await verifySignupAction({
      verificationToken: data.verificationToken,
      email: credentials.email,
    });
    if (!signinUser.success) {
      setError('root.serverError', {
        type: 'server',
        message: signinUser.error ?? 'Something went wrong',
      });
      return;
    }
    const res = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    if (res?.error) {
      setError('root.serverError', {
        type: 'server',
        message: signinUser.error ?? 'Something went wrong',
      });
      return;
    }
    onClose();
    router.push('/');
  };

  return (
    <div className="h-70 flex flex-col gap-8 items-center justify-center relative">
      <ArrowLeftToLine
        size={16}
        onClick={() => setStep('credentials')}
        className="absolute left-2.5 top-2.5 cursor-pointer"
      />
      <span className="font-semibold text-[16px]">Verification Code</span>
      <form>
        <Controller
          control={control}
          name="verificationToken"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
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
      </form>
      <Button
        variant="ghost"
        size="xs"
        className="rounded-sm bg-background cursor-pointer"
      >
        <span className="hover:underline underline-offset-2">Resend</span>
      </Button>
    </div>
  );
}
