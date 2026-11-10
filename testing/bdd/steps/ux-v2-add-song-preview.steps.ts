// Story 6.1.31 / G8.2 (#415) — docs/testing/ux-v2-add-song-preview.feature
// Source-level checks; the rendered preview is covered by
// testing/unit/tests/songs/chordPreview.test.tsx and the journey by
// e2e/tests/ux-v2-add-song-preview.spec.ts.
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

interface World {
  source: string;
}

const root = path.resolve(__dirname, '../../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

Given('the Add Song chord preview', function (this: World) {
  this.source = read('components/song/ChordPreview.tsx');
});

Then('it renders through the song page renderer so output matches the song page', function (this: World) {
  assert.match(this.source, /import SongDisplay from '@\/components\/song\/SongDisplay'/);
  assert.match(this.source, /<SongDisplay[\s\S]*?content=\{content\}/);
});

Then('the preview follows typing after a short debounce', function () {
  const form = read('components/song/SongForm.tsx');
  assert.match(form, /useDebouncedValue\(/);
  assert.match(form, /<ChordPreview content=\{previewContent\}/);
});

Then('an empty preview explains itself in every language', function () {
  for (const locale of SUPPORTED_LOCALES) {
    assert.ok(DICTIONARIES[locale]['songForm.preview.empty']?.trim(), `${locale}: songForm.preview.empty`);
  }
});

Given('the Add Song form with lyrics tools', function (this: World) {
  this.source = read('components/song/SongForm.tsx');
});

Then('a Preview toggle and an Upload .cho \\/ .txt button follow the lyrics field', function (this: World) {
  const editor = this.source.indexOf('<ChordProEditor');
  const toggle = this.source.indexOf("t('songForm.preview.toggle')");
  const upload = this.source.indexOf("t('songForm.upload.toggle')");
  assert.ok(editor > 0 && toggle > editor, 'Preview toggle after the editor');
  assert.ok(upload > toggle, 'Upload button after the Preview toggle');
  assert.match(this.source, /aria-pressed=\{showPreview\}/);
  assert.match(this.source, /accept="\.cho,\.txt,\.pro,\.chordpro"/);
});

Then('both controls are at least 44 px tall', function (this: World) {
  const start = this.source.indexOf('data-testid="lyrics-tools"');
  const bar = this.source.slice(start, this.source.indexOf('<input', start));
  assert.equal(bar.match(/<Button\b/g)?.length, 2);
  assert.doesNotMatch(bar, /size="icon"|\bh-\d|\bh-\[/);
  // Button's default size is min-h-tap (components/ui/button.tsx), so no override may shrink it.
  assert.match(read('components/ui/button.tsx'), /default: "min-h-tap/);
});

Then('they sit side by side in two equal columns and long labels wrap inside the button', function (this: World) {
  const start = this.source.indexOf('data-testid="lyrics-tools"');
  const bar = this.source.slice(start, this.source.indexOf('<input', start));
  assert.match(bar, /className="grid grid-cols-2 gap-2"/);
  assert.equal(bar.match(/min-w-0 whitespace-normal text-center/g)?.length, 2);
});

Then('Upload refuses files above 512 KB and reads UTF-8 with a Windows-1252 fallback', function (this: World) {
  assert.match(this.source, /MAX_UPLOAD_BYTES = 512 \* 1024/);
  assert.match(this.source, /file\.size > MAX_UPLOAD_BYTES/);
  assert.match(this.source, /new TextDecoder\('utf-8', \{ fatal: true \}\)/);
  assert.match(this.source, /new TextDecoder\('windows-1252'\)/);
  for (const locale of SUPPORTED_LOCALES) {
    assert.ok(DICTIONARIES[locale]['songForm.upload.tooLarge']?.trim(), `${locale}: songForm.upload.tooLarge`);
  }
});

Then('the preview takes the place of the editor at the same height so nothing jumps', function (this: World) {
  assert.match(this.source, /data-testid="lyrics-box"[\s\S]*?h-\[400px\]/);
  assert.match(this.source, /showPreview \? 'hidden'/);
});

Then('the melody notation section stays hidden behind its switch', function (this: World) {
  assert.match(this.source, /FEATURES\.melodyNotation &&/);
});
