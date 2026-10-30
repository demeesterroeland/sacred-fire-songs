'use client';

/**
 * context/LocaleContext.tsx
 *
 * Client-side locale provider.
 *
 * - Starts with the locale the server rendered (`serverLocale`, resolved from
 *   the locale cookie / Accept-Language), so hydration always matches the SSR
 *   markup — no hydration mismatch and no English flash for Dutch users.
 * - After mount it reads the persisted choice (localStorage > cookie >
 *   navigator.languages > English) and switches if it differs, re-syncing the
 *   cookie and refreshing Server Components so they follow.
 * - setLocaleAndPersist() saves to localStorage + cookie, updates <html lang>
 *   and keeps the module-level t() in sync; an effect then refreshes Server
 *   Components until the layout's serverLocale matches.
 * - Client Components translate with `const { t } = useLocale()`, which
 *   re-renders them whenever the language changes.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  isLocale,
  setLocale,
  tWithLocale,
  type Locale,
  type TranslateFn,
} from '@/lib/i18n';
import { browserLocaleEnvironment, persistLocale, syncLocaleOnMount } from '@/lib/i18n/persistence';

interface LocaleContextType {
  locale: Locale;
  t: TranslateFn;
  setLocaleAndPersist: (locale: Locale) => void;
  supportedLocales: readonly Locale[];
  localeLabels: typeof LOCALE_LABELS;
}

const MAX_REFRESH_RETRIES = 3;
const REFRESH_RETRY_MS = 1500;

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  serverLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  serverLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(serverLocale);

  useEffect(() => {
    const resolved = syncLocaleOnMount(browserLocaleEnvironment());
    setLocale(resolved);
    if (resolved !== serverLocale) setLocaleState(resolved);
    // Only on mount: later changes go through setLocaleAndPersist.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Server Components follow the cookie. Refresh until the root layout
  // re-renders with the same locale (serverLocale prop), retrying a few times
  // because a refresh can be dropped while other router work is in flight.
  // Bounded so a browser that blocks cookies never loops.
  const refreshAttempts = useRef(0);
  useEffect(() => {
    if (locale === serverLocale) {
      refreshAttempts.current = 0;
      return;
    }
    router.refresh();
    const retry = setInterval(() => {
      if (refreshAttempts.current >= MAX_REFRESH_RETRIES) return clearInterval(retry);
      refreshAttempts.current += 1;
      router.refresh();
    }, REFRESH_RETRY_MS);
    return () => clearInterval(retry);
  }, [locale, serverLocale, router]);

  const setLocaleAndPersist = useCallback((next: Locale) => {
    const resolved = isLocale(next) ? next : DEFAULT_LOCALE;
    persistLocale(browserLocaleEnvironment(), resolved);
    setLocale(resolved);
    setLocaleState(resolved);
  }, []);

  const value = useMemo<LocaleContextType>(
    () => ({
      locale,
      t: (key, params) => tWithLocale(locale, key, params),
      setLocaleAndPersist,
      supportedLocales: SUPPORTED_LOCALES,
      localeLabels: LOCALE_LABELS,
    }),
    [locale, setLocaleAndPersist]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * useLocale() — current locale, a bound `t`, and the setter.
 * Use `const { t } = useLocale()` in every Client Component that shows text.
 */
export function useLocale(): LocaleContextType {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a <LocaleProvider>');
  }
  return ctx;
}
