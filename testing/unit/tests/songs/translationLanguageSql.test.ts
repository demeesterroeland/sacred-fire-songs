// Story 6.2.13 (#516): the language-name list of the data migration agrees with the app's translationLanguageTag.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GENERATED_BEGIN,
  GENERATED_END,
  renderLanguageValues,
  sqlFold,
  translationLanguageRows,
} from '@/scripts/db/generate-translation-language-names';
import { languageNameEntries, translationLanguageTag } from '@/lib/songs/versionLabels';

const MIGRATION = 'supabase/migrations/20261112140000_translation_versions_to_translations.sql';
const sql = readFileSync(MIGRATION, 'utf8');

function generatedBlock(): string {
  const start = sql.indexOf(GENERATED_BEGIN);
  const end = sql.indexOf(GENERATED_END);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return sql.slice(start + GENERATED_BEGIN.length, end).trim();
}

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

describe('the migration language list', () => {
  it('is exactly what the generator produces (regenerate it, see scripts/README.md)', () => {
    expect(generatedBlock()).toBe(renderLanguageValues(translationLanguageRows()).trim());
  });

  it('maps every name the app knows to the tag translationLanguageTag gives, after the SQL fold', () => {
    const rows = migrationRows();
    expect(rows.size).toBeGreaterThan(100);
    const entries = languageNameEntries();
    expect(entries.length).toBeGreaterThan(100);
    const disagree: string[] = [];
    for (const { name } of entries) {
      const expected = translationLanguageTag(name);
      const viaSql = rows.get(sqlFold(name)) ?? null;
      if (expected !== viaSql) disagree.push(`${name}: app ${expected}, sql ${viaSql}`);
    }
    expect(disagree).toEqual([]);
  });

  it('keys every row so that the app reads it as the same language', () => {
    for (const [key, tag] of migrationRows()) expect(translationLanguageTag(key), key).toBe(tag);
  });

  it('knows Hindi written in Devanagari, which the JS fold and a narrow SQL fold used to disagree on', () => {
    expect(migrationRows().get(sqlFold('हिन्दी'))).toBe('hi');
  });

  it('has unique keys', () => {
    const keys = generatedBlock().split('\n').map((l) => /^\s*\('((?:[^']|'')*)',/.exec(l)?.[1]).filter(Boolean);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
