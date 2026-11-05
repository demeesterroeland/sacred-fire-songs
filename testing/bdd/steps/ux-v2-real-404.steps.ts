// Story 6.1.22 / G5.1 (#406) — docs/testing/ux-v2-real-404.feature
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { shouldRedirectToLogin } from '../../../lib/supabase/routeAccess';
import { tWithLocale, type Locale } from '../../../lib/i18n';

const LOCALES: Locale[] = ['en', 'nl', 'es', 'fr', 'it', 'pt', 'qu', 'ru'];
const state = new WeakMap<object, { path?: string }>();
const get = (w: object) => {
  if (!state.has(w)) state.set(w, {});
  return state.get(w)!;
};

Given('a guest opens a path that does not exist', function (this: object) {
  get(this).path = '/this-page-does-not-exist';
});

Given('a guest opens {string}', function (this: object, path: string) {
  get(this).path = path;
});

Then('the proxy does not redirect to the login page', function (this: object) {
  assert.equal(shouldRedirectToLogin(get(this).path!, false), false);
});

Then('the proxy redirects to the login page', function (this: object) {
  assert.equal(shouldRedirectToLogin(get(this).path!, false), true);
});

// Copy only: the rendered page and its HTTP behaviour are asserted in e2e/tests/real-404.spec.ts.
Then('the "Page not found" copy and a "Go home" label exist in all 8 locales', function () {
  assert.equal(tWithLocale('en', 'feedback.notFound.page.title'), 'Page not found');
  assert.equal(tWithLocale('en', 'feedback.notFound.page.home'), 'Go home');
  for (const locale of LOCALES) {
    for (const key of ['title', 'description', 'home'] as const) {
      const full = `feedback.notFound.page.${key}` as const;
      assert.notEqual(tWithLocale(locale, full), full, `${locale} ${full}`);
    }
  }
});

Given('the song and recording not-found pages', function () {
  // Pages are exercised in testing/unit/tests/notFoundPages.test.ts; copy keys are checked here.
});

Then('each uses its own title, distinct from {string}', function (genericTitle: string) {
  const generic = tWithLocale('en', 'feedback.notFound.page.title');
  assert.equal(generic, genericTitle);
  assert.notEqual(tWithLocale('en', 'feedback.notFound.title'), generic);
  assert.notEqual(tWithLocale('en', 'feedback.notFound.recording.title'), generic);
});
