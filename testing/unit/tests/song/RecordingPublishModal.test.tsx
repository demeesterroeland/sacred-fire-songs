// @vitest-environment jsdom
// Story 6.1.21 / G4.8 (#405): the publish dialog names the song and says who will hear the take,
// so the owner's consent is informed (RTL component test, L3).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';
import RecordingPublishModal from '@/components/song/RecordingPublishModal';
import type { UserRecording } from '@/lib/actions/rehearsal';
import { toast } from 'sonner';

const en = DICTIONARIES.en as Record<string, string>;

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, v?: Record<string, string>) =>
      (en[k] ?? k).replace(/\{(\w+)\}/g, (_, name: string) => v?.[name] ?? `{${name}}`),
  }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const actions = vi.hoisted(() => ({ publishRecording: vi.fn() }));
vi.mock('@/lib/actions/rehearsal', () => actions);

const recording = {
  id: 'r1',
  user_id: 'me',
  song_version_id: 'v1',
  recording_name: 'Morning take',
  storage_path: 'p/r1',
  created_at: '2026-11-05T10:00:00Z',
} as unknown as UserRecording;

function open(props: Partial<React.ComponentProps<typeof RecordingPublishModal>> = {}) {
  const onClose = vi.fn();
  const onPublished = vi.fn();
  render(
    <RecordingPublishModal
      recording={recording}
      isOpen
      onClose={onClose}
      onPublished={onPublished}
      songTitle="Danza del Cielo"
      songIsPublic
      {...props}
    />
  );
  return { onClose, onPublished };
}

const GUESTS = 'Everyone visiting this song, including guests, will be able to listen.';
const confirmName = new RegExp(`^${en['recording.publish.confirmButton']}$`);
const publishButton = () => screen.queryByRole('button', { name: confirmName }) as HTMLButtonElement | null;

beforeEach(() => {
  actions.publishRecording.mockResolvedValue({ success: true });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('RecordingPublishModal (G4.8)', () => {
  it('names the take and the song in the header', () => {
    open();
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('Morning take');
    expect(dialog.textContent).toContain('Danza del Cielo');
  });

  it('says that everyone visiting the song, including guests, can listen', () => {
    open();
    expect(screen.getByTestId('publish-audience').textContent).toBe(GUESTS);
  });

  it('says the owner can make the take private again, without promising to undo what was heard', () => {
    open();
    const text = en['recording.publish.reversible'];
    expect(screen.getByRole('dialog').textContent).toContain(text);
    expect(text).toMatch(/can't undo what someone already heard or saved/);
    expect(text).not.toMatch(/\bURL|link|expire|hour|day/i);
  });

  it('announces the audience sentence when the dialog opens', () => {
    open();
    const describedBy = screen.getByRole('dialog').getAttribute('aria-describedby') ?? '';
    const audience = screen.getByTestId('publish-audience');
    expect(audience.id).not.toBe('');
    expect(describedBy.split(' ')).toContain(audience.id);
  });

  it('reads the audience sentence out as a status, also when it replaces the checking message', () => {
    const { rerender } = render(
      <RecordingPublishModal recording={recording} isOpen onClose={vi.fn()} songTitle="Danza del Cielo" songIsPublic={null} />
    );
    const checking = screen.getByTestId('publish-audience');
    expect(checking.getAttribute('role')).toBe('status');
    expect(checking.textContent).toBe(en['recording.publish.checkingSong']);
    rerender(
      <RecordingPublishModal recording={recording} isOpen onClose={vi.fn()} songTitle="Danza del Cielo" songIsPublic />
    );
    // The same element stays mounted, so the change is announced.
    expect(screen.getByTestId('publish-audience')).toBe(checking);
    expect(checking.textContent).toBe(GUESTS);
  });

  it('publishes only after the consent box is ticked', async () => {
    const { onPublished, onClose } = open();
    const confirm = publishButton()!;
    expect(confirm.disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    await waitFor(() => expect(actions.publishRecording).toHaveBeenCalledWith('r1', true));
    await waitFor(() => expect(onPublished).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it('cancel changes nothing', () => {
    const { onClose } = open();
    fireEvent.click(screen.getByRole('button', { name: en['recording.publish.cancelButton'] }));
    expect(onClose).toHaveBeenCalled();
    expect(actions.publishRecording).not.toHaveBeenCalled();
  });

  it('keeps Cancel and close unavailable while the take is being published', async () => {
    let finish: (v: { success: boolean }) => void = () => undefined;
    actions.publishRecording.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const { onClose } = open();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(publishButton()!);
    await waitFor(() => expect(actions.publishRecording).toHaveBeenCalled());
    const cancel = screen.getByRole('button', { name: en['recording.publish.cancelButton'] }) as HTMLButtonElement;
    expect(cancel.disabled).toBe(true);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    finish({ success: true });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows the server message when publishing is refused', async () => {
    actions.publishRecording.mockResolvedValue({ success: false, code: 'song-private', error: 'English text' });
    const { onClose } = open();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(publishButton()!);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(en['recording.publish.errorSongPrivate']));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('stays reachable on a short phone and wraps long unbroken names', () => {
    open({ songTitle: 'A'.repeat(120) });
    const dialog = screen.getByTestId('publish-dialog');
    expect(dialog.className).toContain('max-h-[calc(100dvh-2rem)]');
    expect(dialog.className).toContain('overflow-y-auto');
    const info = screen.getByTestId('publish-take-info');
    expect(info.className).toContain('min-w-0');
    for (const line of Array.from(info.querySelectorAll('p'))) {
      expect(line.className).toContain('[overflow-wrap:anywhere]');
    }
    expect(dialog.querySelector('[data-slot="dialog-header"]')!.className).toContain('min-w-0');
  });
});

describe('RecordingPublishModal on a private song (G4.8: the song comes first)', () => {
  it('says the song is private and must be made public first, and cannot be published', () => {
    open({ songIsPublic: false });
    const audience = screen.getByTestId('publish-audience').textContent ?? '';
    expect(audience).toBe(en['recording.publish.descriptionPrivateSong']);
    expect(audience).not.toContain('including guests');
    expect(audience).toMatch(/private/i);
    expect(audience).toMatch(/public first/i);
    expect(publishButton()).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
    // Header stays: take and song named.
    expect(screen.getByRole('dialog').textContent).toContain('Danza del Cielo');
  });

  it('offers the existing make-song-public path to the owner and then allows publishing', async () => {
    const onMakeSongPublic = vi.fn().mockResolvedValue(true);
    open({ songIsPublic: false, canMakeSongPublic: true, onMakeSongPublic });
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain(en['recording.sharing.privateSongPrompt.effectLyrics']);
    expect(dialog.textContent).toContain(en['recording.sharing.privateSongPrompt.effectPublicTakes']);
    expect(dialog.textContent).toContain(en['recording.sharing.privateSongPrompt.note']);
    fireEvent.click(screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] }));
    await waitFor(() => expect(onMakeSongPublic).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId('publish-audience').textContent).toBe(GUESTS));
    expect(publishButton()).not.toBeNull();
    expect(publishButton()!.disabled).toBe(true);
    expect(actions.publishRecording).not.toHaveBeenCalled();
  });

  it('stays private when making the song public fails', async () => {
    const onMakeSongPublic = vi.fn().mockResolvedValue(false);
    open({ songIsPublic: false, canMakeSongPublic: true, onMakeSongPublic });
    fireEvent.click(screen.getByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] }));
    await waitFor(() => expect(onMakeSongPublic).toHaveBeenCalled());
    expect(screen.getByTestId('publish-audience').textContent).toBe(en['recording.publish.descriptionPrivateSong']);
    expect(publishButton()).toBeNull();
  });

  it('tells someone who is not the song owner to ask the owner', () => {
    open({ songIsPublic: false, canMakeSongPublic: false });
    expect(screen.getByRole('dialog').textContent).toContain(en['recording.publish.privateSong.notOwner']);
    expect(screen.queryByRole('button', { name: en['recording.sharing.privateSongPrompt.confirm'] })).toBeNull();
    expect(publishButton()).toBeNull();
  });

  it('waits with the confirm unavailable until the visibility of the song is known', () => {
    open({ songIsPublic: null });
    expect(screen.getByTestId('publish-audience').textContent).toBe(en['recording.publish.checkingSong']);
    expect(publishButton()).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('says so and cannot publish when the visibility of the song could not be read', () => {
    open({ songIsPublic: null, visibilityUnreadable: true });
    expect(screen.getByTestId('publish-audience').textContent).toBe(en['recording.publish.checkFailed']);
    expect(screen.queryByTestId('publish-make-song-public')).toBeNull();
    expect(publishButton()).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});
