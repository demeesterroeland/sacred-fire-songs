// Story 6.2.20 / G5.3 (#523) — docs/testing/ux-v3-edit-version-meta.feature
// @unit: the real helpers the edit form uses (lib/songs/versionMeta.ts, versionUpdate.ts) and the real display code
// (technicalItems, songNoteParagraphs, formatSourceLines). The rendered form itself is covered at L3 in
// testing/unit/tests/songs/songFormVersionMeta.test.tsx. @seed: the same payload as SQL, run as the real roles.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { Given, Then, When } from '@cucumber/cucumber';
import { profileIdByEmail, queryAsAnon, queryAsUser, seedDb } from '../support/db';
import { OTHER_MEMBER_ID, SEEDED_EMAILS } from './access-policies.steps';
import { DICTIONARIES, SUPPORTED_LOCALES, translateFrom } from '../../../lib/i18n';
import { technicalItems } from '../../../lib/songs/songMeta';
import { songNoteParagraphs } from '../../../lib/songs/songNote';
import { formatSourceLines, type VersionSourceRow } from '../../../lib/songs/versionSources';
import {
  NOTE_MAX_LENGTH,
  beatsError,
  canCorrectSource,
  noteError,
  sourceFieldsForSave,
  versionMetaFieldsForSave,
} from '../../../lib/songs/versionMeta';
import { versionUpdateFields, type VersionFormValues } from '../../../lib/songs/versionUpdate';
import { EDIT_SONG_SELECT } from '../../../lib/songs/songSelect';
import { localApi } from './ux-v3-songbook-source.steps';

const t = (key: string, params?: Record<string, string | number>) =>
  translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

interface World {
  stored: { beats: string | null; song_note: string | null };
  initial: { beats: string | null; note: string | null };
  payload?: Record<string, unknown>;
  typedBeats?: string;
  typedNote?: string;
  sources?: VersionSourceRow[];
  sourceInitial?: { sourcePage: string; sourceOriginalTitle: string };
  sourcePayload?: Record<string, unknown>;
  // @seed
  songId?: string;
  versionId?: string;
  sourceId?: string;
  returned?: { beats: string | null; song_note: string | null };
}
const worlds = new WeakMap<object, World>();
const w = (world: object): World => {
  let s = worlds.get(world);
  if (!s) {
    s = { stored: { beats: null, song_note: null }, initial: { beats: null, note: null } };
    worlds.set(world, s);
  }
  return s;
};

const formValues = (s: World, over: Partial<VersionFormValues> = {}): VersionFormValues => ({
  content: '[Am]La la',
  key: '',
  capo: '',
  tuning: '',
  youtubeLink: '',
  spotifyLink: '',
  soundcloudLink: '',
  melodyNotation: '',
  beats: s.initial.beats ?? '',
  note: s.initial.note ?? '',
  ...over,
});

function setStored(world: object, beats: string | null, note: string | null) {
  const s = w(world);
  s.stored = { beats, song_note: note };
  s.initial = { beats, note };
}

/** What the database does with the payload: only the keys present are written. */
function save(world: object, values: VersionFormValues) {
  const s = w(world);
  s.payload = versionUpdateFields(values, s.initial);
  if ('beats' in s.payload) s.stored.beats = s.payload.beats as string | null;
  if ('song_note' in s.payload) s.stored.song_note = s.payload.song_note as string | null;
}

// ── @unit ───────────────────────────────────────────────────────────────────

Given('a catalog version with beats {string}', function (this: object, beats: string) {
  setStored(this, beats, null);
});
Given('a catalog version with beats {string} and the note {string}', function (this: object, beats: string, note: string) {
  setStored(this, beats, note);
});
Given('a catalog version with the note {string}', function (this: object, note: string) {
  setStored(this, null, note);
});
Given(
  'a catalog version with beats {string} and the note with extra blank lines',
  function (this: object, beats: string) {
    setStored(this, beats, 'Old note\r\n\r\n\r\n\r\nsecond paragraph  ');
  }
);

When('a contributor changes it to {string} and saves', function (this: object, beats: string) {
  const s = w(this);
  save(this, formValues(s, { beats }));
});

When('a contributor clears both and saves', function (this: object) {
  save(this, formValues(w(this), { beats: '', note: '' }));
});

When('a contributor saves the note:', function (this: object, note: string) {
  save(this, formValues(w(this), { note }));
  w(this).typedNote = note;
});

When('a contributor types the beats {string}', function (this: object, beats: string) {
  w(this).typedBeats = beats;
});
When('a contributor types a note of {int} characters', function (this: object, n: number) {
  w(this).typedNote = 'x'.repeat(n);
});

When('a contributor changes only the lyrics and saves', function (this: object) {
  save(this, formValues(w(this), { content: '[Am]La la la' }));
});

Then('the song page shows beats {int}', function (this: object, n: number) {
  assert.deepEqual(technicalItems({ beats: w(this).stored.beats }, t), [`Beats ${n}`]);
});

Then('beats and note are saved as NULL', function (this: object) {
  const p = w(this).payload!;
  assert.equal(p.beats, null);
  assert.equal(p.song_note, null);
  assert.notEqual(p.beats, '');
  assert.notEqual(p.song_note, '');
});

Then('the song page shows no beats and no "About this song"', function (this: object) {
  const s = w(this);
  assert.deepEqual(technicalItems({ beats: s.stored.beats }, t), []);
  assert.deepEqual(songNoteParagraphs(s.stored.song_note), []);
});

Then('the note is saved with its paragraph break and line break, exactly as typed', function (this: object) {
  assert.equal(w(this).payload!.song_note, 'First paragraph,\nsecond line.\n\n<b>Second</b> paragraph & more');
});

Then('{string} shows {int} paragraphs, with the markup as plain text', function (this: object, label: string, n: number) {
  assert.equal(label, 'About this song');
  const paragraphs = songNoteParagraphs(w(this).stored.song_note);
  assert.equal(paragraphs.length, n);
  // The panel renders these strings as text nodes: the tags stay literal characters.
  assert.equal(paragraphs[1], '<b>Second</b> paragraph & more');
});

Then(/^the beats are (accepted|refused)$/, function (this: object, verdict: string) {
  const error = beatsError(w(this).typedBeats);
  assert.equal(error === null, verdict === 'accepted', `beats "${w(this).typedBeats}" gave ${error}`);
});

Then('the note is refused as too long', function (this: object) {
  assert.equal(noteError(w(this).typedNote), 'tooLong');
  assert.equal(noteError('x'.repeat(NOTE_MAX_LENGTH)), null);
});

Then('the save writes neither beats nor note', function (this: object) {
  const p = w(this).payload!;
  assert.ok(!('beats' in p) && !('song_note' in p), JSON.stringify(p));
  assert.equal(p.content_chordpro, '[Am]La la la');
});

Then('a stored beats value that fails the format check \\({string}\\) does not block that save', function (this: object, legacy: string) {
  assert.notEqual(beatsError(legacy), null, 'the legacy value really fails the format check');
  assert.deepEqual(versionMetaFieldsForSave({ beats: legacy }, { beats: legacy }), {});
});

// ── source ──────────────────────────────────────────────────────────────────

Given(
  'a catalog version printed in {string} on page {string}, compiled by {string}',
  function (this: object, book: string, page: string, compiler: string) {
    const s = w(this);
    s.sources = [{ id: 'src1', is_primary: true, original_title: null, page, songbooks: { id: 'a', title: book, compiler } }];
    s.sourceInitial = { sourcePage: page, sourceOriginalTitle: '' };
  }
);

Then('the edit form shows {string} as text', function (this: object, line: string) {
  // The form lists formatSourceLines() as plain list items; it registers no input for them.
  assert.deepEqual(
    formatSourceLines(w(this).sources, 'Morning Sun', t).map((l) => l.text),
    [line]
  );
});

Then('an admin is offered the {string} link', function (label: string) {
  assert.equal(t('songForm.source.correct'), label);
  assert.equal(canCorrectSource('admin'), true);
});

Then('a member, a gatekeeper and a guest are not', function () {
  for (const role of ['member', 'gatekeeper', 'musician', 'guest', undefined, null]) {
    assert.equal(canCorrectSource(role), false, String(role));
  }
});

Then("only an admin's save can write the source", function () {
  // SongForm sends the source update only when canCorrectSource(role); the database allows it to admins only (@seed).
  assert.equal(canCorrectSource('admin'), true);
  assert.equal(canCorrectSource('member'), false);
});

When('an admin changes the page to {string} and saves', function (this: object, page: string) {
  const s = w(this);
  s.sourcePayload = sourceFieldsForSave({ sourcePage: page, sourceOriginalTitle: '' }, s.sourceInitial);
});

Then('only the page of that source is written, as {string}', function (this: object, page: string) {
  assert.deepEqual(w(this).sourcePayload, { page });
});

Then('clearing the original title writes NULL', function (this: object) {
  assert.deepEqual(sourceFieldsForSave({ sourcePage: '38', sourceOriginalTitle: '' }, { sourcePage: '38', sourceOriginalTitle: 'Titre' }), {
    original_title: null,
  });
});

Then('all languages have text for beats, note and source in the edit form', function () {
  const keys: Array<[string, string[]]> = [
    ['songForm.field.beats', []],
    ['songForm.field.beats.hint', []],
    ['songForm.field.beats.invalid', []],
    ['songForm.field.beats.tooLong', ['{max}']],
    ['songForm.field.note', []],
    ['songForm.field.note.hint', []],
    ['songForm.field.note.tooLong', ['{max}']],
    ['songForm.section.songbook', []],
    ['songForm.section.source', []],
    ['songForm.source.hint', []],
    ['songForm.source.correct', []],
    ['songForm.source.correctHint', []],
    ['songForm.source.page', []],
    ['songForm.source.originalTitle', []],
    ['songForm.source.tooLong', ['{max}']],
  ];
  for (const l of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[l] as Record<string, string>;
    for (const [key, placeholders] of keys) {
      assert.ok(d[key], `${l} ${key}`);
      for (const p of placeholders) assert.ok(d[key].includes(p), `${l} ${key} keeps ${p}`);
    }
  }
});

// ── @seed ───────────────────────────────────────────────────────────────────

Given(
  'a public song whose version the member contributed, with beats {string} and the note {string}',
  async function (this: object, beats: string, note: string) {
    const s = w(this);
    setStored(this, beats, note);
    const member = await profileIdByEmail(SEEDED_EMAILS.member);
    const db = await seedDb();
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO public.compositions (title, owner_id, is_public) VALUES ('BDD Edit Meta', $1, true) RETURNING id`,
      [member]
    );
    const { rows: versions } = await db.query<{ id: string }>(
      `INSERT INTO public.song_versions (composition_id, contributor_id, content_chordpro, beats, song_note)
       VALUES ($1, $2, '[C]Sing', $3, $4) RETURNING id`,
      [rows[0].id, member, beats, note]
    );
    s.songId = rows[0].id;
    s.versionId = versions[0].id;
  }
);

Given('that version is printed in {string} on page {string}', async function (this: object, book: string, page: string) {
  const s = w(this);
  const db = await seedDb();
  await db.query(`INSERT INTO public.songbooks (id, title) VALUES ($1, $1) ON CONFLICT (id) DO NOTHING`, [`bdd-523-${book}`]);
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO public.song_version_sources (song_version_id, songbook_id, page, is_primary) VALUES ($1, $2, $3, true) RETURNING id`,
    [s.versionId, `bdd-523-${book}`, page]
  );
  s.sourceId = rows[0].id;
});

/** The version update of the form's payload (beats / song_note when present) as SQL, run as `userId` with RLS. */
async function runFormUpdate(world: object, userId: string, values: VersionFormValues) {
  const s = w(world);
  const payload = versionUpdateFields(values, s.initial);
  const sets: string[] = [];
  const params: unknown[] = [s.versionId];
  for (const column of ['beats', 'song_note'] as const) {
    if (column in payload) {
      params.push(payload[column]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  if (sets.length === 0) return [];
  return queryAsUser<{ beats: string | null; song_note: string | null }>(
    userId,
    `UPDATE public.song_versions SET ${sets.join(', ')} WHERE id = $1 RETURNING beats, song_note`,
    params
  );
}

When("the member saves beats {string} through the edit form's update", async function (this: object, beats: string) {
  const member = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await runFormUpdate(this, member, formValues(w(this), { beats }));
  assert.equal(rows.length, 1, 'the contributor updated their version');
  w(this).returned = rows[0];
});

When('the member saves the form with beats and note cleared', async function (this: object) {
  const member = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await runFormUpdate(this, member, formValues(w(this), { beats: '', note: '' }));
  assert.equal(rows.length, 1);
  w(this).returned = rows[0];
});

Then('the stored beats are {string} and the song page meta line shows {string}', function (this: object, beats: string, line: string) {
  const row = w(this).returned!;
  assert.equal(row.beats, beats);
  assert.deepEqual(technicalItems({ beats: row.beats }, t), [line]);
});

Then('the database holds NULL for beats and song_note', function (this: object) {
  assert.deepEqual(w(this).returned, { beats: null, song_note: null });
});

Then("the other member's save of beats {string} changes no row", async function (this: object, beats: string) {
  const rows = await runFormUpdate(this, OTHER_MEMBER_ID, formValues(w(this), { beats }));
  assert.deepEqual(rows, []);
});

Then("the member's correction of the page changes no row", async function (this: object) {
  const member = await profileIdByEmail(SEEDED_EMAILS.member);
  const rows = await queryAsUser(member, `UPDATE public.song_version_sources SET page = '39' WHERE id = $1 RETURNING id`, [w(this).sourceId]);
  assert.deepEqual(rows, []);
  // A guest sees the source (read policy) but changes nothing either.
  assert.equal((await queryAsAnon(`SELECT 1 FROM public.song_version_sources WHERE id = $1`, [w(this).sourceId])).length, 1);
});

Then("an admin's correction of the page to {string} changes the page", async function (this: object, page: string) {
  const admin = await profileIdByEmail(SEEDED_EMAILS.admin);
  const rows = await queryAsUser<{ page: string }>(
    admin,
    `UPDATE public.song_version_sources SET page = $2 WHERE id = $1 RETURNING page`,
    [w(this).sourceId, page]
  );
  assert.deepEqual(rows, [{ page }]);
});

Then('the member still cannot change the catalog_source_id of that version', async function (this: object) {
  const member = await profileIdByEmail(SEEDED_EMAILS.member);
  await assert.rejects(
    queryAsUser(member, `UPDATE public.song_versions SET catalog_source_id = 'x' WHERE id = $1 RETURNING id`, [w(this).versionId]),
    (error: { code?: string }) => error.code === '42501'
  );
});

Then('the select of the edit page runs against the local API without error and asks for beats and the note', async function () {
  assert.match(EDIT_SONG_SELECT, /\bbeats\b/);
  assert.match(EDIT_SONG_SELECT, /\bsong_note\b/);
  // Reads (never writes) whatever the local database holds; PostgREST plans the whole select even with no rows.
  const { url, key } = localApi();
  const { error } = await createClient(url, key, { auth: { persistSession: false } })
    .from('compositions')
    .select(EDIT_SONG_SELECT)
    .limit(1);
  assert.equal(error, null, `PostgREST rejected the edit select: ${error?.message}`);
});
