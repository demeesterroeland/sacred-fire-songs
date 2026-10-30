/**
 * lib/i18n/index.ts
 *
 * Lightweight custom i18n engine.
 *
 * Design goals:
 * - Zero React hooks / zero "use client" requirement for the core functions
 * - Works in Server Components, Client Components, route handlers, and utility scripts
 * - Full TypeScript key inference — no string typos possible
 * - Simple {variable} interpolation with type-safe params
 * - No URL rewrites / middleware: the locale lives in localStorage + a cookie
 * - Falls back to English for any missing translation key, and to the key
 *   itself if it is missing everywhere (never renders blank / undefined)
 *
 * Where to translate:
 * - Server Components → `const t = await getServerT()` from `@/lib/i18n/server`
 * - Client Components → `const { t } = useLocale()` from `@/context/LocaleContext`
 *   (re-renders on language switch and hydrates in the server's locale)
 * - Anything else     → `tWithLocale(locale, key)` or the module-level `t()`
 */

import en, { type TranslationKey } from '@/messages/en';
import nl from '@/messages/nl';

// ─── Supported Locales ────────────────────────────────────────────────────────

export type Locale = 'en' | 'nl';

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'nl'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'sacred-fire-songs-locale';
export const LOCALE_COOKIE = 'sacred-fire-songs-locale';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
};

export type { TranslationKey };
export type InterpolationParams = Record<string, string | number>;
export type TranslateFn = (key: TranslationKey, params?: InterpolationParams) => string;

// ─── Dictionary Registry ──────────────────────────────────────────────────────

const dictionaries: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  en,
  nl,
};

// ─── Locale Matching & Resolution ─────────────────────────────────────────────

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Maps a BCP 47 tag ("nl-BE", "EN-us") to a supported locale, or null. */
export function matchLocale(tag: string | null | undefined): Locale | null {
  if (!tag) return null;
  const base = tag.trim().toLowerCase().split('-')[0];
  return isLocale(base) ? base : null;
}

/** Parses an Accept-Language header into tags ordered by preference. */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(',')
    .map((part, index) => {
      const [tag, ...attrs] = part.trim().split(';');
      const qAttr = attrs.find((a) => a.trim().startsWith('q='));
      const q = qAttr ? Number.parseFloat(qAttr.trim().slice(2)) : 1;
      return { tag: tag.trim(), q: Number.isNaN(q) ? 0 : q, index };
    })
    .filter(({ tag, q }) => tag && tag !== '*' && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ tag }) => tag);
}

export interface LocaleSources {
  /** Explicit choice from localStorage (client only). */
  stored?: string | null;
  /** Value of the locale cookie (client and server). */
  cookie?: string | null;
  /** navigator.languages or the parsed Accept-Language header. */
  browserLanguages?: readonly string[];
}

/** Explicit choice (localStorage, then cookie) > browser language > English. */
export function resolveLocale({ stored, cookie, browserLanguages = [] }: LocaleSources): Locale {
  if (isLocale(stored)) return stored;
  if (isLocale(cookie)) return cookie;
  for (const tag of browserLanguages) {
    const match = matchLocale(tag);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

export function serializeLocaleCookie(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function readCookie(cookieString: string, name: string): string | null {
  for (const part of cookieString.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

// ─── Translation ──────────────────────────────────────────────────────────────

/** Replaces {name} placeholders; unknown placeholders are kept literally. */
export function interpolate(raw: string, params?: InterpolationParams): string {
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] !== undefined ? String(params[name]) : match
  );
}

/** Active dictionary → fallback dictionary → the key itself. */
export function translateFrom(
  dict: Partial<Record<string, string>>,
  fallback: Partial<Record<string, string>>,
  key: string,
  params?: InterpolationParams
): string {
  const raw = dict[key] || fallback[key] || key;
  return interpolate(raw, params);
}

/**
 * Translate with an explicit locale. Request-safe: use this (or getServerT /
 * useLocale().t) instead of the module-level t() wherever the locale is known.
 */
export function tWithLocale(locale: Locale, key: TranslationKey, params?: InterpolationParams): string {
  return translateFrom(dictionaries[locale] ?? en, en, key, params);
}

// ─── Module-level Locale (client convenience) ─────────────────────────────────
// Set by LocaleProvider in the browser. On the server it stays DEFAULT_LOCALE,
// because module state is shared between concurrent requests.

let _locale: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  _locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getLocale(): Locale {
  return _locale;
}

/**
 * Translate a key in the current module-level locale.
 *
 * @example
 * t('nav.home')                          // "Home" | "Home" (nl)
 * t('playlists.songCount', { count: 3 }) // "3 songs" | "3 nummers"
 */
export function t(key: TranslationKey, params?: InterpolationParams): string {
  return tWithLocale(_locale, key, params);
}
