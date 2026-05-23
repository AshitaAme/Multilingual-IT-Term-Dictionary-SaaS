'use client';

import { useState } from 'react';

export function AuthContainer() {
  const [step, setStep] = useState<'credentials' | 'verification'>(
    'credentials',
  );
}
