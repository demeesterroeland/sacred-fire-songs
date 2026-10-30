/**
 * lib/i18n/server.ts
 *
 * Request-scoped locale for Server Components, route handlers and Server Actions.
 * Reads the locale cookie written by LocaleProvider, falling back to the
 * browser's Accept-Language header, then English.
 *
 * Only import this from server code (it uses next/headers).
 */

import { cookies, headers } from 'next/headers';
import {
  LOCALE_COOKIE,
  resolveRequestLocale,
  tWithLocale,
  type Locale,
  type TranslateFn,
} from '@/lib/i18n';

export async function getServerLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveRequestLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerStore.get('accept-language'));
}

/** `const t = await getServerT();` → `t('nav.home')` in the request's locale. */
export async function getServerT(): Promise<TranslateFn> {
  const locale = await getServerLocale();
  return (key, params) => tWithLocale(locale, key, params);
}
