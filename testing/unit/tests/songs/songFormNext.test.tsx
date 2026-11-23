// @vitest-environment jsdom
// #600: Add Song keeps an incoming next= when a guest signs in from the draft banner or on save.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import SongForm from '@/components/song/SongForm';
import { DICTIONARIES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => dict[k] ?? k }) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams('next=/library/playlists/p1'),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, loading: false }) }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/components/song/CategorySelector', () => ({ default: () => null }));
vi.mock('@/components/song/ArtistTagInput', () => ({ ArtistTagInput: () => null }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }));

afterEach(cleanup);

describe('SongForm next= (#600)', () => {
  it('the guest draft banner returns to Add Song with the incoming next', () => {
    render(<SongForm mode="create" />);
    const link = screen.getByRole('link', { name: dict['songForm.guestDraft.signIn'] });
    const next = new URL(link.getAttribute('href')!, 'http://x.test').searchParams.get('next');
    expect(next).toBe('/songs/add?next=%2Flibrary%2Fplaylists%2Fp1');
  });
});
