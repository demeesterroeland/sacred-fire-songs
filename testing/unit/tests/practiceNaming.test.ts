// Story 6.1.14 / G4.1 (#398): one name — "Practice" — for the rehearsal feature.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const root = process.cwd();
const src = (rel: string) => readFileSync(join(root, rel), 'utf8');
const dict = (locale: string) => DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;

const NEW_KEYS = [
  'practice.title',
  'practice.tab.listen',
  'practice.tab.record',
  'practice.takes.mine',
  'song.technical.takes',
] as const;

const REMOVED_KEYS = [
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
] as const;

// User-visible copy where the audio item is a noun: "take", never "recording" (UXA-008).
const TAKE_NOUN_KEYS = [
  'miniPlayer.source.userRecording',
  'recorder.btn.save',
  'recorder.preview',
  'recorder.name.placeholder',
  'recorder.state.stopped',
  'recorder.save.success',
  'rehearsal.recording.delete.confirmTitle',
  'rehearsal.recording.delete.success',
  'recording.sharing.title',
  'recording.sharing.privateSongPrompt.body',
  'recording.publish.title',
  'recording.publish.confirmButton',
  'email.recordingShared.subject',
  'email.recordingShared.body',
  'email.recordingShared.cta',
  'feedback.notFound.recording.title',
] as const;

describe('Practice naming (en)', () => {
  const en = dict('en');

  it('names the feature, tabs, list, badge, smart playlist and guest card', () => {
    expect(en['practice.title']).toBe('Practice');
    expect(en['practice.tab.listen']).toBe('Listen');
    expect(en['practice.tab.record']).toBe('Record');
    expect(en['practice.takes.mine']).toBe('My takes');
    expect(en['song.technical.takes']).toBe('Takes');
    expect(en['librarySummary.recordings.title']).toBe('Your takes');
    expect(en['guestGate.recorder.title']).toBe('Sign in to record');
    expect(en['miniPlayer.expand']).toBe('Expand Practice');
  });

  it('uses \"take\" for the audio item in every rename-listed string', () => {
    for (const key of TAKE_NOUN_KEYS) {
      expect(en[key], key).toMatch(/take/i);
      expect(en[key].replace(/\{[^}]+\}/g, ''), key).not.toMatch(/recording|rehearsal/i);
    }
    expect(en['miniPlayer.source.userRecording']).toBe('My take');
    expect(en['recorder.btn.save']).toBe('Save Take');
    expect(en['rehearsal.recording.delete.confirmTitle']).toBe('Delete take?');
    expect(en['recording.sharing.privateSongPrompt.effectTake']).toContain('take');
  });

  it('keeps none of the six legacy names in any English string', () => {
    const legacy = ['Rehearsal Space', 'Voice Recorder', 'Your Recordings', 'My Recordings', 'Personal Audio Recorder'];
    for (const [key, value] of Object.entries(en)) {
      for (const name of legacy) expect(value, key).not.toContain(name);
    }
  });
});

describe.each([...SUPPORTED_LOCALES])('Practice naming (%s)', (locale) => {
  const d = dict(locale);

  it('defines every new key with a non-empty string', () => {
    for (const key of NEW_KEYS) expect(d[key], key).toBeTruthy();
  });

  it('has removed the superseded keys', () => {
    for (const key of REMOVED_KEYS) expect(Object.keys(d), key).not.toContain(key);
  });

  it('has no \"Rehearsal\" in the shared-take email (practice, not rehearsal)', () => {
    expect(d['email.recordingShared.subject']).not.toMatch(/rehearsal/i);
  });

  if (locale !== 'en') {
    it('translates the new names instead of copying English', () => {
      for (const key of ['practice.title', 'practice.tab.listen', 'practice.tab.record', 'practice.takes.mine'] as const) {
        expect(d[key], key).not.toBe(dict('en')[key]);
      }
    });
  }
});

describe('Practice naming (usage)', () => {
  it('uses practice.title in the drawer and the song menu', () => {
    expect(src('components/song/RehearsalDrawer.tsx')).toContain("t('practice.title')");
    expect(src('app/songs/[id]/page.tsx')).toContain("t('practice.title')");
  });

  it('labels the drawer tabs Listen and Record', () => {
    const drawer = src('components/song/RehearsalDrawer.tsx');
    expect(drawer).toContain("t('practice.tab.listen')");
    expect(drawer).toContain("t('practice.tab.record')");
  });
});

describe('Practice naming (locale details)', () => {
  it('ru uses дубль for takes', () => {
    expect(dict('ru')['practice.takes.mine']).toBe('Мои дубли');
  });

  it('qu uses one form (Tomakuna) for takes, never Tomaykuna', () => {
    for (const [key, value] of Object.entries(dict('qu'))) expect(value, key).not.toMatch(/Tomaykuna/i);
    expect(dict('qu')['practice.takes.mine']).toBe('Tomakuna');
  });

  it('every locale heads the mini-player source groups with the tab and list names', () => {
    const drawer = src('components/song/RehearsalDrawer.tsx');
    expect(drawer).not.toContain("t('rehearsal.reference.tracks')");
    expect(drawer).not.toContain("t('miniPlayer.source.userRecordings')");
    expect(drawer).toMatch(/DropdownMenuLabel[^>]*>\{t\('practice\.tab\.listen'\)\}/);
  });

  it('draws the Practice count pill and the filter count pill at 12 px (text-caption)', () => {
    expect(src('app/songs/[id]/page.tsx')).not.toMatch(/bg-indigo-600\/20 text-\[10px\]/);
    expect(src('components/library/SearchFiltersModal.tsx')).not.toMatch(/bg-gray-200 dark:bg-gray-800 text-gray-500 text-\[10px\]/);
  });
});
