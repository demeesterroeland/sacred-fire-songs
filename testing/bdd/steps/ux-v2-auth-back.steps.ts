// Story 6.1.25 / G5.4 (#409) — docs/testing/ux-v2-auth-back.feature
// Source-level checks; rendered behaviour is in testing/unit/tests/auth/*.test.ts(x)
// and the journey in e2e/tests/ux-v2-auth-back.spec.ts.
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { authBackHref } from '../../../lib/auth/authBack';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';

interface World {
  sources: Record<string, string>;
  next: string | null;
}

const root = path.resolve(__dirname, '../../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

Given('the login and sign-up forms', function (this: World) {
  this.sources = {
    login: read('components/login-form.tsx'),
    signUp: read('components/sign-up-form.tsx'),
  };
});

Then('neither has a close button that leaves for Home', function (this: World) {
  for (const [name, source] of Object.entries(this.sources)) {
    assert.doesNotMatch(source, /router\.push\(\s*['"]\/['"]\s*\)/, `${name}: no router.push('/')`);
    assert.doesNotMatch(source, /<X\b/, `${name}: no X icon`);
    assert.doesNotMatch(source, /import \{[^}]*\bX\b[^}]*\} from "lucide-react"/, `${name}: X icon not imported`);
  }
});

Then('both use design tokens only', function (this: World) {
  for (const [name, source] of Object.entries(this.sources)) {
    assert.equal(countPaletteClasses(source), 0, `${name}: no palette colour classes`);
  }
});

Given('the auth pages Back link', function (this: World) {
  this.sources = {
    login: read('app/auth/login/page.tsx'),
    signUp: read('app/auth/sign-up/page.tsx'),
    back: read('components/common/BackButton.tsx'),
  };
  assert.match(this.sources.login, /<BackButton href=\{authBackHref\(searchParams\.next\)\}[^>]*\/>/);
  assert.match(this.sources.signUp, /<BackButton href=\{authBackHref\(searchParams\.next\)\}[^>]*\/>/);
  assert.doesNotMatch(this.sources.back, /href = '\/'/, 'no silent default to Home');
});

When('the next target is {string}', function (this: World, next: string) {
  this.next = next.replace(/\\\//g, '/');
});

Then('Back leads to {string}', function (this: World, expected: string) {
  assert.equal(authBackHref(this.next), expected.replace(/\\\//g, '/'));
});

Then('without a next target Back leads Home', function () {
  assert.equal(authBackHref(null), '/');
  assert.equal(authBackHref(undefined), '/');
});

Then('a hostile or auth-page next target leads Home', function () {
  for (const next of ['//evil.example', 'https://evil.example', '/auth/login', '/auth/sign-up?next=%2Fx']) {
    assert.equal(authBackHref(next), '/', next);
  }
});

Given('the forgot-password page', function (this: World) {
  this.sources = { forgot: read('app/auth/forgot-password/page.tsx') };
});

Then('its Back link and its sign-in link return to login with the same next target', function (this: World) {
  const source = this.sources.forgot;
  assert.match(source, /<BackButton href=\{loginHref\}[^>]*\/>/);
  assert.match(source, /<Link href=\{loginHref\}/);
  assert.match(source, /authPageHref\('login', \{ next:/);
});
