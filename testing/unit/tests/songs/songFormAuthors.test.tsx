// @vitest-environment jsdom
// Story 6.2.12 / G2.3 (#515): the Add/Edit form keeps compositions.authors and original_author together,
// so a catalog song with several authors does not lose them on an edit (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import SongForm from '@/components/song/SongForm';
import { DICTIONARIES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
const hoisted = vi.hoisted(() => ({
  calls: [] as { table: string; op: string; args: unknown[] }[],
  mutationFn: null as null | ((data: unknown) => Promise<unknown>),
}));

vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => dict[k] ?? k }) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' }, loading: false }) }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: (options: { mutationFn: (data: unknown) => Promise<unknown> }) => {
    hoisted.mutationFn = options.mutationFn;
    return { mutate: vi.fn(), isPending: false };
  },
}));
vi.mock('@/components/song/CategorySelector', () => ({ default: () => null }));
// Shows the names the input was given, so the prefill can be asserted.
vi.mock('@/components/song/ArtistTagInput', () => ({
  ArtistTagInput: ({ selectedArtists }: { selectedArtists: string[] }) => (
    <div data-testid="artist-input">{selectedArtists.join('|')}</div>
  ),
}));
vi.mock('@/lib/songs/artistUtils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/songs/artistUtils')>()),
  ensureArtistCategoryIds: vi.fn(async () => []),
}));
// A recording stand-in for the Supabase query builder: every call is logged, every chain resolves.
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => {
      const ops: string[] = [];
      const chain: unknown = new Proxy(() => undefined, {
        get: (_target, prop: string) => {
          if (prop === 'then') {
            return (resolve: (v: unknown) => void) =>
              resolve({ data: ops.includes('single') ? { id: 'c1' } : [], error: null });
          }
          return (...args: unknown[]) => {
            ops.push(prop);
            hoisted.calls.push({ table, op: prop, args });
            return chain;
          };
        },
      });
      return chain;
    },
  }),
}));

afterEach(() => {
  cleanup();
  hoisted.calls.length = 0;
  hoisted.mutationFn = null;
});

const formData = (author: string) => ({
  title: 'Morning Sun',
  author,
  content: '[Am]La la',
  categoryIds: [],
  key: '',
  capo: '',
  tuning: '',
  youtubeLink: '',
  spotifyLink: '',
  soundcloudLink: '',
  melodyNotation: '',
  isPublic: true,
});
const payload = (table: string, op: 'insert' | 'update') =>
  hoisted.calls.find((c) => c.table === table && c.op === op)?.args[0] as Record<string, unknown>;

describe('SongForm — authors', () => {
  it('create writes original_author as typed and authors[] split into names', async () => {
    render(<SongForm mode="create" />);
    await hoisted.mutationFn!(formData('Anna Lee, Ben Cruz / Cari El'));
    expect(payload('compositions', 'insert')).toMatchObject({
      original_author: 'Anna Lee, Ben Cruz / Cari El',
      authors: ['Anna Lee', 'Ben Cruz', 'Cari El'],
    });
  });

  it('create writes an empty authors[] when no author is given', async () => {
    render(<SongForm mode="create" />);
    await hoisted.mutationFn!(formData(''));
    expect(payload('compositions', 'insert')).toMatchObject({ original_author: '', authors: [] });
  });

  it('update writes original_author and authors[] together', async () => {
    render(<SongForm mode="edit" songId="s1" versionId="v1" initialData={formData('Anna Lee')} />);
    await hoisted.mutationFn!(formData('Anna Lee, Ben Cruz'));
    expect(payload('compositions', 'update')).toMatchObject({
      original_author: 'Anna Lee, Ben Cruz',
      authors: ['Anna Lee', 'Ben Cruz'],
    });
  });

  it('an edit that leaves the prefilled author text alone keeps all three authors of a catalog song', async () => {
    // The edit page prefills the input from authors[] (3 names), not only original_author (1 name).
    const { authorInputText } = await import('@/lib/songs/authors');
    const prefill = authorInputText({ authors: ['Anna Lee', 'Ben Cruz', 'Cari El'], originalAuthor: 'Anna Lee' });
    render(<SongForm mode="edit" songId="s1" versionId="v1" initialData={formData(prefill)} />);
    expect(screen.getByTestId('artist-input').textContent).toBe('Anna Lee|Ben Cruz|Cari El');
    await hoisted.mutationFn!(formData(prefill));
    expect(payload('compositions', 'update')).toMatchObject({ authors: ['Anna Lee', 'Ben Cruz', 'Cari El'] });
  });
});
