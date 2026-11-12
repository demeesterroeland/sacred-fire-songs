/**
 * Writes the language-name list of the migration `20261112140000_translation_versions_to_translations.sql`
 * (Story 6.2.13, #516), so the SQL and the app (`translationLanguageTag` in lib/songs/versionLabels.ts) read the same
 * `version_name` as the same language.
 *
 * The migration folds a name in SQL (NFD, strip the combining marks U+0300–U+036F and U+0591–U+05C7, lowercase,
 * trim); the app folds in JS (strips every `\p{M}`). This script therefore lists every recognised name SQL-folded,
 * each with the tag the app itself gives that name, so the two cannot disagree. A unit test
 * (testing/unit/tests/songs/translationLanguageSql.test.ts) checks the migration against the app and fails when the
 * list in the migration is out of date.
 *
 * Usage (from the repository root): `npx tsx scripts/db/generate-translation-language-names.ts`
 * prints the block between the BEGIN and END markers; paste it over the block in the migration.
 */
import { languageNameEntries, translationLanguageTag } from '@/lib/songs/versionLabels';

export const GENERATED_BEGIN = '-- BEGIN generated language names (scripts/db/generate-translation-language-names.ts)';
export const GENERATED_END = '-- END generated language names';

/** The fold of the migration: `lower(btrim(regexp_replace(normalize(x, NFD), '[̀-֑ͯ-ׇ]', '', 'g')))`. */
export function sqlFold(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-֑ͯ-ׇ]/g, '')
    .toLowerCase()
    .replace(/^ +| +$/g, '');
}

/** SQL-folded name → tag, first name wins; a name the app does not read as a language is left out. */
export function translationLanguageRows(): Array<[string, string]> {
  const rows = new Map<string, string>();
  for (const { name } of languageNameEntries()) {
    const tag = translationLanguageTag(name);
    const key = sqlFold(name);
    if (tag && key && !rows.has(key)) rows.set(key, tag);
  }
  return [...rows];
}

const quote = (s: string) => `'${s.replace(/'/g, "''")}'`;

/** The `VALUES` rows, one per line, without the markers. */
export function renderLanguageValues(rows: ReadonlyArray<readonly [string, string]>): string {
  return rows.map(([name, tag], i) => `    (${quote(name)}, ${quote(tag)})${i < rows.length - 1 ? ',' : ''}`).join('\n');
}

const isMain = typeof process !== 'undefined' && /generate-translation-language-names\.ts$/.test(process.argv[1] ?? '');
if (isMain) {
  console.log(`${GENERATED_BEGIN}\n${renderLanguageValues(translationLanguageRows())}\n${GENERATED_END}`);
}
