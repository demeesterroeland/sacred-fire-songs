/**
 * In-memory stand-in for the browser pieces LocaleProvider touches
 * (localStorage, document.cookie, <html lang>, navigator.languages).
 *
 * Records every cookie write so tests can assert whether a cookie was set,
 * and can simulate blocked storage (private mode) by throwing on access.
 *
 * Shared by vitest unit tests (testing/unit/tests) and Cucumber @unit steps
 * (testing/bdd/steps).
 */

import { LOCALE_STORAGE_KEY } from '@/lib/i18n';
import type { LocaleEnvironment } from '@/lib/i18n/persistence';

export interface FakeLocaleEnvironmentInit {
  stored?: string | null;
  cookie?: string;
  languages?: readonly string[];
  storageBlocked?: boolean;
}

export type FakeLocaleEnvironment = LocaleEnvironment & {
  store: Map<string, string>;
  /** Every value assigned to document.cookie, in order. */
  cookieWrites: string[];
};

export function fakeLocaleEnvironment(init: FakeLocaleEnvironmentInit = {}): FakeLocaleEnvironment {
  const store = new Map<string, string>();
  if (init.stored != null) store.set(LOCALE_STORAGE_KEY, init.stored);
  const cookieWrites: string[] = [];

  return {
    store,
    cookieWrites,
    storage: {
      getItem: (key) => {
        if (init.storageBlocked) throw new Error('SecurityError: localStorage is blocked');
        return store.get(key) ?? null;
      },
      setItem: (key, value) => {
        if (init.storageBlocked) throw new Error('SecurityError: localStorage is blocked');
        store.set(key, value);
      },
    },
    document: {
      get cookie() {
        return init.cookie ?? '';
      },
      set cookie(value: string) {
        cookieWrites.push(value);
      },
      documentElement: { lang: 'en' },
    },
    navigator: { languages: init.languages ?? [] },
  };
}
