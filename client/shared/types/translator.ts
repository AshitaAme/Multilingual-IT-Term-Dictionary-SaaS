import { useTranslations } from 'next-intl';

export type Translator =
  | ReturnType<typeof useTranslations>
  | ((key: string) => string);

export const DEFAULT_TRANSLATOR = (k: string) => k;
