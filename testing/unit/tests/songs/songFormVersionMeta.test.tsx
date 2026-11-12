// @vitest-environment jsdom
// Story 6.2.20 / G5.3 (#523): the edit form changes the beats, the note and (admins) the source of a version (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SongForm from '@/components/song/SongForm';
import { DICTIONARIES } from '@/lib/i18n';
import type { VersionSourceRow } from '@/lib/songs/versionSources';

const dict = DICTIONARIES.en as Record<string, string>;
const hoisted = vi.hoisted(() => ({
  calls: [] as { table: string; op: string; args: unknown[] }[],
  mutationFn: null as null | ((data: unknown) => Promise<unknown>),
  mutate: vi.fn(),
  role: 'member' as string,
}));

const t = (k: string, p?: Record<string, string | number>) =>
  (dict[k] ?? k).replace(/\{(\w+)\}/g, (_m, name) => String(p?.[name] ?? ''));
vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t, locale: 'en' }) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1', role: hoisted.role }, loading: false }) }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: (options: { mutationFn: (data: unknown) => Promise<unknown> }) => {
    hoisted.mutationFn = options.mutationFn;
    return { mutate: hoisted.mutate, isPending: false };
  },
}));
vi.mock('@/components/song/CategorySelector', () => ({ default: () => null }));
vi.mock('@/components/song/ArtistTagInput', () => ({ ArtistTagInput: () => null }));
vi.mock('@/lib/songs/artistUtils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/songs/artistUtils')>()),
  ensureArtistCategoryIds: vi.fn(async () => []),
}));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => {
      const chain: unknown = new Proxy(() => undefined, {
        get: (_target, prop: string) => {
          if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: [], error: null });
          return (...args: unknown[]) => {
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
  hoisted.mutate.mockClear();
  hoisted.role = 'member';
});

const initial = {
  title: 'Morning Sun',
  author: 'Anna Lee',
  content: '[Am]La la',
  categoryIds: [] as string[],
  key: '',
  capo: '',
  tuning: '',
  youtubeLink: '',
  spotifyLink: '',
  soundcloudLink: '',
  melodyNotation: '',
  isPublic: true,
  beats: '8',
  note: 'About the song.\n\nSecond paragraph.',
};
const sources: VersionSourceRow[] = [
  {
    id: 'src1',
    is_primary: true,
    original_title: 'Titre original',
    page: '38',
    songbooks: { id: 'book-a', title: 'Songbook A', compiler: 'Compiler A' },
  },
];
const renderEdit = (extra: Partial<React.ComponentProps<typeof SongForm>> = {}) =>
  render(<SongForm mode="edit" songId="s1" versionId="v1" initialData={initial} sources={sources} songTitle="Morning Sun" {...extra} />);
const versionUpdate = () => hoisted.calls.find((c) => c.table === 'song_versions' && c.op === 'update')?.args[0] as Record<string, unknown>;
const sourceUpdate = () => hoisted.calls.find((c) => c.table === 'song_version_sources' && c.op === 'update');

describe('SongForm — beats and note of a version', () => {
  it('the edit form prefills beats and note', () => {
    renderEdit();
    expect((screen.getByLabelText(dict['songForm.field.beats']) as HTMLInputElement).value).toBe('8');
    expect((screen.getByLabelText(dict['songForm.field.note']) as HTMLTextAreaElement).value).toBe(initial.note);
  });

  it('the create form has neither field', () => {
    render(<SongForm mode="create" />);
    expect(screen.queryByLabelText(dict['songForm.field.beats'])).toBeNull();
    expect(screen.queryByLabelText(dict['songForm.field.note'])).toBeNull();
  });

  it('an untouched form does not rewrite beats or note', async () => {
    renderEdit();
    await hoisted.mutationFn!({ ...initial, content: '[Am]La la la' });
    expect(versionUpdate()).toMatchObject({ content_chordpro: '[Am]La la la' });
    expect(versionUpdate()).not.toHaveProperty('beats');
    expect(versionUpdate()).not.toHaveProperty('song_note');
  });

  it('changing beats from 8 to 6 writes beats only', async () => {
    renderEdit();
    await hoisted.mutationFn!({ ...initial, beats: '6' });
    expect(versionUpdate()).toMatchObject({ beats: '6' });
    expect(versionUpdate()).not.toHaveProperty('song_note');
  });

  it('clearing beats and note writes NULL, not an empty string', async () => {
    renderEdit();
    await hoisted.mutationFn!({ ...initial, beats: '  ', note: ' \n ' });
    expect(versionUpdate()).toMatchObject({ beats: null, song_note: null });
  });

  it('the note keeps its paragraph breaks and is saved as plain text', async () => {
    renderEdit();
    await hoisted.mutationFn!({ ...initial, note: 'One\r\n\r\n<b>Two</b>' });
    expect(versionUpdate()).toMatchObject({ song_note: 'One\n\n<b>Two</b>' });
  });

  it('a beats value that is not a number pattern is refused with a message, before anything is saved', async () => {
    renderEdit();
    fireEvent.change(screen.getByLabelText(dict['songForm.field.beats']), { target: { value: 'waltz' } });
    fireEvent.click(screen.getByRole('button', { name: dict['songForm.publishSong'] }));
    expect(await screen.findByText(dict['songForm.field.beats.invalid'])).toBeTruthy();
    expect(hoisted.mutate).not.toHaveBeenCalled();
  });

  it('an untouched stored value that would fail the check does not block saving', async () => {
    renderEdit({ initialData: { ...initial, beats: 'waltz' } });
    fireEvent.click(screen.getByRole('button', { name: dict['songForm.publishSong'] }));
    await waitFor(() => expect(hoisted.mutate).toHaveBeenCalled());
  });

  it('a note over the limit is refused with a message', async () => {
    renderEdit();
    fireEvent.change(screen.getByLabelText(dict['songForm.field.note']), { target: { value: 'x'.repeat(4001) } });
    fireEvent.click(screen.getByRole('button', { name: dict['songForm.publishSong'] }));
    expect(await screen.findByText(t('songForm.field.note.tooLong', { max: 4000 }))).toBeTruthy();
    expect(hoisted.mutate).not.toHaveBeenCalled();
  });
});

describe('SongForm — source of a version', () => {
  it('shows where the version was printed, read-only, and no correct link for a member', () => {
    renderEdit();
    const line = screen.getByTestId('edit-source-line');
    expect(line.textContent).toContain('Songbook A · p. 38 · compiled by Compiler A');
    expect(line.querySelector('input, textarea')).toBeNull();
    expect(screen.queryByRole('button', { name: dict['songForm.source.correct'] })).toBeNull();
    expect(screen.queryByLabelText(dict['songForm.source.page'])).toBeNull();
  });

  it('shows no source section for a version without sources', () => {
    renderEdit({ sources: [] });
    expect(screen.queryByTestId('edit-source-line')).toBeNull();
  });

  it('an admin sees the correct link, which opens the page and original title of the primary source', () => {
    hoisted.role = 'admin';
    renderEdit();
    const link = screen.getByRole('button', { name: dict['songForm.source.correct'] });
    expect(link.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(link);
    expect(link.getAttribute('aria-expanded')).toBe('true');
    expect((screen.getByLabelText(dict['songForm.source.page']) as HTMLInputElement).value).toBe('38');
    expect((screen.getByLabelText(dict['songForm.source.originalTitle']) as HTMLInputElement).value).toBe('Titre original');
  });

  it('an admin who leaves the source alone writes nothing to song_version_sources', async () => {
    hoisted.role = 'admin';
    renderEdit();
    await hoisted.mutationFn!({ ...initial, sourcePage: '38', sourceOriginalTitle: 'Titre original' });
    expect(sourceUpdate()).toBeUndefined();
  });

  it('an admin who corrects the page writes the page of that source row only', async () => {
    hoisted.role = 'admin';
    renderEdit();
    await hoisted.mutationFn!({ ...initial, sourcePage: ' 39 ', sourceOriginalTitle: 'Titre original' });
    expect(sourceUpdate()?.args[0]).toEqual({ page: '39' });
    expect(hoisted.calls.find((c) => c.table === 'song_version_sources' && c.op === 'eq')?.args).toEqual(['id', 'src1']);
  });

  it('a member never writes to song_version_sources, whatever the data says', async () => {
    renderEdit();
    await hoisted.mutationFn!({ ...initial, sourcePage: '99', sourceOriginalTitle: 'Hacked' });
    expect(sourceUpdate()).toBeUndefined();
  });
});
