'use client';

/**
 * context/LocaleContext.tsx
 *
 * Client-side locale provider.
 *
 * - Reads locale from localStorage on mount (post-hydration).
 * - Calls setLocale() to update the module-level state in lib/i18n/index.ts.
 * - Exposes useLocale() hook for components that need to react to locale changes.
 * - Does NOT use URL rewrites or server-side locale negotiation.
 * - suppressHydrationWarning is required on <html lang> to avoid mismatch
 *   (server always renders 'en', client switches after hydration).
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  getLocale,
  setLocale,
  type Locale,
} from '@/lib/i18n';

interface LocaleContextType {
  locale: Locale;
  setLocaleAndPersist: (locale: Locale) => void;
  supportedLocales: Locale[];
  localeLabels: typeof LOCALE_LABELS;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Start with the default (English) to match SSR.
  // The useEffect below switches to the stored preference after hydration.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // Read stored locale from localStorage post-hydration
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    const resolved =
      stored && SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;

    if (resolved !== getLocale()) {
      setLocale(resolved);
      setLocaleState(resolved);
    }

    // Update <html lang> attribute dynamically
    document.documentElement.lang = resolved;
  }, []);

  const setLocaleAndPersist = useCallback((next: Locale) => {
    const resolved = SUPPORTED_LOCALES.includes(next) ? next : DEFAULT_LOCALE;
    setLocale(resolved);
    setLocaleState(resolved);
    localStorage.setItem(LOCALE_STORAGE_KEY, resolved);
    document.documentElement.lang = resolved;
  }, []);

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocaleAndPersist,
        supportedLocales: SUPPORTED_LOCALES,
        localeLabels: LOCALE_LABELS,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * useLocale() — access the current locale and the setter from any Client Component.
 *
 * For simple translation calls inside Client Components, you can also just
 * import `t` directly from `@/lib/i18n` — no hook needed.
 *
 * Use `useLocale()` only when you need to:
 * - Render the current locale label in a language switcher
 * - Reactively re-render when the locale changes
 */
export function useLocale(): LocaleContextType {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a <LocaleProvider>');
  }
  return ctx;
}
