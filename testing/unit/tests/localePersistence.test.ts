import { describe, it, expect } from 'vitest';
import { LOCALE_COOKIE, LOCALE_STORAGE_KEY } from '@/lib/i18n';
import { persistLocale, readPersistedLocale, syncLocaleOnMount, type LocaleEnvironment } from '@/lib/i18n/persistence';

/**
 * LocaleProvider logic, tested without a DOM: the provider passes the real
 * window.localStorage / document / navigator into these helpers.
 */
function fakeEnv(init: { stored?: string | null; cookie?: string; languages?: string[]; throwing?: boolean } = {}) {
  const store = new Map<string, string>();
  if (init.stored != null) store.set(LOCALE_STORAGE_KEY, init.stored);
  const env: LocaleEnvironment & { store: Map<string, string>; cookies: string[] } = {
    store,
    cookies: [],
    storage: {
      getItem: (k) => {
        if (init.throwing) throw new Error('SecurityError');
        return store.get(k) ?? null;
      },
      setItem: (k, v) => {
        if (init.throwing) throw new Error('QuotaExceededError');
        store.set(k, v);
      },
    },
    document: {
      get cookie() {
        return init.cookie ?? '';
      },
      set cookie(v: string) {
        env.cookies.push(v);
      },
      documentElement: { lang: 'en' },
    },
    navigator: { languages: init.languages ?? [] },
  };
  return env;
}

describe('readPersistedLocale()', () => {
  it('returns the localStorage choice first', () => {
    const env = fakeEnv({ stored: 'nl', cookie: `${LOCALE_COOKIE}=en`, languages: ['en'] });
    expect(readPersistedLocale(env)).toBe('nl');
  });

  it('falls back to the cookie when localStorage is empty', () => {
    const env = fakeEnv({ cookie: `${LOCALE_COOKIE}=nl`, languages: ['en'] });
    expect(readPersistedLocale(env)).toBe('nl');
  });

  it('falls back to the browser language when nothing is stored', () => {
    expect(readPersistedLocale(fakeEnv({ languages: ['nl-BE', 'en'] }))).toBe('nl');
  });

  it('defaults to English for an unsupported browser language', () => {
    expect(readPersistedLocale(fakeEnv({ languages: ['de-DE'] }))).toBe('en');
  });

  it('ignores a tampered localStorage value', () => {
    expect(readPersistedLocale(fakeEnv({ stored: 'klingon', languages: ['nl'] }))).toBe('nl');
  });

  it('survives localStorage being unavailable (private mode)', () => {
    expect(readPersistedLocale(fakeEnv({ throwing: true, cookie: `${LOCALE_COOKIE}=nl` }))).toBe('nl');
  });
});

describe('persistLocale()', () => {
  it('writes localStorage, the cookie and <html lang>', () => {
    const env = fakeEnv();
    persistLocale(env, 'nl');
    expect(env.store.get(LOCALE_STORAGE_KEY)).toBe('nl');
    expect(env.cookies.at(-1)).toContain(`${LOCALE_COOKIE}=nl`);
    expect(env.document.documentElement.lang).toBe('nl');
  });

  it('still sets the cookie and lang when localStorage throws', () => {
    const env = fakeEnv({ throwing: true });
    expect(() => persistLocale(env, 'nl')).not.toThrow();
    expect(env.cookies.at(-1)).toContain(`${LOCALE_COOKIE}=nl`);
    expect(env.document.documentElement.lang).toBe('nl');
  });

  it('round-trips: a persisted choice is read back after a "reload"', () => {
    const env = fakeEnv({ languages: ['en'] });
    persistLocale(env, 'nl');
    const reloaded = fakeEnv({ stored: env.store.get(LOCALE_STORAGE_KEY), languages: ['en'] });
    expect(readPersistedLocale(reloaded)).toBe('nl');
  });
});

describe('syncLocaleOnMount()', () => {
  it('re-writes the cookie when localStorage holds a choice the cookie lacks', () => {
    const env = fakeEnv({ stored: 'nl', languages: ['en'] });
    expect(syncLocaleOnMount(env)).toBe('nl');
    expect(env.cookies.at(-1)).toContain(`${LOCALE_COOKIE}=nl`);
    expect(env.document.documentElement.lang).toBe('nl');
  });

  it('leaves the cookie alone when it already matches', () => {
    const env = fakeEnv({ stored: 'nl', cookie: `${LOCALE_COOKIE}=nl` });
    syncLocaleOnMount(env);
    expect(env.cookies).toEqual([]);
  });

  it('does not turn the browser-language default into a stored choice', () => {
    const env = fakeEnv({ languages: ['nl-NL'] });
    expect(syncLocaleOnMount(env)).toBe('nl');
    expect(env.cookies).toEqual([]);
    expect(env.store.has(LOCALE_STORAGE_KEY)).toBe(false);
    expect(env.document.documentElement.lang).toBe('nl');
  });
});
