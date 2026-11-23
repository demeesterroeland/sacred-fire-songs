// Story 6.1.35 (#485) — docs/testing/ux-v2-sober-colours.feature (@unit scenarios)
import { Given, Then } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TagPill } from '../../../components/ui/TagPill';
import { AuthorPill } from '../../../components/ui/AuthorPill';
import { countPaletteClasses, PALETTE_DIRS, paletteUsage } from '../../../lib/design/paletteAudit';

const ROOT = path.resolve(__dirname, '../../..');
const classOf = (html: string) => html.match(/class="([^"]*)"/)?.[1] ?? '';

interface World {
  pills: string[];
}
const state = new WeakMap<object, World>();
const get = (w: object): World => state.get(w) ?? (state.set(w, { pills: [] }), state.get(w)!);

Given(
  'tag pills for the categories {string}, {string}, {string} and {string}',
  function (this: object, a: string, b: string, c: string, d: string) {
    get(this).pills = [a, b, c, d].map((slug) => renderToStaticMarkup(createElement(TagPill, { label: slug })));
  },
);

Then('every tag uses the same neutral tag style', function (this: object) {
  const classes = new Set(get(this).pills.map(classOf));
  assert.equal(classes.size, 1, `one style for all tags: ${[...classes].join(' | ')}`);
  assert.match([...classes][0], /\bbg-chip\b/);
  assert.match([...classes][0], /\btext-on-chip\b/);
});

Then('no tag has its own category colour', function (this: object) {
  for (const html of get(this).pills) assert.equal(countPaletteClasses(html), 0, html);
});

Given('a selected tag pill and an unselected tag pill', function (this: object) {
  const pill = (selected: boolean) =>
    renderToStaticMarkup(createElement(TagPill, { label: 'Fire', variant: 'selectable', selected, onClick: () => {} }));
  get(this).pills = [pill(true), pill(false)];
});

Then('the selected tag uses the selected chip tokens', function (this: object) {
  const cls = classOf(get(this).pills[0]);
  assert.match(cls, /\bbg-chip-active\b/);
  assert.match(cls, /\btext-on-chip-active\b/);
  assert.equal(countPaletteClasses(cls), 0);
});

Then('the selected tag has a check and is announced as pressed', function (this: object) {
  const html = get(this).pills[0];
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /lucide-check/);
});

Then('the unselected tag is not announced as pressed', function (this: object) {
  assert.match(get(this).pills[1], /aria-pressed="false"/);
});

Given('an author pill and a tag pill', function (this: object) {
  get(this).pills = [
    renderToStaticMarkup(createElement(AuthorPill, { author: 'A. Singer' })),
    renderToStaticMarkup(createElement(TagPill, { label: 'Fire' })),
  ];
});

Then('both use the same neutral tag style', function (this: object) {
  const [author, tag] = get(this).pills.map(classOf);
  assert.equal(author, tag);
});

Then('these files use no palette classes:', function (table: DataTable) {
  for (const { file } of table.hashes()) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.equal(countPaletteClasses(src), 0, `${file} has palette classes`);
  }
});

Then('no file gives a category its own colour', function () {
  assert.equal(fs.existsSync(path.join(ROOT, 'lib/uiUtils.ts')), false, 'lib/uiUtils.ts (category colour map) is gone');
  assert.equal(fs.existsSync(path.join(ROOT, 'components/library/LibrarySidebar.tsx')), false, 'unused coloured sidebar is gone');
});

Given('the palette audit', function () {});

Then('it counts palette classes in app\\/, components\\/ and lib\\/', function () {
  assert.deepEqual([...PALETTE_DIRS], ['app', 'components', 'lib']);
  // A palette class in a lib/ file must show up in the usage map.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'palette-bdd-'));
  try {
    for (const dir of PALETTE_DIRS) fs.mkdirSync(path.join(root, dir));
    fs.writeFileSync(path.join(root, 'lib', 'colours.ts'), "export const c = 'bg-red-500';");
    assert.deepEqual(paletteUsage(root), { [path.join('lib', 'colours.ts')]: 1 });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
