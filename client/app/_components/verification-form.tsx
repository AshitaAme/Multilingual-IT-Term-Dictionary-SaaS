import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  AuthMailVerifyInput,
  authMailVerifySchema,
} from '@/validations/auth-mail-verify-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftToLine } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

interface VerificationFormProps {
  setGoVerify: (value: boolean) => void;
}

export function VerificationForm({
  setGoVerify,
}: Readonly<VerificationFormProps>) {
  const { control, handleSubmit } = useForm<AuthMailVerifyInput>({
    resolver: zodResolver(authMailVerifySchema),
    defaultValues: { email: '', verificationCode: '' },
  });

  const onSubmit = (data: AuthMailVerifyInput) => {};

  return (
    <div className="h-70 flex flex-col gap-8 items-center justify-center relative">
      <ArrowLeftToLine
        onClick={() => setGoVerify(false)}
        size={16}
        className="absolute top-2.5 left-2.5 cursor-pointer"
      />
      <span className="font-semibold text-[16px]">Verification Code</span>
      <form>
        <Controller
          control={control}
          name="verificationCode"
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
