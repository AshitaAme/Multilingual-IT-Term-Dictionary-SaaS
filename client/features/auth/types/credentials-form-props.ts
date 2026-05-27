import { Credentials } from './credentials';

export interface CredentialsFormProps {
  setStep: (value: 'credentials' | 'verification') => void;
  setCredentials: (credentials: Credentials) => void;
}
