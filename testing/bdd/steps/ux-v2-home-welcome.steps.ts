// Story 6.1.28 / G6.3 (#412) — docs/testing/ux-v2-home-welcome.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';
import en from '../../../messages/en';
import nl from '../../../messages/nl';
import es from '../../../messages/es';
import it from '../../../messages/it';
import ru from '../../../messages/ru';
import qu from '../../../messages/qu';
import fr from '../../../messages/fr';
import pt from '../../../messages/pt';

const root = path.resolve(__dirname, '..', '..', '..');
const KEYS = [
  'home.welcome.title',
  'home.welcome.line',
  'home.search.label',
  'home.search.placeholder',
  'home.search.submit',
  'home.recent.heading',
  'home.recent.viewAll',
] as const;

Given('the Home welcome texts', function () {
  assert.ok(en['home.welcome.line']);
});

Then('every language has a welcome line, a search field and a "Recently added" heading', function () {
  const all: Record<string, Record<string, string>> = { en, nl, es, it, ru, qu, fr, pt };
  for (const [locale, dict] of Object.entries(all)) {
    for (const key of KEYS) assert.ok(dict[key]?.trim(), `${locale} lacks ${key}`);
  }
  for (const locale of ['nl', 'es', 'it', 'ru', 'fr', 'pt']) {
    assert.notEqual(all[locale]['home.welcome.line'], en['home.welcome.line'], `${locale} welcome line is the English copy`);
  }
});

// The query is checked structurally: a recording stand-in for the PostgREST builder.
const calls: unknown[][] = [];
Given('a library with public songs and a private draft', function () {
  calls.length = 0;
});

When('the Recently added row is built', async function () {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'order', 'limit', 'eq', 'in', 'or']) {
    b[m] = (...args: unknown[]) => {
      calls.push([m, ...args]);
      return b;
    };
  }
  b.then = (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
  const { recentlyAddedQuery } = await import('../../../lib/songs/queries');
  await recentlyAddedQuery({ from: () => b } as never);
});

Then('the query asks for public songs only, newest first, at most 5', function () {
  assert.ok(calls.some((c) => c[0] === 'eq' && c[1] === 'is_public' && c[2] === true));
  assert.ok(calls.some((c) => c[0] === 'order' && c[1] === 'created_at' && (c[2] as { ascending: boolean }).ascending === false));
  assert.ok(calls.some((c) => c[0] === 'limit' && c[1] === 5));
});

let sources: string[] = [];
Given('the Home welcome block', function () {
  sources = ['HomeWelcome', 'HomeSearch', 'RecentlyAdded'].map((f) =>
    fs.readFileSync(path.join(root, 'components', 'home', `${f}.tsx`), 'utf8')
  );
});

Then('the Home welcome block uses only design tokens', function () {
  for (const s of sources) assert.equal(countPaletteClasses(s), 0);
});
