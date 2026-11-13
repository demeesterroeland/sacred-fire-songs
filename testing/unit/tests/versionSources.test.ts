// Story 6.2.10 / G2.1 (#513): the source line under the lyrics — book · p. 38 · compiled by … (L2, pure).
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, translateFrom } from '@/lib/i18n';
import {
  VERSION_SOURCES_SELECT,
  formatSourceLine,
  formatSourceLines,
  primarySource,
  sortSources,
  type VersionSourceRow,
} from '@/lib/songs/versionSources';

const t = (key: string, params?: Record<string, string | number>) =>
  translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

const book = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Songbook ${id}`,
  short_name: null,
  compiler: null,
  ...over,
});

const source = (over: Partial<VersionSourceRow> = {}): VersionSourceRow => ({
  id: 's1',
  is_primary: false,
  original_title: null,
  page: null,
  songbooks: book('A'),
  ...over,
});

describe('formatSourceLine', () => {
  it('credits the book, page and compiler', () => {
    const line = formatSourceLine(source({ page: '38', songbooks: book('A', { compiler: 'Compiler A' }) }), 'Rise Up', t);
    expect(line).toBe('Songbook A · p. 38 · compiled by Compiler A');
  });

  it('uses "pp." for a page range or list', () => {
    expect(formatSourceLine(source({ page: '12-13' }), 'Rise Up', t)).toBe('Songbook A · pp. 12-13');
    expect(formatSourceLine(source({ page: '4, 9' }), 'Rise Up', t)).toBe('Songbook A · pp. 4, 9');
  });

  it('drops the page and the compiler when they are unknown', () => {
    expect(formatSourceLine(source({ page: '  ' }), 'Rise Up', t)).toBe('Songbook A');
  });

  it('shows the original title only when it differs from the song title', () => {
    expect(formatSourceLine(source({ original_title: 'Subir' }), 'Rise Up', t)).toBe('Songbook A · Original title: Subir');
    expect(formatSourceLine(source({ original_title: ' rise up ' }), 'Rise Up', t)).toBe('Songbook A');
  });

  it('falls back to the short name when the book has no title', () => {
    expect(formatSourceLine(source({ songbooks: book('A', { title: '', short_name: 'SBA' }) }), 'Rise Up', t)).toBe('SBA');
  });

  it('reads a songbook that PostgREST returned as a one-item array', () => {
    expect(formatSourceLine(source({ songbooks: [book('A')] as never }), 'Rise Up', t)).toBe('Songbook A');
  });

  it('returns null for a source whose book is unreadable (no line to show)', () => {
    expect(formatSourceLine(source({ songbooks: null }), 'Rise Up', t)).toBeNull();
  });
});

describe('page: one page or several (finding 4)', () => {
  const line = (page: string) => formatSourceLine(source({ page }), 'Rise Up', t);
  it.each(['38–39', '38—39', '38-39', '38/39', '38 & 40', '38 y 40', '38 and 40', '38 und 40', '38 40', '4, 9', '4; 9', 'iv-vi', '12a-13b'])(
    '"%s" is a list of pages',
    (page) => expect(line(page)).toBe(`Songbook A · pp. ${page}`)
  );
  it.each(['A-12', 'II-4', 'iv', '12a', '38'])('"%s" is one page', (page) => expect(line(page)).toBe(`Songbook A · p. ${page}`));
  it.each([
    ['p. 38', 'p. 38'],
    ['p.38', 'p. 38'],
    ['pág. 38', 'p. 38'],
    ['S. 38', 'p. 38'],
    ['blz. 38', 'p. 38'],
    ['с. 38', 'p. 38'],
    ['pp. 38-39', 'pp. 38-39'],
    ['págs. 38, 40', 'pp. 38, 40'],
  ])('strips the importer prefix of "%s"', (page, shown) => expect(line(page)).toBe(`Songbook A · ${shown}`));
  it('drops a page that is only a prefix', () => expect(line('p.')).toBe('Songbook A'));
});

describe('original title comparison (finding 5)', () => {
  const line = (original: string, title: string) => formatSourceLine(source({ original_title: original }), title, t);
  it('ignores accents and case', () => expect(line('Pachamamá', 'Pachamama')).toBe('Songbook A'));
  it('ignores curly versus straight apostrophes', () => {
    expect(line('Mother’s', "Mother's")).toBe('Songbook A');
    expect(line('Mother‘s', "Mother's")).toBe('Songbook A');
    expect(line('Motherʼs', "Mother's")).toBe('Songbook A');
  });
  it('ignores doubled and unusual spaces', () => expect(line('Rise   Up', 'Rise Up')).toBe('Songbook A'));
  it('ignores trailing punctuation', () => {
    expect(line('Rise Up!', 'Rise Up')).toBe('Songbook A');
    expect(line('Rise Up', 'Rise Up?')).toBe('Songbook A');
    expect(line('Rise Up…', 'Rise Up')).toBe('Songbook A'); // NFKC turns … into ...
  });
  it('still shows a real difference', () => expect(line('Subir', 'Rise Up')).toBe('Songbook A · Original title: Subir'));
});

describe('primarySource (shared with the version label, #530)', () => {
  it('is the primary row, else the first after sorting', () => {
    const rows = [source({ id: 'c', songbooks: book('C') }), source({ id: 'b', songbooks: book('B'), is_primary: true }), source({ id: 'a', songbooks: book('A') })];
    expect(primarySource(rows)?.id).toBe('b');
    expect(primarySource(rows.filter((r) => !r.is_primary))?.id).toBe('a');
  });
  it('is null without sources', () => {
    expect(primarySource([])).toBeNull();
    expect(primarySource(undefined)).toBeNull();
    expect(primarySource(null)).toBeNull();
  });
});

describe('VERSION_SOURCES_SELECT', () => {
  it('has everything the source line and the version label need', () => {
    const flat = VERSION_SOURCES_SELECT.replace(/\s+/g, ' ');
    expect(flat).toContain('song_version_sources ( id, is_primary, original_title, page, songbooks ( id, title, short_name, compiler ) )');
  });
});

describe('sortSources / formatSourceLines', () => {
  it('breaks ties between equal book names by id, in a stable order', () => {
    const rows = [source({ id: 'z', songbooks: book('A') }), source({ id: 'y', songbooks: book('A') })];
    expect(sortSources(rows).map((r) => r.id)).toEqual(['y', 'z']);
  });

  it('sorts book names by the given locale', () => {
    const rows = [source({ id: 'a', songbooks: book('a', { title: 'Zebra' }) }), source({ id: 'b', songbooks: book('b', { title: 'Äpfel' }) })];
    expect(sortSources(rows, 'sv').map((r) => r.id)).toEqual(['a', 'b']); // Swedish: Ä after Z
    expect(sortSources(rows, 'de').map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('lists the primary source first, then the others by book title', () => {
    const rows = [
      source({ id: 'c', songbooks: book('C') }),
      source({ id: 'b', songbooks: book('B'), is_primary: true }),
      source({ id: 'a', songbooks: book('A') }),
    ];
    expect(sortSources(rows).map((r) => r.id)).toEqual(['b', 'a', 'c']);
    expect(formatSourceLines(rows, 'Rise Up', t).map((l) => l.text)).toEqual(['Songbook B', 'Songbook A', 'Songbook C']);
  });

  it('shows nothing for a version without sources, or with undefined (older cached data)', () => {
    expect(formatSourceLines([], 'Rise Up', t)).toEqual([]);
    expect(formatSourceLines(undefined, 'Rise Up', t)).toEqual([]);
    expect(formatSourceLines(null, 'Rise Up', t)).toEqual([]);
  });

  it('does not change the order of the input array', () => {
    const rows = [source({ id: 'b', songbooks: book('B') }), source({ id: 'a', songbooks: book('A'), is_primary: true })];
    sortSources(rows);
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('source copy in every locale', () => {
  it('has all keys with their placeholders', () => {
    const keys: Record<string, string> = {
      'song.source.label': '',
      'song.source.labelMany': '',
      'song.source.page': '{page}',
      'song.source.pages': '{page}',
      'song.source.compiledBy': '{compiler}',
      'song.source.originalTitle': '{title}',
    };
    for (const [locale, dict] of Object.entries(DICTIONARIES)) {
      for (const [key, placeholder] of Object.entries(keys)) {
        const value = (dict as Record<string, string>)[key];
        expect(value, `${locale} ${key}`).toBeTruthy();
        if (placeholder) expect(value, `${locale} ${key}`).toContain(placeholder);
      }
    }
  });
});

describe('locale details', () => {
  it('writes Spanish pages as pág. / págs. and French keeps a non-breaking space before the colon', () => {
    const d = DICTIONARIES as Record<string, Record<string, string>>;
    expect(d.es['song.source.page']).toBe('pág. {page}');
    expect(d.es['song.source.pages']).toBe('págs. {page}');
    expect(d.fr['song.source.originalTitle']).toBe('Titre original\u00A0: {title}');
  });
});
