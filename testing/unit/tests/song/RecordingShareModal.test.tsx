// @vitest-environment jsdom
// Story 6.1.18 / G4.5 (#402): the Share dialog explains who can be found and what sharing a take
// on a private song does, and changes nothing until the owner confirms (RTL component test, L3).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';
import { toast } from 'sonner';
import RecordingShareModal from '@/components/song/RecordingShareModal';
import type { UserRecording } from '@/lib/actions/rehearsal';

const en = DICTIONARIES.en as Record<string, string>;

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, v?: Record<string, string>) =>
      (en[k] ?? k).replace(/\{(\w+)\}/g, (_, name: string) => v?.[name] ?? `{${name}}`),
  }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const actions = vi.hoisted(() => ({
  searchUsersForSharing: vi.fn(),
  shareRecording: vi.fn(),
  unshareRecording: vi.fn(),
}));
vi.mock('@/lib/actions/rehearsal', () => actions);

const recording = {
  id: 'r1',
  user_id: 'me',
  song_version_id: 'v1',
  recording_name: 'Morning take',
  storage_path: 'p/r1',
  created_at: '2026-11-05T10:00:00Z',
  shared_with: [],
} as unknown as UserRecording;

function open(props: Partial<React.ComponentProps<typeof RecordingShareModal>> = {}) {
  const onClose = vi.fn();
  const onMakeSongPublic = vi.fn().mockResolvedValue(true);
  render(
    <RecordingShareModal
      recording={recording}
      isOpen
      onClose={onClose}
      songIsPublic={false}
      canMakeSongPublic
      onMakeSongPublic={onMakeSongPublic}
      {...props}
    />
  );
  return { onClose, onMakeSongPublic };
}

beforeEach(() => {
  actions.searchUsersForSharing.mockResolvedValue([]);
  actions.shareRecording.mockResolvedValue({ success: true });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const searchInput = () => screen.queryByPlaceholderText(en['recording.sharing.searchPlaceholder']);

describe('Share dialog on a private song (owner)', () => {
  it('lists both effects and changes nothing until confirmed', () => {
    const { onMakeSongPublic } = open();
    expect(screen.getByText(en['recording.sharing.privateSongPrompt.title'])).toBeTruthy();
    expect(screen.getByText(en['recording.sharing.privateSongPrompt.effectLyrics'])).toBeTruthy();
    expect(
      screen.getByText(en['recording.sharing.privateSongPrompt.effectTake'].replace('{name}', 'Morning take'))
    ).toBeTruthy();
    expect(screen.getByText(en['recording.sharing.privateSongPrompt.note'])).toBeTruthy();
    expect(searchInput()).toBeNull();
    expect(onMakeSongPublic).not.toHaveBeenCalled();
    expect(actions.shareRecording).not.toHaveBeenCalled();
  });

  it('makes the song public on confirm and then shows the member search', async () => {
    const { onMakeSongPublic } = open();
    fireEvent.click(screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] }));
    await waitFor(() => expect(searchInput()).not.toBeNull());
    expect(onMakeSongPublic).toHaveBeenCalledTimes(1);
  });

  it('stays on the confirmation when making the song public fails', async () => {
    const { onMakeSongPublic } = open({ onMakeSongPublic: vi.fn().mockResolvedValue(false) });
    fireEvent.click(screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] }));
    await waitFor(() => expect(screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] })).toBeTruthy());
    expect(searchInput()).toBeNull();
    void onMakeSongPublic;
  });

  it('names the step in the dialog title', () => {
    open();
    expect(screen.getByRole('heading', { name: en['recording.sharing.privateSongPrompt.title'] })).toBeTruthy();
  });

  it('moves focus to the member search once the song is public', async () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] }));
    await waitFor(() => expect(document.activeElement).toBe(searchInput()));
    expect(screen.getByRole('heading', { name: en['recording.sharing.title'] })).toBeTruthy();
  });

  it('ignores a second tap while the song is being made public', async () => {
    let resolve!: (v: boolean) => void;
    const onMakeSongPublic = vi.fn(() => new Promise<boolean>((r) => (resolve = r)));
    open({ onMakeSongPublic });
    const confirm = screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(onMakeSongPublic).toHaveBeenCalledTimes(1);
    resolve(true);
    await waitFor(() => expect(searchInput()).not.toBeNull());
  });

  it('shows an error and stays on the confirmation when making the song public throws', async () => {
    open({ onMakeSongPublic: vi.fn().mockRejectedValue(new Error('network')) });
    fireEvent.click(screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(en['recording.sharing.error']));
    expect(searchInput()).toBeNull();
  });

  it('closes without changes on cancel', () => {
    const { onClose, onMakeSongPublic } = open();
    fireEvent.click(screen.getByRole('button', { name: en['common.cancel'] }));
    expect(onClose).toHaveBeenCalled();
    expect(onMakeSongPublic).not.toHaveBeenCalled();
  });
});

describe('Share dialog on a private song (not the song owner)', () => {
  it('explains why sharing is not possible instead of offering the search', () => {
    const { onMakeSongPublic } = open({ canMakeSongPublic: false });
    expect(screen.getByText(en['recording.sharing.privateSongPrompt.notOwnerTitle'])).toBeTruthy();
    expect(screen.getByText(en['recording.sharing.privateSongPrompt.notOwner'])).toBeTruthy();
    expect(searchInput()).toBeNull();
    expect(screen.queryByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] })).toBeNull();
    expect(onMakeSongPublic).not.toHaveBeenCalled();
  });
});

describe('Share dialog on a public song', () => {
  it('says who can be found and shows the empty state with the sign-up hint', async () => {
    open({ songIsPublic: true });
    expect(screen.getByText(en['recording.sharing.helper'])).toBeTruthy();
    expect(screen.queryByText(en['recording.sharing.privateSongPrompt.title'])).toBeNull();
    fireEvent.change(searchInput()!, { target: { value: 'zzz' } });
    const empty = en['recording.sharing.noResults'].replace('{query}', 'zzz');
    await waitFor(() => expect(screen.getByText(empty)).toBeTruthy());
  });

  it('shows no empty state before two characters are typed', () => {
    open({ songIsPublic: true });
    fireEvent.change(searchInput()!, { target: { value: 'z' } });
    expect(screen.queryByText(/No registered member found/)).toBeNull();
  });
});
