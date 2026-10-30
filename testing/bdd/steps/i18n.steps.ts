import { Before, Given, When, Then } from '@cucumber/cucumber';
import type { World } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import en from '@/messages/en';
import nl from '@/messages/nl';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  interpolate,
  readCookie,
  resolveLocale,
  resolveRequestLocale,
  setLocale,
  t,
  translateFrom,
  tWithLocale,
  type InterpolationParams,
  type Locale,
  type TranslationKey,
} from '@/lib/i18n';
import { persistLocale, readPersistedLocale, syncLocaleOnMount } from '@/lib/i18n/persistence';
import {
  fakeLocaleEnvironment,
  type FakeLocaleEnvironment,
  type FakeLocaleEnvironmentInit,
} from '../../support/fakeLocaleEnvironment';

// Scenario state for docs/testing/i18n.feature, kept off the shared SongBddWorld.
interface I18nState {
  envInit: FakeLocaleEnvironmentInit;
  env?: FakeLocaleEnvironment;
  acceptLanguage?: string;
  requestCookie?: string;
  resolved?: Locale;
  enDict: Record<string, string>;
  nlDict: Record<string, string>;
  text?: string;
}
type I18nWorld = World & { i18n: I18nState };

const parseList = (list: string) =>
  list
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** "count=3, name=Ana" → { count: '3', name: 'Ana' } */
const parseParams = (raw: string): InterpolationParams =>
  Object.fromEntries(parseList(raw).map((pair) => pair.split('=').map((s) => s.trim()) as [string, string]));

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const env = (w: I18nWorld) => (w.i18n.env ??= fakeLocaleEnvironment(w.i18n.envInit));

Before({ tags: '@i18n' }, function (this: I18nWorld) {
  this.i18n = { envInit: {}, enDict: {}, nlDict: {} };
  setLocale(DEFAULT_LOCALE);
});

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given('the supported interface languages are {string} and {string}', function (a: string, b: string) {
  assert.deepEqual([...SUPPORTED_LOCALES].sort(), [a, b].sort());
});

Given('the default interface language is {string}', function (locale: string) {
  assert.equal(DEFAULT_LOCALE, locale);
});

// ---------------------------------------------------------------------------
// Rule: explicit choice > browser language > English
// ---------------------------------------------------------------------------

Given('no language has been chosen', function (this: I18nWorld) {
  this.i18n.envInit.stored = null;
  this.i18n.envInit.cookie = '';
});

Given('the browser prefers the languages {string}', function (this: I18nWorld, list: string) {
  this.i18n.envInit.languages = parseList(list);
});

Given('the stored language is {string}', function (this: I18nWorld, stored: string) {
  this.i18n.envInit.stored = stored;
});

Given('the locale cookie is {string}', function (this: I18nWorld, value: string) {
  this.i18n.requestCookie = value;
  this.i18n.envInit.cookie = value ? `other=1; ${LOCALE_COOKIE}=${value}` : '';
});

Given('there is no locale cookie', function (this: I18nWorld) {
  this.i18n.envInit.cookie = '';
});

Given('no locale cookie is sent', function (this: I18nWorld) {
  this.i18n.requestCookie = undefined;
});

Given('the request header Accept-Language is {string}', function (this: I18nWorld, header: string) {
  this.i18n.acceptLanguage = header;
});

Given('localStorage is unavailable', function (this: I18nWorld) {
  this.i18n.envInit.storageBlocked = true;
});

When('the interface language is resolved', function (this: I18nWorld) {
  const { stored, cookie, languages } = this.i18n.envInit;
  this.i18n.resolved = resolveLocale({ stored, cookie: readCookie(cookie ?? '', LOCALE_COOKIE), browserLanguages: languages });
});

When('the interface language is resolved in the browser', function (this: I18nWorld) {
  this.i18n.resolved = readPersistedLocale(env(this));
});

When('the server resolves the interface language', function (this: I18nWorld) {
  this.i18n.resolved = resolveRequestLocale(this.i18n.requestCookie, this.i18n.acceptLanguage);
});

Then('the interface language is {string}', function (this: I18nWorld, locale: string) {
  assert.equal(this.i18n.resolved, locale);
});

// ---------------------------------------------------------------------------
// Rule: persistence in localStorage + cookie
// ---------------------------------------------------------------------------

When('the visitor chooses the language {string}', function (this: I18nWorld, locale: Locale) {
  persistLocale(env(this), locale);
});

When('the page is reloaded', function (this: I18nWorld) {
  // A reload keeps localStorage and cookies but starts a fresh document.
  const before = env(this);
  const cookie = before.cookieWrites.at(-1)?.split(';')[0] ?? this.i18n.envInit.cookie;
  this.i18n.env = fakeLocaleEnvironment({
    ...this.i18n.envInit,
    stored: before.store.get(LOCALE_STORAGE_KEY) ?? null,
    cookie,
  });
  this.i18n.resolved = readPersistedLocale(this.i18n.env);
});

When('the app mounts in the browser', function (this: I18nWorld) {
  this.i18n.resolved = syncLocaleOnMount(env(this));
});

Then('localStorage key {string} holds {string}', function (this: I18nWorld, key: string, value: string) {
  assert.equal(env(this).store.get(key), value);
});

Then(
  'the locale cookie is set to {string} for one year on path {string}',
  function (this: I18nWorld, value: string, path: string) {
    const cookie = env(this).cookieWrites.at(-1);
    assert.ok(cookie, 'expected a cookie to be written');
    assert.ok(cookie.startsWith(`${LOCALE_COOKIE}=${value};`), cookie);
    assert.ok(cookie.includes(`Path=${path}`), cookie);
    assert.ok(cookie.includes(`Max-Age=${60 * 60 * 24 * 365}`), cookie);
  }
);

Then('the html lang attribute is {string}', function (this: I18nWorld, lang: string) {
  assert.equal(env(this).document.documentElement.lang, lang);
});

Then('no locale cookie is written', function (this: I18nWorld) {
  assert.deepEqual(env(this).cookieWrites, []);
});

Then('nothing is stored in localStorage', function (this: I18nWorld) {
  assert.equal(env(this).store.size, 0);
});

// ---------------------------------------------------------------------------
// Rule: translation, fallback and interpolation
// ---------------------------------------------------------------------------

Given('the interface language is set to {string}', function (locale: Locale) {
  setLocale(locale);
});

Then('the key {string} translates to {string}', function (key: string, expected: string) {
  assert.equal(t(key as TranslationKey), expected);
});

Then(
  'with an explicit locale {string} the key {string} still translates to {string}',
  function (locale: Locale, key: string, expected: string) {
    assert.equal(tWithLocale(locale, key as TranslationKey), expected);
  }
);

Given('an English dictionary where {string} is {string}', function (this: I18nWorld, key: string, value: string) {
  this.i18n.enDict[key] = value;
});

Given('a Dutch dictionary without {string}', function (this: I18nWorld, key: string) {
  delete this.i18n.nlDict[key];
});

Given('a Dutch dictionary where {string} is {string}', function (this: I18nWorld, key: string, value: string) {
  this.i18n.nlDict[key] = value;
});

When('{string} is translated with the Dutch dictionary active', function (this: I18nWorld, key: string) {
  this.i18n.text = translateFrom(this.i18n.nlDict, this.i18n.enDict, key);
});

When('the unknown key {string} is translated', function (this: I18nWorld, key: string) {
  this.i18n.text = t(key as TranslationKey);
});

When('the template {string} is interpolated with {string}', function (this: I18nWorld, template: string, raw: string) {
  this.i18n.text = interpolate(template, parseParams(raw));
});

When('the key {string} is translated with {string}', function (this: I18nWorld, key: string, raw: string) {
  this.i18n.text = t(key as TranslationKey, parseParams(raw));
});

Then('the text is {string}', function (this: I18nWorld, expected: string) {
  assert.equal(this.i18n.text, expected);
});

Then('the text contains {string}', function (this: I18nWorld, part: string) {
  assert.ok(this.i18n.text?.includes(part), `"${this.i18n.text}" should contain "${part}"`);
});

Then('the text does not contain {string}', function (this: I18nWorld, part: string) {
  assert.ok(!this.i18n.text?.includes(part), `"${this.i18n.text}" should not contain "${part}"`);
});

// ---------------------------------------------------------------------------
// Rule: dictionaries stay in sync
// ---------------------------------------------------------------------------

const dictionaries: Record<string, Partial<Record<TranslationKey, string>>> = { en, nl };

Then(
  'the {string} dictionary has exactly the keys of the {string} dictionary',
  function (locale: string, source: string) {
    assert.deepEqual(Object.keys(dictionaries[locale]).sort(), Object.keys(dictionaries[source]).sort());
  }
);

Then('every {string} translation uses the same placeholders as its English source', function (locale: string) {
  for (const key of Object.keys(en) as TranslationKey[]) {
    assert.deepEqual(placeholders(dictionaries[locale][key] ?? ''), placeholders(en[key]), key);
  }
});

Then('no translation in any dictionary is empty', function () {
  for (const [locale, dict] of Object.entries(dictionaries)) {
    for (const [key, value] of Object.entries(dict)) {
      assert.ok(typeof value === 'string' && value.trim() !== '', `${locale}:${key} is empty`);
    }
  }
});
