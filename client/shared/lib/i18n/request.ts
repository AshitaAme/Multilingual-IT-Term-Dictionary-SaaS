import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // 1. Check if user has manually set a locale via cookie
  const cookieLocale = cookieStore.get('locale')?.value;
  const isCookieLocaleValid =
    !!cookieLocale &&
    routing.locales.includes(cookieLocale as (typeof routing.locales)[number]);

  // 2. Check browser/system language from request headers
  const acceptLanguage = headerStore.get('accept-language') ?? '';
  const browserLocale = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim())
    .find((lang) =>
      routing.locales.includes(lang as (typeof routing.locales)[number]),
    );

  // 3. Priority: user cookie > browser language > default
  let locale: string;
  if (isCookieLocaleValid) {
    locale = cookieLocale!;
  } else if (browserLocale) {
    locale = browserLocale;
  } else {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
