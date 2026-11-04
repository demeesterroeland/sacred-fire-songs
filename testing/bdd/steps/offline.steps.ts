/**
 * Step definitions for the @unit scenarios of docs/testing/offline.feature (#353).
 * public/sw.js and public/offline.html run in a Node vm sandbox
 * (testing/bdd/support/offlineHarness.ts); no browser, no database.
 */
import { Before, Given, When, Then } from '@cucumber/cucumber';
import type { World } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DICTIONARIES, SUPPORTED_LOCALES, type Locale, type TranslationKey } from '@/lib/i18n';
import {
  loadServiceWorker,
  offlinePageMessages,
  showOfflinePage,
  type FetchOutcome,
  type OfflinePage,
  type OfflinePageVisit,
  type ServiceWorkerHarness,
} from '../support/offlineHarness';

interface OfflineState {
  existingCaches: string[];
  online: boolean;
  sw?: ServiceWorkerHarness;
  outcome?: FetchOutcome;
  visit: OfflinePageVisit;
  page?: OfflinePage;
}
type OfflineWorld = World & { offline: OfflineState };

const blankToNull = (value: string) => (value.trim() === '' ? null : value.trim());

const serviceWorker = (w: OfflineWorld) => {
  w.offline.sw ??= loadServiceWorker(w.offline.existingCaches);
  w.offline.sw.setOnline(w.offline.online);
  return w.offline.sw;
};

Before({ tags: '@offline' }, function (this: OfflineWorld) {
  this.offline = { existingCaches: [], online: true, visit: {} };
});

// ---------------------------------------------------------------------------
// Service worker
// ---------------------------------------------------------------------------

Given('an outdated offline cache {string} exists', function (this: OfflineWorld, name: string) {
  this.offline.existingCaches.push(name);
});

Given('an unrelated cache {string} exists', function (this: OfflineWorld, name: string) {
  this.offline.existingCaches.push(name);
});

Given('the browser is offline', function (this: OfflineWorld) {
  this.offline.online = false;
});

Given('the browser is online', function (this: OfflineWorld) {
  this.offline.online = true;
});

When('the service worker is installed', async function (this: OfflineWorld) {
  await serviceWorker(this).install();
});

When('the service worker is activated', async function (this: OfflineWorld) {
  await serviceWorker(this).activate();
});

When('the browser navigates to {string}', async function (this: OfflineWorld, url: string) {
  this.offline.outcome = await serviceWorker(this).fetch(url, { mode: 'navigate' });
});

When('the page fetches {string}', async function (this: OfflineWorld, url: string) {
  this.offline.outcome = await serviceWorker(this).fetch(url, { mode: 'cors' });
});

Then('the offline page {string} is stored in the offline cache', async function (this: OfflineWorld, url: string) {
  const sw = serviceWorker(this);
  const names = await sw.caches.keys();
  assert.ok(names.some((name) => name.startsWith('sfs-offline-')), `no offline cache in ${names.join(', ')}`);
  assert.ok(await sw.caches.match(url), `${url} is not cached`);
});

Then('the service worker answers with the stored offline page', function (this: OfflineWorld) {
  assert.equal(this.offline.outcome?.answered, true);
  assert.deepEqual(this.offline.outcome?.response, { url: '/offline.html', body: 'cached /offline.html' });
});

Then('the service worker does not answer the request', function (this: OfflineWorld) {
  assert.equal(this.offline.outcome?.answered, false);
});

Then('the cache {string} is removed', async function (this: OfflineWorld, name: string) {
  assert.ok(!(await serviceWorker(this).caches.keys()).includes(name));
});

Then('the cache {string} is kept', async function (this: OfflineWorld, name: string) {
  assert.ok((await serviceWorker(this).caches.keys()).includes(name));
});

// ---------------------------------------------------------------------------
// Offline page
// ---------------------------------------------------------------------------

Given("the visitor's stored language choice is {string}", function (this: OfflineWorld, value: string) {
  this.offline.visit.stored = blankToNull(value);
});

Given("the visitor's locale cookie is {string}", function (this: OfflineWorld, value: string) {
  this.offline.visit.cookie = blankToNull(value);
});

Given("the visitor's browser languages are {string}", function (this: OfflineWorld, list: string) {
  this.offline.visit.browserLanguages = list
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
});

When('the offline page is shown', function (this: OfflineWorld) {
  this.offline.page = showOfflinePage(this.offline.visit);
});

When('I press Retry', function (this: OfflineWorld) {
  this.offline.page!.pressRetry();
});

When('the connection comes back', function (this: OfflineWorld) {
  this.offline.page!.comeOnline();
});

Then('the offline page is in {string}', function (this: OfflineWorld, locale: string) {
  assert.equal(this.offline.page?.lang, locale);
});

Then(
  'it shows the {string} texts for the offline title, description and Retry button',
  function (this: OfflineWorld, locale: string) {
    const dict = DICTIONARIES[locale as Locale];
    const page = this.offline.page!;
    assert.equal(page.title, dict['offline.title']);
    assert.equal(page.description, dict['offline.description']);
    assert.equal(page.retry, dict['offline.retry']);
  },
);

Then(
  'the offline page contains the {string}, {string} and {string} texts of every interface language',
  function (this: OfflineWorld, title: string, description: string, retry: string) {
    const keys = [title, description, retry];
    const messages = offlinePageMessages();
    assert.deepEqual(Object.keys(messages).sort(), [...SUPPORTED_LOCALES].sort());
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of keys) {
        const expected = DICTIONARIES[locale][key as TranslationKey];
        assert.ok(expected, `${key} missing from messages/${locale}.ts`);
        assert.equal(messages[locale][key], expected, `${locale} ${key}`);
      }
    }
  },
);

Then('the browser reloads the page', function (this: OfflineWorld) {
  assert.equal(this.offline.page?.reloads, 1);
});
