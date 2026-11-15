// Story 6.1.4 / G1.4 (#388) — docs/testing/ux-v2-calm-categories.feature
// Checks the component source: the grid is client-rendered from Supabase data, so the
// rendered checks live in the RTL test (testing/unit/tests/home/categoryGrid.test.tsx).
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';

interface World {
  source: string;
}

Given('the home page category grid', function (this: World) {
  this.source = fs.readFileSync(path.resolve(__dirname, '../../../components/home/CategoryGrid.tsx'), 'utf8');
});

Then('categories use only greyscale colours except the pressed state', function (this: World) {
  assert.equal(countPaletteClasses(this.source), 0, 'no palette colour classes');
  const accents = this.source.match(/[\w:-]*(?:text|bg|border)-accent\b/g) ?? [];
  for (const cls of accents) {
    assert.match(cls, /^(active|group-active|focus-visible):/, `accent only when pressed: ${cls}`);
  }
});

// Source-level guard (literal classNames); the rendered check is the RTL test.
Then('every category link is at least 44 px tall', function (this: World) {
  const links = this.source.match(/<(Link|button)\b[\s\S]*?className=\{?[`"][^`"]*[`"]/g) ?? [];
  assert.ok(links.length >= 3, 'category, tag and more links found');
  for (const link of links) assert.match(link, /min-h-tap/, link.slice(0, 60));
});

Then('the tags are text links with a grey count, not coloured chips', function (this: World) {
  assert.doesNotMatch(this.source, /TagPill/);
  assert.match(this.source, /data-testid="tag-count" className="[^"]*text-fg-subtle/);
});
