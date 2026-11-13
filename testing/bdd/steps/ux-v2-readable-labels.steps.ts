// Story 6.1.3 / G1.3 (#387) — docs/testing/ux-v2-readable-labels.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { microTextHits, type MicroTextHit } from '../../../lib/design/labelAudit';
import { MIN_TEXT_CONTRAST, contrastRatio, parseCssBlock, resolveToken } from '../../../lib/design/tokens';
import en from '../../../messages/en';
import { SUPPORTED_LOCALES } from '../../../lib/i18n';

const root = path.resolve(__dirname, '..', '..', '..');
const SECTION_KEYS = [
  'explore.categories.heading',
  'library.heading',
  'playlists.publicPlaylists',
  'playlists.smartPlaylists',
  'playlists.myPrivatePlaylists',
  'recentlyViewed.section',
  'newSinceLastVisit.section',
];
const hits = new WeakMap<object, MicroTextHit[]>();

Given('the app and component sources', function () {
  /* sources are read by the scan itself */
});

When('they are scanned for font sizes below 12 px', function (this: object) {
  hits.set(this, microTextHits(root));
});

Then('no sub-12 px font size is found outside the documented allow-list', function (this: object) {
  assert.deepEqual(
    hits.get(this)!.map((h) => `${h.file}:${h.line} ${h.match}`),
    [],
  );
});

Given('the section title copy keys of the home, library and playlists pages', function () {
  /* keys listed in SECTION_KEYS */
});

Then('every English section title is sentence case', function () {
  for (const k of SECTION_KEYS) {
    const v = (en as Record<string, string>)[k];
    assert.ok(v, k);
    assert.doesNotMatch(v.slice(1), /\b[A-Z][a-z]/, `${k}: "${v}"`);
  }
});

Then('no locale writes a section title in capitals', async function () {
  for (const locale of SUPPORTED_LOCALES) {
    const m = (await import(`../../../messages/${locale}`)).default as Record<string, string>;
    for (const k of SECTION_KEYS) {
      const v = m[k];
      assert.ok(v, `${locale} ${k}`);
      assert.ok(!(v === v.toUpperCase() && /\p{L}{4}/u.test(v)), `${locale} ${k}: "${v}"`);
    }
  }
});

Given('the sober light and dark tokens', function () {
  /* read in the Then step */
});

Then(
  '{string} and {string} reach 4.5:1 on {string}, {string} and {string} in both themes',
  function (fg1: string, fg2: string, bg1: string, bg2: string, bg3: string) {
    const css = fs.readFileSync(path.join(root, 'app/styles/sober.css'), 'utf8');
    const light = parseCssBlock(css, ':root[data-style="sober"]');
    const dark = { ...light, ...parseCssBlock(css, ':root[data-style="sober"].dark') };
    for (const tokens of [light, dark]) {
      for (const fg of [fg1, fg2]) {
        for (const bg of [bg1, bg2, bg3]) {
          const ratio = contrastRatio(resolveToken(tokens, fg)!, resolveToken(tokens, bg)!);
          assert.ok(ratio >= MIN_TEXT_CONTRAST, `${fg} on ${bg}: ${ratio.toFixed(2)}`);
        }
      }
    }
  },
);
