'use client';

import { Suspense, useState } from 'react';
import { CredentialsForm } from './credentials-form';
import { VerificationOTP } from './verification-OTP';
import { ShineBorder } from '@/shared/components/ui/shine-border';
import { Card } from '@/shared/components/ui/card';
import { useAuthModalStore } from '../stores/auth.store';
import { Credentials } from '../types/credentials';
import { AuthRedirectHandler } from './auth-redirect-handler';
import { X } from 'lucide-react';

export function AuthContainer() {
  const { open, onClose } = useAuthModalStore();
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  });
  const [step, setStep] = useState<'credentials' | 'verification'>(
    'credentials',
  );

  return (
    <>
      <Suspense>
        <AuthRedirectHandler />
      </Suspense>

      {/* This creates an overlay that blurred background */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
          {/* Card to show the form */}
          <Card className="relative w-full max-w-sm rounded-md bg-background py-0">
            <ShineBorder shineColor="currentColor" />
            <X
              size={16}
              onClick={onClose}
              className="absolute z-10 right-2.5 top-2.5 cursor-pointer"
            />

            {step === 'credentials' ? (
              <CredentialsForm
                setStep={setStep}
                setCredentials={setCredentials}
              />
            ) : (
              <VerificationOTP setStep={setStep} credentials={credentials} />
            )}
          </Card>
        </div>
      )}
    </>
  );
}
