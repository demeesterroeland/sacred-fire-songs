/**
 * Issue #353 – offline navigation fallback (docs/testing/offline.feature, @unit).
 * public/sw.js and the script of public/offline.html run in a Node vm sandbox.
 */
import { describe, it, expect } from 'vitest';
import { DICTIONARIES, SUPPORTED_LOCALES, resolveLocale } from '@/lib/i18n';
import { loadServiceWorker, offlinePageMessages, showOfflinePage } from '../../bdd/support/offlineHarness';

const OFFLINE_KEYS = ['offline.title', 'offline.description', 'offline.retry'] as const;

describe('service worker (public/sw.js)', () => {
  it('stores the offline page on install', async () => {
    const sw = loadServiceWorker();
    await sw.install();
    expect(await sw.caches.match('/offline.html')).toBeDefined();
  });

  it('answers a page navigation with the offline page while offline', async () => {
    const sw = loadServiceWorker();
    await sw.install();
    sw.setOnline(false);
    const outcome = await sw.fetch('/songs/some-song');
    expect(outcome.answered).toBe(true);
    expect(outcome.response).toEqual({ url: '/offline.html', body: 'cached /offline.html' });
  });

  it('leaves page navigations to the browser while online', async () => {
    const sw = loadServiceWorker();
    await sw.install();
    expect((await sw.fetch('/songs/some-song')).answered).toBe(false);
  });

  it.each([
    ['a data request', { mode: 'cors' }],
    ['a POST navigation (form submit)', { mode: 'navigate', method: 'POST' }],
  ])('never answers %s, even offline', async (_label, init) => {
    const sw = loadServiceWorker();
    await sw.install();
    sw.setOnline(false);
    expect((await sw.fetch('/rest/v1/compositions', init)).answered).toBe(false);
  });

  it('falls back to a network error when the offline page was never stored', async () => {
    const sw = loadServiceWorker();
    sw.setOnline(false);
    expect(await sw.fetch('/songs/some-song')).toEqual({ answered: true, response: { type: 'error' } });
  });

  it('removes outdated offline caches on activate and keeps unrelated ones', async () => {
    const sw = loadServiceWorker(['sfs-offline-v0', 'other-app']);
    await sw.install();
    await sw.activate();
    const names = await sw.caches.keys();
    expect(names).not.toContain('sfs-offline-v0');
    expect(names).toContain('other-app');
    expect(names.some((n) => n.startsWith('sfs-offline-'))).toBe(true);
  });
});

describe('offline page (public/offline.html)', () => {
  it('embeds the offline texts of every interface language, equal to the app dictionaries', () => {
    const messages = offlinePageMessages();
    expect(Object.keys(messages).sort()).toEqual([...SUPPORTED_LOCALES].sort());
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of OFFLINE_KEYS) {
        const expected = DICTIONARIES[locale][key];
        expect(expected, `${locale} ${key} missing from messages/${locale}.ts`).toBeTruthy();
        expect(messages[locale][key], `${locale} ${key}`).toBe(expected);
      }
    }
  });

  it.each([
    { stored: 'nl', cookie: null, browserLanguages: ['en-US'] },
    { stored: null, cookie: 'fr', browserLanguages: ['en-US'] },
    { stored: null, cookie: null, browserLanguages: ['pt-BR', 'en'] },
    { stored: null, cookie: null, browserLanguages: ['quz-PE'] },
    { stored: null, cookie: null, browserLanguages: ['de-DE'] },
    { stored: 'xx', cookie: null, browserLanguages: ['es-ES'] },
    { stored: null, cookie: null, browserLanguages: [] },
  ])('picks the same language as the app for %o', (visit) => {
    const expected = resolveLocale(visit);
    const page = showOfflinePage(visit);
    expect(page.lang).toBe(expected);
    expect(page.title).toBe(DICTIONARIES[expected]['offline.title']);
    expect(page.description).toBe(DICTIONARIES[expected]['offline.description']);
    expect(page.retry).toBe(DICTIONARIES[expected]['offline.retry']);
  });

  it('reloads when Retry is pressed', () => {
    const page = showOfflinePage();
    page.pressRetry();
    expect(page.reloads).toBe(1);
  });

  it('reloads by itself when the connection comes back', () => {
    const page = showOfflinePage();
    page.comeOnline();
    expect(page.reloads).toBe(1);
  });
});
