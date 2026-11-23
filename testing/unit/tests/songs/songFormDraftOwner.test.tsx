// @vitest-environment jsdom
// #607: the Add Song form ties its draft to the person who is signed in (RTL, L3).
// - signing out while the form is open empties it, so the next person never sees
//   or re-saves the member's text;
// - text typed before the session is known is kept, and a stored draft only fills
//   fields that are still untouched;
// - a guest draft restored after sign-in is stored again under the member.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import SongForm from '@/components/song/SongForm';
import { DICTIONARIES } from '@/lib/i18n';
import { SONG_DRAFT_KEY, writeSongDraft } from '@/lib/songs/songDraft';

const dict = DICTIONARIES.en as Record<string, string>;
const auth = vi.hoisted(() => ({ state: { user: null as null | { id: string }, loading: false } }));

vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => dict[k] ?? k }) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth.state }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/components/song/CategorySelector', () => ({ default: () => null }));
vi.mock('@/components/song/ArtistTagInput', () => ({ ArtistTagInput: () => null }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }));

afterEach(() => {
  cleanup();
  localStorage.clear();
  auth.state = { user: null, loading: false };
});

const title = (c: HTMLElement) => c.querySelector('input[name="title"]') as HTMLInputElement;
const stored = () => JSON.parse(localStorage.getItem(SONG_DRAFT_KEY) ?? 'null');

describe('SongForm draft owner (#607)', () => {
  it('empties the form when the member signs out, and never stores their text as a guest draft', () => {
    auth.state = { user: { id: 'member-a' }, loading: false };
    writeSongDraft({ title: 'Private words' }, 'member-a');
    const { container, rerender } = render(<SongForm mode="create" />);
    expect(title(container).value).toBe('Private words');

    // logout() removes the stored draft, then the session becomes a guest
    localStorage.removeItem(SONG_DRAFT_KEY);
    auth.state = { user: null, loading: false };
    rerender(<SongForm mode="create" />);
    expect(title(container).value).toBe('');

    fireEvent.change(title(container), { target: { value: 'G' } });
    expect(JSON.stringify(stored())).not.toContain('Private words');
  });

  it('keeps text typed before the session is known and fills only untouched fields', () => {
    auth.state = { user: null, loading: true };
    writeSongDraft({ title: 'Old title', content: '[G]Old lyrics' }, 'member-a');
    const { container, rerender } = render(<SongForm mode="create" />);
    fireEvent.change(title(container), { target: { value: 'Typed now' } });

    auth.state = { user: { id: 'member-a' }, loading: false };
    rerender(<SongForm mode="create" />);

    expect(title(container).value).toBe('Typed now');
    expect(stored()).toMatchObject({ owner: 'member-a', draft: { title: 'Typed now', content: '[G]Old lyrics' } });
  });

  it('stores a guest draft under the member who signed in to save it', () => {
    writeSongDraft({ title: 'Guest song' }, null);
    auth.state = { user: { id: 'member-a' }, loading: false };
    const { container } = render(<SongForm mode="create" />);

    expect(title(container).value).toBe('Guest song');
    expect(stored()).toMatchObject({ owner: 'member-a', draft: { title: 'Guest song' } });
  });
});
