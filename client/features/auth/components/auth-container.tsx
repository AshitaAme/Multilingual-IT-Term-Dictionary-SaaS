'use client';

import { useState } from 'react';
import { CredentialsForm } from './credentials-form';
import { VerificationOTP } from './verification-OTP';
import { ShineBorder } from '@/shared/components/ui/shine-border';
import { Card } from '@/shared/components/ui/card';
import { X } from 'lucide-react';
import { useAuthModalStore } from '../store/auth-modal.store';
import { Credentials } from '../types/credentials';
import { AuthRedirectHandler } from './auth-redirect-handler';

export function AuthContainer() {
  const { open, onClose } = useAuthModalStore();
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  });
  const [step, setStep] = useState<'credentials' | 'verification'>(
    'credentials',
  );

  if (!open) return <AuthRedirectHandler />;

  return (
    // This creates an overlay that blurred background
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
      {/* Card to show the form */}
      <Card className="relative w-full max-w-sm rounded-md bg-background py-0">
        <ShineBorder shineColor="currentColor" />
        <X
          size={16}
          onClick={onClose}
          className="absolute right-2.5 top-2.5 cursor-pointer"
        />
        {step === 'credentials' ? (
          <CredentialsForm setStep={setStep} setCredentials={setCredentials} />
        ) : (
          <VerificationOTP setStep={setStep} credentials={credentials} />
        )}
      </Card>
    </div>
  );
}
