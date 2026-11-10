// @vitest-environment jsdom
// Story 6.1.31 / G8.2 (#415): the lyrics section of Add Song — Preview toggle and Upload (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SongForm from '@/components/song/SongForm';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => dict[k] ?? k }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
let authLoading = false;
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' }, loading: authLoading }) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/components/song/CategorySelector', () => ({ default: () => null }));
vi.mock('@/components/song/ArtistTagInput', () => ({ ArtistTagInput: () => null }));

const MAX_BYTES = 512 * 1024;

function makeFile(bytes: Uint8Array, name = 'song.cho') {
  const file = new File([bytes as BlobPart], name, { type: 'text/plain' });
  // jsdom's File has no arrayBuffer(); real browsers do.
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn(async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)),
  });
  return file;
}
const utf8 = (s: string) => new TextEncoder().encode(s);

function setup() {
  const view = render(<SongForm mode="create" />);
  const textarea = view.container.querySelector('form textarea') as HTMLTextAreaElement;
  const input = screen.getByTestId('song-file-input') as HTMLInputElement;
  return { ...view, textarea, input };
}

function choose(input: HTMLInputElement, file: File) {
  return act(async () => {
    fireEvent.change(input, { target: { files: [file] } });
  });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

describe('SongForm lyrics tools', () => {
  it('Preview flips aria-pressed and the textarea stays in the DOM with its value', () => {
    const { textarea } = setup();
    fireEvent.change(textarea, { target: { value: '[Dm]Abre tus alas' } });
    const toggle = screen.getByRole('button', { name: 'Preview' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(textarea.isConnected).toBe(true);
    expect(textarea.value).toBe('[Dm]Abre tus alas');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(textarea.isConnected).toBe(true);
    expect(textarea.value).toBe('[Dm]Abre tus alas');
  });

  it('shows the current text at once when Preview is switched on (not the 200 ms old one)', () => {
    vi.useFakeTimers();
    const { textarea } = setup();
    fireEvent.change(textarea, { target: { value: '[Dm]Abre tus alas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    // No timers advanced: the debounce has not fired yet.
    expect(screen.getByTestId('chord').textContent).toBe('Dm');
  });

  it('puts Preview and Upload side by side in a two-column grid, labels may wrap inside the button', () => {
    setup();
    const tools = screen.getByTestId('lyrics-tools');
    expect(tools.className).toMatch(/\bgrid\b/);
    expect(tools.className).toMatch(/\bgrid-cols-2\b/);
    expect(tools.className).not.toMatch(/\bflex-wrap\b/);
    for (const name of ['Preview', 'Upload .cho / .txt']) {
      const b = screen.getByRole('button', { name });
      expect(b.className).toMatch(/\bmin-w-0\b/);
      expect(b.className).toMatch(/\bwhitespace-normal\b/);
      expect(b.className).toMatch(/\bmin-h-tap\b/);
    }
  });

  it('makes the scrollable preview reachable by keyboard and gives it a name', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    const region = screen.getByRole('region', { name: 'Preview of your song' });
    expect(region.getAttribute('tabindex')).toBe('0');
  });

  it('keeps Save and Publish disabled until the session is known, so a tap is never silently dropped', () => {
    authLoading = true;
    try {
      const { container } = render(<SongForm mode="create" />);
      const submits = Array.from(container.querySelectorAll<HTMLButtonElement>('button[type="submit"]'));
      expect(submits).toHaveLength(2);
      expect(submits.every((b) => b.disabled)).toBe(true);
    } finally {
      authLoading = false;
    }
  });

  it('Upload opens the file picker', () => {
    const { input } = setup();
    const click = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Upload .cho / .txt' }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('fills the form from a UTF-8 file and lets the same file be chosen again', async () => {
    const { input, textarea } = setup();
    const value = vi.fn();
    Object.defineProperty(input, 'value', { configurable: true, get: () => '', set: value });
    await choose(input, makeFile(utf8('{title: Canción}\n[Am]Hola ñandú\n')));
    expect(textarea.value).toContain('Hola ñandú');
    expect((document.getElementById('title') as HTMLInputElement).value).toBe('Canción');
    expect(value).toHaveBeenCalledWith('');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('falls back to windows-1252 when the file is not valid UTF-8', async () => {
    const { input, textarea } = setup();
    // "Canción" in Latin-1: 0xF3 alone is invalid UTF-8.
    const latin1 = Uint8Array.from([...'[Am]Canci'].map((c) => c.charCodeAt(0)).concat([0xf3, 0x6e]));
    await choose(input, makeFile(latin1));
    expect(textarea.value).toContain('Canción');
  });

  it('shows a role=alert when reading rejects and still resets the file input', async () => {
    const { input } = setup();
    const value = vi.fn();
    Object.defineProperty(input, 'value', { configurable: true, get: () => '', set: value });
    const file = makeFile(utf8('x'));
    (file.arrayBuffer as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('denied'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await choose(input, file);
    expect((await screen.findByRole('alert')).textContent).toBe(dict['songForm.upload.error']);
    expect(value).toHaveBeenCalledWith('');
  });

  it('rejects a file larger than 512 KB without reading it', async () => {
    const { input, textarea } = setup();
    const file = makeFile(new Uint8Array(MAX_BYTES + 1).fill(97));
    await choose(input, file);
    expect((await screen.findByRole('alert')).textContent).toBe(dict['songForm.upload.tooLarge']);
    expect(file.arrayBuffer).not.toHaveBeenCalled();
    expect(textarea.value).toBe('');
  });

  it('accepts a file of exactly 512 KB', async () => {
    const { input, textarea } = setup();
    await choose(input, makeFile(new Uint8Array(MAX_BYTES).fill(97)));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(textarea.value.length).toBe(MAX_BYTES);
  });

  it('clears the upload error when Upload is clicked again', async () => {
    const { input } = setup();
    await choose(input, makeFile(new Uint8Array(MAX_BYTES + 1)));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Upload .cho / .txt' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears the upload error when the lyrics change', async () => {
    const { input, textarea } = setup();
    await choose(input, makeFile(new Uint8Array(MAX_BYTES + 1)));
    await screen.findByRole('alert');
    fireEvent.change(textarea, { target: { value: '[C]x' } });
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('leaves the preview when saving is refused, so the invalid field can take focus', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.getByRole('button', { name: 'Preview' }).getAttribute('aria-pressed')).toBe('true');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: dict['songForm.publishSong'] }));
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Preview' }).getAttribute('aria-pressed')).toBe('false'),
    );
  });

  it('has the size error in every language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      expect(d['songForm.upload.tooLarge'], `${locale} songForm.upload.tooLarge`).toBeTruthy();
    }
  });
});
