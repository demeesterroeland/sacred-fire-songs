// Story 6.1.21 / G4.8 (#405) — docs/testing/ux-v2-publish-consent.feature
// The steps run the real audience rules (lib/songs/publishAudience.ts) and the real messages.
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  canPublishTake,
  publishAudienceKey,
  publishOffer,
  songIsPublicOfTake,
  type PublishOffer,
} from '../../../lib/songs/publishAudience';
import { linkedTakeTab } from '../../../lib/songs/recordingLink';
import { DICTIONARIES, SUPPORTED_LOCALES, interpolate, type Locale } from '../../../lib/i18n';

type Dict = Record<string, string>;
const dict = (locale: Locale) => DICTIONARIES[locale] as Dict;
const en = dict('en');

/** The words that name the guests in each language (the sentence for a public song must carry them). */
const GUESTS: Record<Locale, string> = {
  en: 'guests',
  nl: 'gasten',
  es: 'invitados',
  it: 'ospiti',
  fr: 'invités',
  pt: 'convidados',
  ru: 'гост',
  qu: 'mana yaykusqa',
};

interface World {
  takeName: string;
  songTitle: string;
  songIsPublic: boolean | null;
  unreadable?: boolean;
  canMakeSongPublic: boolean;
  header?: string;
  audience?: string;
  offer?: PublishOffer;
  rows?: Array<Parameters<typeof songIsPublicOfTake>[0]>;
}

/** What the dialog shows, built from the real rules and messages. */
function openDialog(w: World, locale: Locale = 'en') {
  const messages = dict(locale);
  const visibility = { songIsPublic: w.songIsPublic, unreadable: w.unreadable };
  w.header = `${w.takeName} ${interpolate(messages['recording.publish.songLabel'], { title: w.songTitle })}`;
  w.audience = messages[publishAudienceKey(visibility)];
  w.offer = publishOffer({ ...visibility, canMakeSongPublic: w.canMakeSongPublic });
}

function owner(w: World, take: string, song: string, isPublic: boolean | null, canMakeSongPublic = true) {
  w.takeName = take;
  w.songTitle = song;
  w.songIsPublic = isPublic;
  w.canMakeSongPublic = canMakeSongPublic;
}

Given('the owner of a take {string} on the public song {string}', function (this: World, take: string, song: string) {
  owner(this, take, song, true);
});
Given('the owner of a take {string} on the private song {string}', function (this: World, take: string, song: string) {
  owner(this, take, song, false);
});
Given(
  'a member who does not own the private song {string} with a take {string}',
  function (this: World, song: string, take: string) {
    owner(this, take, song, false, false);
  },
);
Given('the visibility of the song {string} is not known yet', function (this: World, song: string) {
  owner(this, 'Morning take', song, null);
  openDialog(this);
});

Given('the visibility of the song {string} could not be read', function (this: World, song: string) {
  owner(this, 'Morning take', song, null);
  this.unreadable = true;
  openDialog(this);
});
Then('the dialog says it could not check whether the song is public', function (this: World) {
  assert.equal(this.audience, en['recording.publish.checkFailed']);
  assert.match(this.audience ?? '', /Could not check/);
});

When('they open "Make public" on the take', function (this: World) {
  openDialog(this);
});

Then('the dialog shows the take {string} and the song {string}', function (this: World, take: string, song: string) {
  assert.ok(this.header?.includes(take));
  assert.ok(this.header?.includes(song));
});
Then('the dialog states that everyone visiting the song, including guests, can listen', function (this: World) {
  assert.equal(this.audience, 'Everyone visiting this song, including guests, will be able to listen.');
});
Then('the dialog offers to publish the take', function (this: World) {
  assert.equal(this.offer, 'publish');
  assert.equal(canPublishTake({ songIsPublic: this.songIsPublic }), true);
});
Then('the dialog says the take can be made private again without undoing what was heard', function () {
  assert.match(en['recording.publish.reversible'], /private again/);
  assert.match(en['recording.publish.reversible'], /can't undo what someone already heard or saved/);
});
Then('the dialog says the song is private and must be made public first', function (this: World) {
  assert.match(this.audience ?? '', /private/);
  assert.match(this.audience ?? '', /public first/);
});
Then('the dialog does not say that guests can listen', function (this: World) {
  assert.ok(!/guests/i.test(this.audience ?? ''));
});
Then('the dialog does not offer to publish the take', function (this: World) {
  assert.notEqual(this.offer, 'publish');
  assert.equal(canPublishTake({ songIsPublic: this.songIsPublic, unreadable: this.unreadable }), false);
});
Then('the dialog offers the owner to make the song public', function (this: World) {
  assert.equal(this.offer, 'make-song-public');
});
Then('the dialog tells them to ask the song owner', function (this: World) {
  assert.equal(this.offer, 'ask-owner');
  assert.match(en['recording.publish.privateSong.notOwner'], /Ask the owner/);
});

Given('takes on songs that are private, have no visibility value or cannot be read', function (this: World) {
  this.rows = [
    { song_versions: { compositions: { is_public: false } } },
    { song_versions: { compositions: { is_public: null } } },
    { song_versions: null },
    null,
  ];
});
Then('none of them counts as a take on a public song', function (this: World) {
  for (const row of this.rows ?? []) assert.equal(songIsPublicOfTake(row), false);
});

Given('every supported language', function () {
  assert.equal(SUPPORTED_LOCALES.length, 8);
});
Then('each language has the audience sentences for a public and for a private song', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const messages = dict(locale);
    for (const key of [
      'recording.publish.description',
      'recording.publish.descriptionPrivateSong',
      'recording.publish.songLabel',
      'recording.publish.reversible',
    ]) {
      assert.ok(messages[key], `${locale} misses ${key}`);
    }
    assert.ok(messages['recording.publish.songLabel'].includes('{title}'), `${locale} songLabel lacks {title}`);
    assert.notEqual(messages['recording.publish.description'], messages['recording.publish.descriptionPrivateSong']);
  }
});
Then('the sentence for a public song names the guests in each language', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const text = dict(locale)[publishAudienceKey({ songIsPublic: true })];
    assert.ok(text.toLowerCase().includes(GUESTS[locale]), `${locale}: "${text}" does not name the guests`);
    if (locale !== 'en') assert.notEqual(text, en['recording.publish.description'], `${locale} is an English copy`);
  }
});
Then('the sentence for a private song does not name the guests in any language', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const text = dict(locale)[publishAudienceKey({ songIsPublic: false })];
    assert.ok(!text.toLowerCase().includes(GUESTS[locale]), `${locale}: "${text}" names the guests`);
    if (locale !== 'en') assert.notEqual(text, en['recording.publish.descriptionPrivateSong'], `${locale} is an English copy`);
  }
});
Then('the reversible line is reworded in every language', function () {
  const seen = new Set<string>();
  for (const locale of SUPPORTED_LOCALES) {
    const text = dict(locale)['recording.publish.reversible'];
    // Two sentences: the take can be made private again, and that does not undo what was heard.
    assert.ok(text.split(/(?<=[.!?])\s+/).length >= 2, `${locale} reversible is one sentence only`);
    assert.ok(!/https?:|URL/i.test(text), `${locale} mentions a link lifetime`);
    seen.add(text);
  }
  assert.equal(seen.size, SUPPORTED_LOCALES.length);
});

Given('a {string} follows a take link and {string} the take', function (this: World & { tab?: string }, who: string, found: string) {
  const tab = linkedTakeTab(who === 'member', found === 'can see');
  this.tab = tab === 'recorder' ? 'Record' : 'Listen';
});
Then('Practice opens on {string}', function (this: World & { tab?: string }, tab: string) {
  assert.equal(this.tab, tab);
});
