/**
 * lib/i18n/index.ts
 *
 * Lightweight custom i18n engine.
 *
 * Design goals:
 * - Zero React hooks / zero "use client" requirement
 * - Works in Server Components, Client Components, route handlers, and utility scripts
 * - Full TypeScript key inference — no string typos possible
 * - Simple {variable} interpolation with type-safe params
 * - Client-side locale switch via localStorage, no URL rewrites / middleware
 * - Falls back to English for any missing translation key
 */

import en, { type TranslationKey } from '@/messages/en';
import nl from '@/messages/nl';

// ─── Supported Locales ────────────────────────────────────────────────────────

export type Locale = 'en' | 'nl';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'nl'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'sacred-fire-songs-locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
};

// ─── Dictionary Registry ──────────────────────────────────────────────────────

const dictionaries: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  en,
  nl,
};

// ─── Runtime Locale State ─────────────────────────────────────────────────────
// This module-level variable is set on the client after hydration.
// On the server it is always DEFAULT_LOCALE.

let _locale: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  _locale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function getLocale(): Locale {
  return _locale;
}

// ─── Translation Function ─────────────────────────────────────────────────────

type InterpolationParams = Record<string, string | number>;

/**
 * Translate a key to the current locale string.
 *
 * @example
 * t('nav.home')                          // "Home" | "Startpagina"
 * t('song.by', { author: 'Nahko' })      // "by Nahko" | "door Nahko"
 * t('songs.searchPlaceholder', { count: 200 })  // "Search 200+ songs..."
 */
export function t(key: TranslationKey, params?: InterpolationParams): string {
  const dict = dictionaries[_locale];
  // Fall back to English if the key is missing in the current locale
  const raw = (dict[key] ?? en[key]) as string;
  if (!params) return raw;
  // Interpolate {variable} placeholders
  return raw.replace(/\{(\w+)\}/g, (_, name) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`
  );
}

// ─── Server-side Helper ───────────────────────────────────────────────────────
// Call this in Server Components or route handlers to translate with an
// explicit locale (not relying on the module-level state).

export function tWithLocale(
  locale: Locale,
  key: TranslationKey,
  params?: InterpolationParams
): string {
  const dict = dictionaries[locale];
  const raw = (dict[key] ?? en[key]) as string;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`
  );
}
