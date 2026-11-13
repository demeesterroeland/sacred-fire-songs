// Story 6.2.24 / G5.7 (#569) — docs/testing/ux-v3-language-filter-only.feature
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import {
  applyBrowseFilters,
  browseOptions,
  filterTagSelectorGroups,
  knownLanguageSlugs,
  normalizeLegacyLanguageParams,
  type GroupedCategoryOption,
} from '../../../lib/songs/browseFilters';
import type { Song } from '../../../lib/songUtils';

interface LanguageFilterWorld {
  grouped: GroupedCategoryOption<{ id: string; name: string; slug: string }>[];
  shownGroups: GroupedCategoryOption<{ id: string; name: string; slug: string }>[];
  songs: Song[];
  bookmarkedUrl: string;
  selectedLanguage: string;
  listedSongs: Song[];
}

const worlds = new WeakMap<object, LanguageFilterWorld>();
const world = (w: object): LanguageFilterWorld => {
  let state = worlds.get(w);
  if (!state) {
    state = {
      grouped: [{ parentName: 'The Elements', categories: [{ id: 'el-fire', name: 'Fire', slug: 'fire' }] }],
      shownGroups: [],
      songs: [],
      bookmarkedUrl: '',
      selectedLanguage: '',
      listedSongs: [],
    };
    worlds.set(w, state);
  }
  return state;
};

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

const makeCatalog = (): Song[] =>
  [
    {
      id: 's-nl',
      title: 'Zonnelied',
      author: '',
      songKey: null,
      color: 'red',
      createdAt: '2026-01-01T00:00:00Z',
      songbooks: [],
      categories: [{ name: 'Dutch', slug: 'dutch', parent: 'Languages', parentSlug: 'languages' }],
    },
    {
      id: 's-es',
      title: 'Agua Viva',
      author: '',
      songKey: null,
      color: 'red',
      createdAt: '2026-01-02T00:00:00Z',
      songbooks: [],
      categories: [{ name: 'Spanish', slug: 'spanish', parent: 'Languages', parentSlug: 'languages' }],
    },
  ] as Song[];

Given(
  'the taxonomy has a {string} group with {string} and {string}',
  function (this: object, groupName: string, first: string, second: string) {
    const w = world(this);
    w.grouped.push({
      parentName: groupName,
      categories: [
        { id: `cat-${slug(first)}`, name: first, slug: slug(first) },
        { id: `cat-${slug(second)}`, name: second, slug: slug(second) },
      ],
    });
    w.songs = makeCatalog();
  }
);

Given('the taxonomy has a {string} group with {string}', function (this: object, groupName: string, name: string) {
  const w = world(this);
  w.grouped.push({
    parentName: groupName,
    categories: [{ id: `cat-${slug(name)}`, name, slug: slug(name) }],
  });
  w.songs = makeCatalog();
});

When('I open Search options on \\/songs', function (this: object) {
  const w = world(this);
  w.shownGroups = filterTagSelectorGroups(w.grouped, '');
});

When('I type {string} in the category and tag selector', function (this: object, query: string) {
  const w = world(this);
  w.shownGroups = filterTagSelectorGroups(w.grouped, query);
});

Then('the category and tag selector shows no {string} group', function (this: object, groupName: string) {
  const w = world(this);
  assert.equal(
    w.shownGroups.some((g) => g.parentName === groupName),
    false,
    `Expected no "${groupName}" group in tag selector, got [${w.shownGroups.map((g) => g.parentName).join(', ')}]`
  );
});

Then('I can choose {string} in the Language filter', function (this: object, languageName: string) {
  const w = world(this);
  const { languages } = browseOptions(w.songs, w.songs, {});
  assert.ok(
    languages.some((o) => o.label === languageName),
    `Expected "${languageName}" in Language filter options, got [${languages.map((o) => o.label).join(', ')}]`
  );
});

Then('{string} is not offered there', function (this: object, catName: string) {
  const w = world(this);
  const offered = w.shownGroups.flatMap((g) => g.categories.map((c) => c.name));
  assert.equal(offered.includes(catName), false, `Expected "${catName}" not to be offered, got [${offered.join(', ')}]`);
});

Given('a bookmarked link {string}', function (this: object, url: string) {
  const w = world(this);
  w.bookmarkedUrl = url;
  w.songs = makeCatalog();
});

When('I open the bookmarked link', function (this: object) {
  const w = world(this);
  const query = w.bookmarkedUrl.split('?')[1] ?? '';
  const params = new URLSearchParams(query);
  const languageSlugs = knownLanguageSlugs(w.songs);
  const normalized = normalizeLegacyLanguageParams(params, languageSlugs);
  w.selectedLanguage = normalized.language;
  assert.equal(normalized.category, undefined);
  assert.equal(normalized.tags.includes('dutch'), false);
  w.listedSongs = [...applyBrowseFilters(w.songs, { language: normalized.language })];
});

Then('only songs in the {word} language category are listed', function (this: object, languageName: string) {
  const w = world(this);
  const targetSlug = slug(languageName);
  assert.ok(w.listedSongs.length > 0, `Expected at least one song in ${languageName}`);
  for (const s of w.listedSongs) {
    assert.ok(
      s.categories.some((c) => c.parentSlug === 'languages' && c.slug === targetSlug),
      `Expected "${s.title}" to have language "${targetSlug}"`
    );
  }
});

Then('the Language filter shows {string}', function (this: object, languageName: string) {
  const w = world(this);
  const { languages } = browseOptions(w.songs, w.songs, { language: w.selectedLanguage });
  const chosen = languages.find((o) => o.value === w.selectedLanguage);
  assert.equal(chosen?.label, languageName);
});
