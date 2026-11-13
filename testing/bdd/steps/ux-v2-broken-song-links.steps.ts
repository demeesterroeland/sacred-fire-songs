// #578 — docs/testing/ux-v2-broken-song-links.feature (@unit)
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isUuid } from '../../../lib/validation/uuid';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const ID_ROUTES = [
  'app/songs/[id]/page.tsx',
  'app/songs/[id]/edit/page.tsx',
  'app/users/[id]/page.tsx',
  'app/recordings/[id]/page.tsx',
  'app/library/playlists/[id]/page.tsx',
  'app/admin/users/[id]/page.tsx',
] as const;

Given('the UUID check for route parameters', function () {});

Then('{string} is not a valid UUID', function (value: string) {
  assert.equal(isUuid(value), false);
});

Then('{string} is a valid UUID', function (value: string) {
  assert.equal(isUuid(value), true);
});

Then('every [id] route renders not-found when the id is not a UUID', function () {
  for (const rel of ID_ROUTES) {
    const src = read(rel);
    assert.match(src, /\bnotFound\b/, `${rel} must call notFound()`);
    assert.match(src, /\b(isUuid|parseRecordingParam)\b/, `${rel} must guard id with isUuid or parseRecordingParam`);
  }
});

Given('the song detail page error view', function () {});

Then(
  'it renders the translated {string} and {string} copy with {string}',
  function (titleKey: string, bodyKey: string, retryKey: string) {
    const src = read('app/songs/[id]/page.tsx');
    assert.ok(src.includes(`t('${titleKey}')`), `missing ${titleKey}`);
    assert.ok(src.includes(`t('${bodyKey}')`), `missing ${bodyKey}`);
    assert.ok(src.includes(`t('${retryKey}')`), `missing ${retryKey}`);
  },
);

Then('it logs the error to the console without rendering songError.message', function () {
  const src = read('app/songs/[id]/page.tsx');
  assert.match(src, /console\.(warn|error)\([^)]*songError/);
  assert.doesNotMatch(src, /songError[^;\n]*\.message/);
});
