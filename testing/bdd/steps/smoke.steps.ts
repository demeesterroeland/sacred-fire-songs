/* eslint-disable @typescript-eslint/no-unused-vars */
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { parseChordProForDisplay } from '@/lib/chordUtils';
import { parseChordPro } from '@/lib/chordProParsing';
import type { SongBddWorld } from '../support/world';

// ---------------------------------------------------------------------------
// Background Steps (No-op for offline @unit scenarios; wired for @seed in #265)
// ---------------------------------------------------------------------------

Given('the seeded test accounts exist', function (this: SongBddWorld, _dataTable: DataTable) {
  // No-op in offline unit context; verified against database in @seed scenarios (#265)
});

Given(
  'the category taxonomy exists with parents {string}, {string}, {string}, {string}, {string}, {string} and {string}',
  function (
    this: SongBddWorld,
    _p1: string,
    _p2: string,
    _p3: string,
    _p4: string,
    _p5: string,
    _p6: string,
    _p7: string
  ) {
    // No-op in offline unit context; verified against database in @seed scenarios (#265)
  }
);

Given(
  'the database is seeded with the anchor songs and at least {int} songs in total',
  function (this: SongBddWorld, _minCount: number) {
    // No-op in offline unit context; verified against database in @seed scenarios (#265)
  }
);

// ---------------------------------------------------------------------------
// Rule: ChordPro content is parsed into title, author, key, capo and chord/lyric lines
// Smoke step definitions for initial @unit scenario (#263)
// ---------------------------------------------------------------------------

Given('a song whose content is {string}', function (this: SongBddWorld, raw: string) {
  this.rawContent = raw.replace(/\\n/g, '\n');
});

When('the content is parsed for display', function (this: SongBddWorld) {
  this.parsedMetadata = parseChordPro(this.rawContent);
  this.displaySections = parseChordProForDisplay(this.rawContent);
});

Then('there is one section with one line', function (this: SongBddWorld) {
  assert.equal(this.displaySections.length, 1, `Expected 1 section, got ${this.displaySections.length}`);
  assert.equal(
    this.displaySections[0].lines.length,
    1,
    `Expected 1 line in section 0, got ${this.displaySections[0].lines.length}`
  );
});

Then(
  'the line contains the chord {string} with lyrics {string} and the chord {string} with lyrics {string}',
  function (this: SongBddWorld, chord1: string, lyrics1: string, chord2: string, lyrics2: string) {
    const items = this.displaySections[0]?.lines[0]?.items ?? [];
    assert.ok(items.length >= 2, `Expected at least 2 items on the line, got ${items.length}`);
    assert.equal(items[0].chords, chord1);
    assert.equal(items[0].lyrics, lyrics1);
    assert.equal(items[1].chords, chord2);
    assert.equal(items[1].lyrics, lyrics2);
  }
);

Then('the {string} directive does not render as a line', function (this: SongBddWorld, directive: string) {
  const prefix = directive.replace(/\}$/, '');
  for (const section of this.displaySections) {
    for (const line of section.lines) {
      for (const item of line.items) {
        if (item.lyrics) {
          assert.ok(
            !item.lyrics.includes(prefix),
            `Expected rendered line not to include directive "${directive}", found in "${item.lyrics}"`
          );
        }
      }
    }
  }
});

// ---------------------------------------------------------------------------
// Pending Step Stubs for @unit (#264) and @seed (#265) scenarios
// Keeps `strict: false` runner green while reporting unimplemented scenarios as pending
// ---------------------------------------------------------------------------

Given(
  'a song whose content starts with {string}, {string}, {string} and {string}',
  function (_s1: string, _s2: string, _s3: string, _s4: string) {
    return 'pending';
  }
);

Given('the content ends with a blank line and {string}', function (_s1: string) {
  return 'pending';
});

When('the content is parsed', function () {
  return 'pending';
});

Then('the title is {string} and the author is {string}', function (_s1: string, _s2: string) {
  return 'pending';
});

Then('the key is {string} and the capo is {string}', function (_s1: string, _s2: string) {
  return 'pending';
});

Then('the cleaned content contains no {string} or {string} directive', function (_s1: string, _s2: string) {
  return 'pending';
});

Given('a song whose content declares the author with {string}', function (_s1: string) {
  return 'pending';
});

Then('the author is {string}', function (_s1: string) {
  return 'pending';
});

Given(
  'a song whose content has chord names such as {string}, {string} and {string} aligned above lyric lines',
  function (_s1: string, _s2: string, _s3: string) {
    return 'pending';
  }
);

Given('the content contains whitespace-only separator lines and {string} markers', function (_s1: string) {
  return 'pending';
});

Given('a lyric line contains the curly apostrophe in {string}', function (_s1: string) {
  return 'pending';
});

Given('the final stanza has a lyric line without a chord line above it', function () {
  return 'pending';
});

When('the content is converted to ChordPro', function () {
  return 'pending';
});

Then('the converted content contains {string}', function (_s1: string) {
  return 'pending';
});

Then('the page marker {string} is kept', function (_s1: string) {
  return 'pending';
});

Then('the song counts as having chords', function () {
  return 'pending';
});

Given(
  'a song whose chord lines contain {string}, {string}, {string}, {string}, {string} and {string}',
  function (_s1: string, _s2: string, _s3: string, _s4: string, _s5: string, _s6: string) {
    return 'pending';
  }
);

Given('a chord line holds several chords such as {string}', function (_s1: string) {
  return 'pending';
});

Given(
  'the lyrics contain accented words such as {string}, {string} and {string} and hyphenated syllables such as {string}',
  function (_s1: string, _s2: string, _s3: string, _s4: string) {
    return 'pending';
  }
);

Given(
  'a line whose tokens match the pattern letter A-G, optional # or b, optional m\\/min\\/maj\\/dim\\/aug\\/sus\\/add, optional number and optional slash bass',
  function () {
    return 'pending';
  }
);

Given('tokens in parentheses and the {string} character are ignored', function (_s1: string) {
  return 'pending';
});

When('more than half of the tokens are chords', function () {
  return 'pending';
});

Then('the line is merged as chords into the lyric line below it', function () {
  return 'pending';
});

Then(
  'the seeded songs include content with comment directives {string} and {string} that are kept, not treated as capo',
  function (_s1: string, _s2: string) {
    return 'pending';
  }
);

Then('content with chorus sections delimited by {string} and {string}', function (_s1: string, _s2: string) {
  return 'pending';
});

Then('content with a {string} directive', function (_s1: string) {
  return 'pending';
});

Then(
  'content with slash chords such as {string} and sharp chords such as {string} and {string}',
  function (_s1: string, _s2: string, _s3: string) {
    return 'pending';
  }
);

Then('content with blank-line stanza breaks and more than twenty stanzas', function () {
  return 'pending';
});

Then('lyrics-only content without any chord', function () {
  return 'pending';
});

Then('an empty content string', function () {
  return 'pending';
});

Then('a composition without any version at all', function () {
  return 'pending';
});

Given(
  'a composition {string} by {string} that is public with has_chords true and has_melody false',
  function (_s1: string, _s2: string) {
    return 'pending';
  }
);

Given('its first version has content {string} and key {string}', function (_s1: string, _s2: string) {
  return 'pending';
});

When('the composition is mapped to a song', function () {
  return 'pending';
});

Then(
  'the song has key {string}, content {string}, isPublic true, hasChords true and hasMelody false',
  function (_s1: string, _s2: string) {
    return 'pending';
  }
);

Given('a composition that has no versions', function () {
  return 'pending';
});

Then('the song key is null and the content is an empty string', function () {
  return 'pending';
});

Given('a composition whose is_public, has_chords and has_melody are null', function () {
  return 'pending';
});

Then('isPublic is true, hasChords is false and hasMelody is false', function () {
  return 'pending';
});

Given('a seeded song of shape {string}', function (_s1: string) {
  return 'pending';
});

Then(/^has_chords is (true|false) and has_melody is (true|false)$/, function (_b1: string, _b2: string) {
  return 'pending';
});

Then(
  'seeded songs use keys including {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string}, {string} and no key',
  function (
    _k1: string,
    _k2: string,
    _k3: string,
    _k4: string,
    _k5: string,
    _k6: string,
    _k7: string,
    _k8: string,
    _k9: string,
    _k10: string,
    _k11: string,
    _k12: string,
    _k13: string,
    _k14: string
  ) {
    return 'pending';
  }
);

Then(
  'capos range from {int} to {int} and some content carries a {string} directive',
  function (_n1: number, _n2: number, _s1: string) {
    return 'pending';
  }
);

Then(
  'tunings include {string}, {string}, {string} and {string}',
  function (_s1: string, _s2: string, _s3: string, _s4: string) {
    return 'pending';
  }
);

Then(
  'some songs have a second version such as {string}, {string} or {string}',
  function (_s1: string, _s2: string, _s3: string) {
    return 'pending';
  }
);

Given('the author string {string}', function (_s1: string) {
  return 'pending';
});

When('the artists are parsed', function () {
  return 'pending';
});

Then(/^the result is (\[.*\])$/, function (_s1: string) {
  return 'pending';
});

Given(/^the artists (\[.*\])$/, function (_s1: string) {
  return 'pending';
});

When('they are formatted', function () {
  return 'pending';
});

Then('the stored author is {string}', function (_s1: string) {
  return 'pending';
});

Given(
  'artists Cari El \\({int} songs), Danit \\({int}), Herbert Quinteros \\({int}) and Ayla Nereo \\({int})',
  function (_n1: number, _n2: number, _n3: number, _n4: number) {
    return 'pending';
  }
);

When('the suggestions are sorted', function () {
  return 'pending';
});

Then('the order is Danit, Cari El, Herbert Quinteros, Ayla Nereo', function () {
  return 'pending';
});

Given('songs by {string}, {string}, {string} and {string}', function (_s1: string, _s2: string, _s3: string, _s4: string) {
  return 'pending';
});

When('the artist list is built', function () {
  return 'pending';
});

Then('there is one artist with {int} songs', function (_n1: number) {
  return 'pending';
});

Then('the canonical spelling is the one with more capital letters', function () {
  return 'pending';
});

Given('songs by {string}, null, {string} and {string}', function (_s1: string, _s2: string, _s3: string) {
  return 'pending';
});

Then('the order is Danit, Traditional, No Artist', function () {
  return 'pending';
});

Then('{string} has {int} songs', function (_s1: string, _n1: number) {
  return 'pending';
});

Then(
  'the filter values {string} and {string} match songs with an empty or missing author',
  function (_s1: string, _s2: string) {
    return 'pending';
  }
);

Given('a song whose author is {string}', function (_s1: string) {
  return 'pending';
});

Then('filtering by {string} and by {string} both match it', function (_s1: string, _s2: string) {
  return 'pending';
});

Then(
  'every distinct parsed artist has a subcategory under {string} with slug {string} and emoji {string}',
  function (_s1: string, _s2: string, _s3: string) {
    return 'pending';
  }
);

Then("the song is linked to each of its artists' subcategories", function () {
  return 'pending';
});

Given(
  'a song mapped to the category {string} \\(slug {string}) under parent {string}',
  function (_s1: string, _s2: string, _s3: string) {
    return 'pending';
  }
);

Then("the song's first category has parent {string}", function (_s1: string) {
  return 'pending';
});

Then('a song without mappings has an empty category list', function () {
  return 'pending';
});

Given('songs with various tags', function () {
  return 'pending';
});

When('filtering by two parent categories', function () {
  return 'pending';
});

Then('songs in either parent match', function () {
  return 'pending';
});

When('filtering by two tag slugs', function () {
  return 'pending';
});

Then('only songs carrying both tags match', function () {
  return 'pending';
});

Then('every non-artist subcategory is used by at least one song', function () {
  return 'pending';
});

Then(
  'songs carry between {int} and {int} tags, normally distributed around {int}',
  function (_n1: number, _n2: number, _n3: number) {
    return 'pending';
  }
);

Then('about one song in twenty carries no tag at all', function () {
  return 'pending';
});

Then(
  'language tags include Spanish, English, Portuguese, Italian and Nahuatl content',
  function () {
    return 'pending';
  }
);

Given('songs that are public and songs that are private', function () {
  return 'pending';
});

When('the status filter is {string}', function (_s1: string) {
  return 'pending';
});

Then('only songs with isPublic false are returned', function () {
  return 'pending';
});

Then('only public songs are returned', function () {
  return 'pending';
});

Then(
  'songs are owned by the admin, the musician, the member and the gatekeeper accounts, and some songs have no owner',
  function () {
    return 'pending';
  }
);

Then('about {int}% of songs are private drafts', function (_n1: number) {
  return 'pending';
});

Then(
  'about half of the songs have {int} to {int} takes, about {int}% have exactly one and about {int}% have none',
  function (_n1: number, _n2: number, _n3: number, _n4: number) {
    return 'pending';
  }
);

Then('recordings exist for the member, the admin, the musician and the gatekeeper', function () {
  return 'pending';
});

Then('storage paths follow {string} with both extensions present', function (_s1: string) {
  return 'pending';
});

Then('every recording has a position, a file size in bytes and a duration in seconds', function () {
  return 'pending';
});

When(
  'a playlist is saved with title {string} and a description of {int} characters',
  function (_s1: string, _n1: number) {
    return 'pending';
  }
);

Then(/^the result is (valid|invalid \(blank title\)|invalid \(title length\)|invalid \(description\))$/, function (_s1: string) {
  return 'pending';
});

Then('{string}, {string}, {string} and {string} are smart playlists', function (_s1: string, _s2: string, _s3: string, _s4: string) {
  return 'pending';
});

Then('{string} is not', function (_s1: string) {
  return 'pending';
});

Given('the member owns a playlist titled {string}', function (_s1: string) {
  return 'pending';
});

Then('songs in it are mapped with isFavorite true', function () {
  return 'pending';
});

Given('a guest', function () {
  return 'pending';
});

Then('favorites are stored under the localStorage key {string}', function (_s1: string) {
  return 'pending';
});

Then('toggling adds and removes ids, and corrupt JSON yields an empty list', function () {
  return 'pending';
});

Then(
  /^the playlists with ids aaaaaaaa-0001 … aaaaaaaa-0007 exist with the titles "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)" and "([^"]+)"$/,
  function (_s1: string, _s2: string, _s3: string, _s4: string, _s5: string, _s6: string, _s7: string) {
    return 'pending';
  }
);

Then('{string} is empty', function (_s1: string) {
  return 'pending';
});

Then(
  '{string} prefers songs tagged {string} and {string} prefers songs tagged {string}',
  function (_s1: string, _s2: string, _s3: string, _s4: string) {
    return 'pending';
  }
);

Then('the member, the admin and the musician each own a {string} playlist', function (_s1: string) {
  return 'pending';
});

Then('the member and the admin have recently viewed songs', function () {
  return 'pending';
});

Given(
  'the songs {string} \\(Traditional, Am), {string} \\(Danit, Em) and {string} \\(Medicine Family, G)',
  function (_s1: string, _s2: string, _s3: string) {
    return 'pending';
  }
);

When('the search text is {string}', function (_s1: string) {
  return 'pending';
});

Then('{int} songs match', function (_n1: number) {
  return 'pending';
});

Given('the song {string}', function (_s1: string) {
  return 'pending';
});

Then('the song matches', function () {
  return 'pending';
});

Then('songs are ordered by created_at descending, then id descending', function () {
  return 'pending';
});

Then('pages contain {int} songs using a keyset cursor', function (_n1: number) {
  return 'pending';
});

Then(
  'there are titles that differ only by an accent \\({string} vs {string})',
  function (_s1: string, _s2: string) {
    return 'pending';
  }
);

Then(
  'a title longer than {int} characters containing an apostrophe and an emoji',
  function (_n1: number) {
    return 'pending';
  }
);

Then('titles containing {string} both alone and inside longer titles', function (_s1: string) {
  return 'pending';
});

Then('content in Spanish, English, Portuguese, Italian, Nahuatl and Lakota', function () {
  return 'pending';
});
