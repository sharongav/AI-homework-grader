import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'he', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** RTL locales — used for dir="rtl" on html element. */
export const rtlLocales: Locale[] = ['he', 'ar'];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
