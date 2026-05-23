import { Credentials } from './credentials';

export interface VerificationOTPProps {
  setStep: (value: 'credentials' | 'verification') => void;
  credentials: Credentials;
}
