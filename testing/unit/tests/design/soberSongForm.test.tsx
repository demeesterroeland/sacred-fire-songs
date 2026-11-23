// @vitest-environment jsdom
// Story 6.1.35 (#485), group 7 — docs/testing/ux-v2-sober-song-form.feature. The Add / Edit song form, the media
// embeds and the song skeleton use semantic tokens only: no palette classes, one accent button (Publish),
// "Save as private" is a neutral secondary, link icons carry no brand colour.
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import SongForm from '@/components/song/SongForm';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import { DICTIONARIES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => dict[k] ?? k }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' }, loading: false }) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/components/song/CategorySelector', () => ({ default: () => null }));
vi.mock('@/components/song/ArtistTagInput', () => ({ ArtistTagInput: () => null }));

const ROOT = path.resolve(__dirname, '../../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const FILES = [
  'components/song/SongForm.tsx',
  'components/song/MediaEmbeds.tsx',
  'components/song/YouTubeEmbed.tsx',
  'components/song/SongDetailSkeleton.tsx',
];

afterEach(cleanup);

describe('song form files use semantic tokens', () => {
  it.each(FILES)('%s has no palette classes', (file) => {
    expect(countPaletteClasses(read(file))).toBe(0);
  });

  it.each(FILES)('%s has no glow or heavy shadow', (file) => {
    expect(read(file)).not.toMatch(/shadow-(xl|2xl|lg)|shadow-red|brightness-110/);
  });

  it('link-field and embed icons are neutral, not brand colours', () => {
    expect(read('components/song/SongForm.tsx')).not.toMatch(/#ff0000|#1db954|#ff5500/i);
    expect(read('components/song/MediaEmbeds.tsx')).not.toMatch(/\[#ff5500\]|\[#1db954\]|text-red-500/);
  });
});

describe('SongForm actions', () => {
  it('Publish is the single accent button; Save as private is a neutral outline', () => {
    render(<SongForm mode="create" />);
    const publish = screen.getByRole('button', { name: dict['songForm.publishSong'] });
    const draft = screen.getByRole('button', { name: dict['songForm.saveAsDraft'] });
    expect(publish.className).toContain('bg-accent');
    expect(publish.className).toContain('text-on-accent');
    expect(draft.className).not.toContain('bg-accent');
    expect(draft.className).toContain('border-line-strong');
    expect(publish.className).toContain('min-h-tap');
    expect(draft.className).toContain('min-h-tap');
    const accentButtons = [...document.querySelectorAll('form button')].filter((b) => b.className.includes('bg-accent'));
    expect(accentButtons).toHaveLength(1);
  });

  it('text inputs use bg-surface and border-line-strong', () => {
    const { container } = render(<SongForm mode="create" />);
    const title = container.querySelector('#title') as HTMLInputElement;
    expect(title.className).toContain('bg-surface');
    expect(title.className).toContain('border-line-strong');
    expect(title.className).toContain('rounded-control');
  });
});
