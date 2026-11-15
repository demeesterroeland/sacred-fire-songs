// Story 6.1.35 (#485), group 3 — docs/testing/ux-v2-sober-practice.feature (@unit scenarios). The @e2e scenario is
// covered by the axe colour-contrast runs in e2e/tests/ux-v2-a11y-audit.spec.ts (Practice drawer, singer dialog).
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const source = new WeakMap<object, string>();

Given('the Practice drawer source', function (this: object) {
  source.set(this, read('components/song/RehearsalDrawer.tsx'));
});

Given('the singer attribution dialog source', function (this: object) {
  source.set(this, read('components/song/RecordingAttributionModal.tsx'));
});

Then('it uses no palette classes', function (this: object) {
  assert.equal(countPaletteClasses(source.get(this)!), 0);
});

Then('the accent fill is only on what is playing', function (this: object) {
  const src = source.get(this)!;
  // Two accent fills: the play button of the take that is playing, and the mini player's play/pause.
  const fills = src.match(/(?<![\w:-])bg-accent(?![\w-])/g) ?? [];
  assert.equal(fills.length, 2, 'two accent fills');
  assert.match(src, /:\s*isPlaying\s*\?\s*"bg-accent text-on-accent[^"]*"\s*:\s*"bg-surface-2 text-fg/, 'take: accent only while playing');
  assert.match(src, /data-testid="mini-play-pause-btn"[\s\S]{0,300}?className="[^"]*\bbg-accent\b/, 'mini player play/pause');
  // The soft accent marks only the deep-linked take.
  assert.equal((src.match(/bg-accent-soft/g) ?? []).length, 1);
  assert.match(src, /isHighlighted\s*\?\s*"bg-accent-soft ring-2 ring-accent"/);
});

Then('the overlay uses the scrim token', function (this: object) {
  assert.match(source.get(this)!, /fixed inset-0 bg-scrim/);
});

Then('Save is the only primary button', function (this: object) {
  const src = source.get(this)!;
  assert.equal((src.match(/variant="primary"/g) ?? []).length, 1);
  assert.match(src, /variant="primary"[^>]*>[\s\S]{0,200}recording\.attribution\.saveButton/);
  assert.doesNotMatch(src, /(?<![\w-])(?:bg|text)-accent(?![\w-])/, 'no hand-made accent buttons');
});

Then('the control that clears the chosen singer has a translated name in every locale', function (this: object) {
  assert.match(source.get(this)!, /aria-label=\{t\("recording\.attribution\.clearSinger"\)\}/);
  for (const l of SUPPORTED_LOCALES) {
    assert.ok((DICTIONARIES[l] as Record<string, string>)['recording.attribution.clearSinger'], l);
  }
});
