// Story 6.2.13 (#516): the language-name list of the data migration agrees with the app's translationLanguageTag.
//
// The migration is FROZEN once released: it has run, so it is never edited afterwards. Its generated block is therefore
// pinned to a committed snapshot (fixtures/translation-language-names.sql) that does not depend on the ICU data of the
// Node running the tests; a Node/ICU upgrade must never force an edit of an applied migration. The generator
// (scripts/db/generate-translation-language-names.ts) is only run on purpose, to write the block and the snapshot
// together before the migration is released.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GENERATED_BEGIN, GENERATED_END, renderLanguageValues, sqlFold } from '@/scripts/db/generate-translation-language-names';
import { translationLanguageTag } from '@/lib/songs/versionLabels';

const MIGRATION = 'supabase/migrations/20261112140000_translation_versions_to_translations.sql';
const SNAPSHOT = 'testing/unit/tests/songs/fixtures/translation-language-names.sql';
const sql = readFileSync(MIGRATION, 'utf8');

/** The rows between the generated-block markers of `text`, trimmed. */
function blockOf(text: string): string {
  const start = text.indexOf(GENERATED_BEGIN);
  const end = text.indexOf(GENERATED_END);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return text.slice(start + GENERATED_BEGIN.length, end).trim();
}
const generatedBlock = () => blockOf(sql);

/** The (name, tag) rows of the migration, read back from its text. */
function migrationRows(): Map<string, string> {
  const rows = new Map<string, string>();
  for (const line of generatedBlock().split('\n')) {
    const m = /^\s*\('((?:[^']|'')*)', '([^']+)'\),?$/.exec(line);
    if (m) rows.set(m[1].replace(/''/g, "'"), m[2]);
  }
  return rows;
}

describe('sqlFold (mirrors the fold of the migration)', () => {
  it('strips Latin and Hebrew marks only, then lowercases', () => {
    expect(sqlFold('Español')).toBe('espanol');
    expect(sqlFold('  Français ')).toBe('francais');
    expect(sqlFold('עִבְרִית')).toBe('עברית');
    // Devanagari vowel signs and virama are marks too, but the SQL fold leaves them in.
    expect(sqlFold('हिन्दी')).toBe('हिन्दी');
  });
});

describe('renderLanguageValues', () => {
  it('writes one quoted row per line, escaping quotes, without a trailing comma', () => {
    expect(renderLanguageValues([['english', 'en'], ["n'ko", 'nqo']])).toBe("    ('english', 'en'),\n    ('n''ko', 'nqo')");
  });
});

describe('the migration language list', () => {
  it('is the committed snapshot, whatever ICU data this Node has (frozen once released)', () => {
    expect(generatedBlock()).toBe(blockOf(readFileSync(SNAPSHOT, 'utf8')));
  });

  it('keys every row so that the app reads it as the same language', () => {
    const rows = migrationRows();
    expect(rows.size).toBeGreaterThan(100);
    for (const [key, tag] of rows) expect(translationLanguageTag(key), key).toBe(tag);
  });

  it('knows Hindi written in Devanagari, which the JS fold and a narrow SQL fold used to disagree on', () => {
    expect(migrationRows().get(sqlFold('हिन्दी'))).toBe('hi');
  });

  it('has unique keys', () => {
    const keys = generatedBlock().split('\n').map((l) => /^\s*\('((?:[^']|'')*)',/.exec(l)?.[1]).filter(Boolean);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('the language tag fallback of the migration', () => {
  /** The tag pattern of the migration, read back from its text (Postgres POSIX syntax is the same here). */
  function sqlTagPattern(): RegExp {
    const m = /btrim\(coalesce\(r\.version_name, ''\)\) ~ '([^']+)'/.exec(sql);
    expect(m, 'tag fallback pattern').not.toBeNull();
    return new RegExp(m![1]);
  }

  it('accepts exactly the tags the app accepts', () => {
    const pattern = sqlTagPattern();
    const samples = [
      'nl', 'lkt', 'pt-BR', 'pt-br', 'zh-Hant-TW', 'sr-Latn', 'en-US', 'de-1996', 'en-GB-oxendict',
      'xx-a', 'xx-a-b', 'nl-', 'nl--be', 'nl-b', 'pt-abcdefghi', 'pt-12345678', 'x', 'a', 'New', 'Alt', 'singable',
      'en-u-ca-gregory', 'nl be', 'nl_BE',
    ];
    const disagree = samples
      .filter((v) => pattern.test(v) !== (translationLanguageTag(v) !== null))
      .map((v) => `${v}: sql ${pattern.test(v)}, app ${translationLanguageTag(v)}`);
    expect(disagree).toEqual([]);
  });

  it('rejects a one-character subtag, which Intl.getCanonicalLocales rejects too', () => {
    expect(sqlTagPattern().test('xx-a')).toBe(false);
    expect(translationLanguageTag('xx-a')).toBeNull();
  });
});
