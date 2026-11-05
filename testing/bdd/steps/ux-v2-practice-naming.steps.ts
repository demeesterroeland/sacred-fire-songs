// Story 6.1.14 / G4.1 (#398) — docs/testing/ux-v2-practice-naming.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import en from '../../../messages/en';
import nl from '../../../messages/nl';
import es from '../../../messages/es';
import it from '../../../messages/it';
import ru from '../../../messages/ru';
import qu from '../../../messages/qu';
import fr from '../../../messages/fr';
import pt from '../../../messages/pt';

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');
const locales: Record<string, Record<string, string>> = { en, nl, es, it, ru, qu, fr, pt };
const REMOVED = [
  'song.recordings',
  'song.technical.recording',
  'rehearsal.title',
  'rehearsal.tab.reference',
  'rehearsal.tab.recordings',
  'rehearsal.tab.voiceRecorder',
  'rehearsal.recordings.yourRecordings',
  'rehearsal.guest.title',
  'practice.guest.title',
  'rehearsal.reference.tracks',
  'miniPlayer.source.userRecordings',
];

Given('a member on a song page', function () {
  assert.ok(read('app/songs/[id]/page.tsx').includes('t('), 'the song page is translated');
});

When('they open the song menu, the Practice drawer and the Library', function () {
  // Static check: the three surfaces resolve their labels through the Practice keys.
});

Then('the feature is called {string} in every place', function (name: string) {
  assert.equal(en['practice.title' as keyof typeof en], name);
  assert.ok(read('app/songs/[id]/page.tsx').includes("t('practice.title')"), 'song menu');
  assert.ok(read('components/song/RehearsalDrawer.tsx').includes("t('practice.title')"), 'drawer');
  assert.equal(en['librarySummary.recordings.title' as keyof typeof en], 'Your takes');
});

Then('the tabs read {string} and {string}', function (listen: string, record: string) {
  assert.equal(en['practice.tab.listen' as keyof typeof en], listen);
  assert.equal(en['practice.tab.record' as keyof typeof en], record);
});

Given('the English messages', function () {
  assert.ok(Object.keys(en).length > 100);
});

Then('the list heading reads {string}', (v: string) => assert.equal((en as Record<string, string>)['practice.takes.mine'], v));
Then('the song badge reads {string}', (v: string) => assert.equal((en as Record<string, string>)['song.technical.takes'], v));
Then('the smart playlist reads {string}', (v: string) => assert.equal((en as Record<string, string>)['librarySummary.recordings.title'], v));
Then('the guest card reads {string}', (v: string) => assert.equal((en as Record<string, string>)['guestGate.recorder.title'], v));

Given('every supported locale', function () {
  assert.equal(Object.keys(locales).length, 8);
});

Then('none defines the superseded rehearsal, recordings or voice recorder keys', function () {
  for (const [loc, d] of Object.entries(locales)) {
    for (const key of REMOVED) assert.ok(!(key in d), `${loc} still defines ${key}`);
  }
});

Then('no English string contains {string}, {string}, {string} or {string}', function (a: string, b: string, c: string, d: string) {
  for (const [key, value] of Object.entries(en as Record<string, string>)) {
    for (const name of [a, b, c, d]) assert.ok(!value.includes(name), `${key} contains ${name}`);
  }
});

Then('the save button reads {string}', (v: string) => assert.equal((en as Record<string, string>)['recorder.btn.save'], v));
Then('the delete confirmation reads {string}', (v: string) =>
  assert.equal((en as Record<string, string>)['rehearsal.recording.delete.confirmTitle'], v),
);
Then('the shared-take e-mail subject mentions a practice take', function () {
  assert.match((en as Record<string, string>)['email.recordingShared.subject'], /practice take/);
});
Then('the mini-player source groups are headed by the Listen tab and the My takes list', function () {
  const drawer = read('components/song/RehearsalDrawer.tsx');
  assert.ok(!drawer.includes("t('rehearsal.reference.tracks')"), 'old Reference Tracks heading');
  assert.match(drawer, /DropdownMenuLabel[^>]*>\{t\('practice\.tab\.listen'\)\}/);
  assert.match(drawer, /DropdownMenuLabel>\{t\('practice\.takes\.mine'\)\}/);
});
