/**
 * Self-test of the service worker harness extension for the offline library
 * (Story 4.3.2, #358): preloaded cache entries and online/offline requests.
 */
import { describe, it, expect } from 'vitest';
import { loadServiceWorker } from '../../bdd/support/offlineHarness';

describe('service worker harness: preloaded cache entries', () => {
  it('stores arbitrary URL to body entries under a cache name', async () => {
    const sw = loadServiceWorker();
    await sw.preloadCache('sfs-shell-abc', { '/_next/static/chunks/x.js': 'chunk x' });
    expect(await sw.caches.keys()).toContain('sfs-shell-abc');
    expect(await sw.caches.match('/_next/static/chunks/x.js')).toEqual({
      url: '/_next/static/chunks/x.js',
      body: 'chunk x',
    });
  });

  it('adds to an existing cache without dropping its entries', async () => {
    const sw = loadServiceWorker();
    await sw.preloadCache('c', { '/a': 'A' });
    await sw.preloadCache('c', { '/b': 'B' });
    expect((await sw.caches.match('/a'))?.body).toBe('A');
    expect((await sw.caches.match('/b'))?.body).toBe('B');
  });
});

describe('service worker harness: request with an online flag', () => {
  it('sends a non-navigation request and reports it is not answered today', async () => {
    const sw = loadServiceWorker();
    await sw.preloadCache('c', { '/_next/static/chunks/x.js': 'chunk x' });
    const offline = await sw.request('/_next/static/chunks/x.js', { online: false });
    const online = await sw.request('/_next/static/chunks/x.js', { online: true });
    expect(offline.answered).toBe(false);
    expect(online.answered).toBe(false);
  });

  it('applies the online flag to navigations too', async () => {
    const sw = loadServiceWorker();
    await sw.install();
    expect((await sw.request('/songs', { online: false, mode: 'navigate' })).answered).toBe(true);
    expect((await sw.request('/songs', { online: true, mode: 'navigate' })).answered).toBe(false);
  });

  it('describes which response came back', async () => {
    const sw = loadServiceWorker();
    await sw.install();
    const answered = await sw.request('/songs', { online: false, mode: 'navigate' });
    expect(sw.describeResponse(answered)).toBe('cached /offline.html');
    const passed = await sw.request('/songs', { online: true, mode: 'navigate' });
    expect(sw.describeResponse(passed)).toBe('none (left to the browser)');
  });

  it('describes a network error', async () => {
    const sw = loadServiceWorker();
    const outcome = await sw.request('/songs', { online: false, mode: 'navigate' });
    expect(sw.describeResponse(outcome)).toBe('network error');
  });
});
