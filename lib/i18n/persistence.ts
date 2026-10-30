/**
 * lib/i18n/persistence.ts
 *
 * Browser-side persistence of the language choice, written against a minimal
 * environment interface so it can be unit-tested without a DOM.
 * LocaleProvider passes the real window.localStorage / document / navigator.
 */

import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  readCookie,
  resolveLocale,
  serializeLocaleCookie,
  type Locale,
} from '@/lib/i18n';

export interface LocaleEnvironment {
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  document: { cookie: string; documentElement: { lang: string } };
  navigator: { languages: readonly string[] };
}

function safeGetItem(env: LocaleEnvironment): string | null {
  try {
    return env.storage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null; // localStorage disabled (private mode, sandboxed iframe)
  }
}

/** localStorage > cookie > navigator.languages > English. */
export function readPersistedLocale(env: LocaleEnvironment): Locale {
  return resolveLocale({
    stored: safeGetItem(env),
    cookie: readCookie(env.document.cookie, LOCALE_COOKIE),
    browserLanguages: env.navigator.languages,
  });
}

/** Saves the choice to localStorage and the cookie, and updates <html lang>. */
export function persistLocale(env: LocaleEnvironment, locale: Locale): void {
  try {
    env.storage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The cookie below still carries the choice.
  }
  env.document.cookie = serializeLocaleCookie(locale);
  env.document.documentElement.lang = locale;
}

/**
 * Runs once after hydration: resolves the locale and updates <html lang>.
 * Re-writes the cookie only for an explicit localStorage choice the cookie
 * lacks, so a browser-language default never becomes a sticky choice.
 */
export function syncLocaleOnMount(env: LocaleEnvironment): Locale {
  const resolved = readPersistedLocale(env);
  const stored = safeGetItem(env);
  if (stored === resolved && readCookie(env.document.cookie, LOCALE_COOKIE) !== resolved) {
    env.document.cookie = serializeLocaleCookie(resolved);
  }
  env.document.documentElement.lang = resolved;
  return resolved;
}

export function browserLocaleEnvironment(): LocaleEnvironment {
  // Lazy access: merely reading window.localStorage throws when storage is blocked.
  return {
    storage: {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    },
    document,
    navigator,
  };
}
