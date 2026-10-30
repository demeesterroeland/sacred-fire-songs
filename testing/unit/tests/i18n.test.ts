import { describe, it, expect, afterEach } from 'vitest';
import en from '@/messages/en';
import nl from '@/messages/nl';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
  getLocale,
  interpolate,
  isLocale,
  matchLocale,
  parseAcceptLanguage,
  readCookie,
  resolveLocale,
  resolveRequestLocale,
  serializeLocaleCookie,
  setLocale,
  t,
  translateFrom,
  tWithLocale,
} from '@/lib/i18n';
import type { TranslationKey } from '@/messages/en';

afterEach(() => setLocale(DEFAULT_LOCALE));

describe('t() and tWithLocale()', () => {
  it('translates a key in the default locale (English)', () => {
    expect(t('nav.home')).toBe('Home');
  });

  it('translates a key in Dutch after setLocale("nl")', () => {
    setLocale('nl');
    expect(t('nav.home')).toBe(nl['nav.home']);
    expect(t('nav.home')).not.toBe(en['nav.home']);
  });

  it('tWithLocale uses the explicit locale, not the module state', () => {
    setLocale('en');
    expect(tWithLocale('nl', 'nav.home')).toBe(nl['nav.home']);
    expect(getLocale()).toBe('en');
  });

  it('interpolates {params} in the translated string', () => {
    expect(tWithLocale('en', 'playlists.songCount', { count: 3 })).toBe(
      en['playlists.songCount'].replace('{count}', '3'),
    );
  });
});

describe('interpolate()', () => {
  it('replaces every occurrence of each placeholder', () => {
    expect(interpolate('{a} and {a} with {b}', { a: 'x', b: 2 })).toBe('x and x with 2');
  });

  it('keeps unknown placeholders literally', () => {
    expect(interpolate('Hello {name}, {missing}', { name: 'Ana' })).toBe('Hello Ana, {missing}');
  });

  it('returns the raw string when no params are given', () => {
    expect(interpolate('Hello {name}')).toBe('Hello {name}');
  });

  it('renders 0 instead of treating it as missing', () => {
    expect(interpolate('{count} songs', { count: 0 })).toBe('0 songs');
  });
});

describe('fallback behaviour', () => {
  const primary = { greeting: 'Hello', farewell: 'Goodbye' } as Record<string, string>;

  it('falls back to the default dictionary when the key is missing in the active one', () => {
    const partial = { greeting: 'Hallo' };
    expect(translateFrom(partial, primary, 'farewell')).toBe('Goodbye');
    expect(translateFrom(partial, primary, 'greeting')).toBe('Hallo');
  });

  it('falls back when the active value is an empty string', () => {
    expect(translateFrom({ greeting: '' }, primary, 'greeting')).toBe('Hello');
  });

  it('returns the key itself when it is missing in every dictionary', () => {
    expect(translateFrom({}, primary, 'does.not.exist')).toBe('does.not.exist');
  });

  it('t() never returns undefined for an unknown key at runtime', () => {
    setLocale('nl');
    expect(t('does.not.exist' as TranslationKey)).toBe('does.not.exist');
  });
});

describe('isLocale() / matchLocale()', () => {
  it('accepts only supported locale codes', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('nl')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });

  it.each([
    ['nl', 'nl'],
    ['nl-BE', 'nl'],
    ['NL-nl', 'nl'],
    ['en-US', 'en'],
    [' en ', 'en'],
    ['fr-FR', null],
    ['', null],
    [undefined, null],
  ])('matchLocale(%j) → %j', (input, expected) => {
    expect(matchLocale(input as string | undefined)).toBe(expected);
  });
});

describe('setLocale()', () => {
  it('ignores an unsupported locale and uses the default', () => {
    setLocale('nl');
    setLocale('fr' as never);
    expect(getLocale()).toBe(DEFAULT_LOCALE);
  });
});

describe('parseAcceptLanguage()', () => {
  it('orders languages by q-value, keeping header order for ties', () => {
    expect(parseAcceptLanguage('fr-FR,fr;q=0.9,nl;q=0.8,en;q=0.8')).toEqual(['fr-FR', 'fr', 'nl', 'en']);
  });

  it('drops entries with q=0 and the wildcard', () => {
    expect(parseAcceptLanguage('nl;q=0, *;q=0.5, en')).toEqual(['en']);
  });

  it('returns an empty list for a missing header', () => {
    expect(parseAcceptLanguage(null)).toEqual([]);
    expect(parseAcceptLanguage('')).toEqual([]);
  });
});

describe('resolveLocale()', () => {
  it('defaults to English when nothing is known', () => {
    expect(resolveLocale({})).toBe('en');
  });

  it('uses the first supported browser language', () => {
    expect(resolveLocale({ browserLanguages: ['fr-FR', 'nl-BE', 'en'] })).toBe('nl');
  });

  it('falls back to English when no browser language is supported', () => {
    expect(resolveLocale({ browserLanguages: ['fr-FR', 'de'] })).toBe('en');
  });

  it('prefers the cookie over the browser language', () => {
    expect(resolveLocale({ cookie: 'en', browserLanguages: ['nl'] })).toBe('en');
  });

  it('prefers the stored (localStorage) choice over cookie and browser', () => {
    expect(resolveLocale({ stored: 'nl', cookie: 'en', browserLanguages: ['en'] })).toBe('nl');
  });

  it('ignores invalid stored and cookie values', () => {
    expect(resolveLocale({ stored: 'fr', cookie: 'xx', browserLanguages: ['nl'] })).toBe('nl');
    expect(resolveLocale({ stored: '<script>', cookie: '' })).toBe('en');
  });
});

describe('resolveRequestLocale() – server side', () => {
  it('uses the Accept-Language header when no cookie is sent', () => {
    expect(resolveRequestLocale(undefined, 'fr-FR,fr;q=0.9,nl;q=0.8,en;q=0.7')).toBe('nl');
  });

  it('lets the locale cookie override Accept-Language', () => {
    expect(resolveRequestLocale('en', 'nl-BE,nl;q=0.9')).toBe('en');
  });

  it('defaults to English without cookie or header', () => {
    expect(resolveRequestLocale(undefined, null)).toBe('en');
  });
});

describe('locale cookie helpers', () => {
  it('serializes a year-long, site-wide, lax cookie', () => {
    const cookie = serializeLocaleCookie('nl');
    expect(cookie).toContain(`${LOCALE_COOKIE}=nl`);
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('Max-Age=31536000');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('reads a cookie value from a document.cookie string', () => {
    expect(readCookie(`a=1; ${LOCALE_COOKIE}=nl; b=2`, LOCALE_COOKIE)).toBe('nl');
    expect(readCookie('a=1', LOCALE_COOKIE)).toBeNull();
    expect(readCookie('', LOCALE_COOKIE)).toBeNull();
  });
});

describe('dictionaries', () => {
  const enKeys = Object.keys(en).sort();
  const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  it('declare English as default and support exactly en + nl', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect([...SUPPORTED_LOCALES].sort()).toEqual(['en', 'nl']);
  });

  it('Dutch has exactly the same keys as English', () => {
    expect(Object.keys(nl).sort()).toEqual(enKeys);
  });

  it('no translation is empty', () => {
    for (const [key, value] of [...Object.entries(en), ...Object.entries(nl)]) {
      expect(value, key).toBeTypeOf('string');
      expect((value as string).trim(), key).not.toBe('');
    }
  });

  it('Dutch uses the same {placeholders} as English for every key', () => {
    for (const key of enKeys as TranslationKey[]) {
      expect(placeholders(nl[key] ?? ''), key).toEqual(placeholders(en[key]));
    }
  });
});
