// Story 6.1.38 (#534) — docs/testing/ux-v2-profile-role-badge.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { roleBadge, type RoleBadgeSpec } from '../../../lib/users/roleBadge';
import { DICTIONARIES, type Locale } from '../../../lib/i18n';

interface State {
  role: string;
  badge?: RoleBadgeSpec;
  label?: string;
}
const states = new WeakMap<object, State>();
const st = (w: object): State => {
  let s = states.get(w);
  if (!s) {
    s = { role: '' };
    states.set(w, s);
  }
  return s;
};

const choose = (w: object, locale: Locale) => {
  const s = st(w);
  s.badge = roleBadge(s.role || null);
  s.label = (DICTIONARIES[locale] as Record<string, string>)[s.badge.labelKey];
};

Given('a user whose role is {string}', function (this: object, role: string) {
  st(this).role = role;
});

When('the profile badge for that user is chosen', function (this: object) {
  choose(this, 'en');
});

When('the profile badge for that user is chosen in {string}', function (this: object, locale: string) {
  choose(this, locale as Locale);
});

Then('the badge shows the {string} label', function (this: object, label: string) {
  assert.equal(st(this).label, label);
});

Then('the badge shows the {string} icon', function (this: object, icon: string) {
  assert.equal(st(this).badge?.icon, icon);
});
