// Story 6.1.1 / G1.1 (#385) — docs/testing/ux-v2-design-system.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  MIN_FONT_PX,
  accentLikeTokens,
  contrastChecks,
  docMismatches,
  fontSizesPx,
  loadTokenSources,
  missingThemeReferences,
  type TokenSources,
} from '../../../lib/design/tokenAudit';
import { smallTextUsage } from '../../../lib/design/paletteAudit';

const state = new WeakMap<object, { s?: TokenSources }>();
const get = (w: object) => {
  if (!state.has(w)) state.set(w, {});
  return state.get(w)!;
};

Given('the design tokens file in docs\\/design', function (this: object) {
  get(this).s = loadTokenSources();
  assert.ok(Object.keys(get(this).s!.docLight).length > 30, 'docs/design/design-tokens.md lists the tokens');
});

When('the Tailwind theme is loaded', function (this: object) {
  assert.ok(Object.keys(get(this).s!.theme).length > 20, 'app/globals.css has an @theme inline map');
});

Then('every colour, font size and spacing value in the theme exists in the tokens file', function (this: object) {
  const s = get(this).s!;
  assert.deepEqual(missingThemeReferences(s), []);
  assert.deepEqual(docMismatches(s), []);
});

Then('exactly one accent colour is defined', function (this: object) {
  const s = get(this).s!;
  for (const map of [s.light, s.dark]) {
    assert.deepEqual(accentLikeTokens(map).filter((k) => k !== '--danger'), ['--accent']);
  }
});

Given('any component in the component sheet', function (this: object) {
  get(this).s = loadTokenSources();
});

Then('its smallest text style is at least {int} px', function (this: object, px: number) {
  assert.equal(px, MIN_FONT_PX);
  assert.deepEqual(smallTextUsage(['components/ui']), {}, 'no sub-12 px text in components/ui');
  const sizes = Object.values(fontSizesPx(get(this).s!.light));
  assert.ok(Math.min(...sizes) >= px, `smallest token font size ${Math.min(...sizes)} px`);
});

Then('body text contrast against its background is at least {float}:1', function (this: object, min: number) {
  const textPairs = contrastChecks(get(this).s!).filter((c) => c.min >= min);
  assert.ok(textPairs.length >= 20, 'text/background pairs are checked in both modes');
  assert.deepEqual(textPairs.filter((c) => c.ratio < min), []);
  const sizes = Object.values(fontSizesPx(get(this).s!.light));
  assert.ok(sizes.length >= 5);
});
