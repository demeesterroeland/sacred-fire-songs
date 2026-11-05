// @vitest-environment jsdom
// Story 6.1.17 / G4.4 (#401): the take actions open as a grouped bottom sheet (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import TakeActionsSheet, { type TakeActionHandlers } from '@/components/song/TakeActionsSheet';
import type { UserRecording } from '@/lib/actions/rehearsal';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));

afterEach(cleanup);

const take = (over: Partial<UserRecording> = {}): UserRecording => ({
  id: 't1',
  user_id: 'u1',
  song_version_id: 'v1',
  recording_name: 'Verse in D',
  storage_path: 'u1/t1.webm',
  created_at: '2026-11-05T10:00:00Z',
  audioUrl: 'https://example.org/t1.webm',
  is_owner: true,
  ...over,
});

const handlers = (): TakeActionHandlers => ({
  play: vi.fn(),
  rename: vi.fn(),
  download: vi.fn(),
  share: vi.fn(),
  singer: vi.fn(),
  visibility: vi.fn(),
  copyLink: vi.fn(),
  delete: vi.fn(),
});

function open(over: Partial<UserRecording> = {}, on = handlers(), extra: { isPlaying?: boolean; onOpenChange?: (o: boolean) => void } = {}) {
  render(
    <TakeActionsSheet
      take={take(over)}
      open
      onOpenChange={extra.onOpenChange ?? (() => undefined)}
      isPlaying={extra.isPlaying ?? false}
      on={on}
    />
  );
  return { on, dialog: screen.getByRole('dialog') };
}

describe('TakeActionsSheet', () => {
  it('opens a bottom sheet titled with the take name', () => {
    const { dialog } = open();
    expect(within(dialog).getByText('Verse in D')).toBeTruthy();
  });

  it('lists the actions in groups with Delete alone at the bottom', () => {
    const { dialog } = open();
    const labels = within(dialog).getAllByRole('button').map((b) => b.textContent?.trim());
    expect(labels).toEqual([
      'Play',
      'Edit take name',
      'Download take',
      'Share',
      'Singer Attribution',
      'Make Public',
      'Copy link',
      'Delete take',
    ]);
    // Exactly one separator before Delete, and one between the two upper groups.
    const separators = within(dialog).getAllByRole('separator');
    expect(separators).toHaveLength(2);
    const delBtn = within(dialog).getByRole('button', { name: 'Delete take' });
    const dangerGroup = delBtn.closest('[role="group"]') as HTMLElement;
    expect(dangerGroup.previousElementSibling).toBe(separators[1]);
    expect(within(dangerGroup).getAllByRole('button')).toEqual([delBtn]);
  });

  it('keeps every action row at least 44 px tall and Delete in the danger colour', () => {
    const { dialog } = open();
    for (const b of within(dialog).getAllByRole('button')) {
      expect(b.className, b.textContent ?? '').toContain('min-h-tap');
    }
    expect(within(dialog).getByRole('button', { name: 'Delete take' }).className).toContain('text-danger');
    expect(within(dialog).getByRole('button', { name: 'Share' }).className).not.toContain('text-danger');
  });

  it('offers a 32 px drag handle', () => {
    const { dialog } = open();
    const handle = dialog.querySelector('[data-sheet-handle]') as HTMLElement;
    expect(handle).toBeTruthy();
    expect(handle.className).toContain('h-8');
  });

  it('says Pause while the take plays and Make Private when it is public', () => {
    const { dialog } = open({ is_public: true }, handlers(), { isPlaying: true });
    expect(within(dialog).getByRole('button', { name: 'Pause' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Make Private' })).toBeTruthy();
  });

  it('shows the share count next to Share', () => {
    const { dialog } = open({
      shared_with: [
        { id: 's1', user_id: 'a', email: 'a@example.org', full_name: null },
        { id: 's2', user_id: 'b', email: 'b@example.org', full_name: null },
      ],
    });
    expect(within(within(dialog).getByRole('button', { name: /^Share/ })).getByText('2')).toBeTruthy();
  });

  it('disables Play and Download while the audio file is missing', () => {
    const { dialog } = open({ audioUrl: undefined });
    expect((within(dialog).getByRole('button', { name: /^Play|missing/i }) as HTMLButtonElement).disabled).toBe(true);
    expect((within(dialog).getByRole('button', { name: 'Download take' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('closes the sheet, then runs the chosen action once', async () => {
    const on = handlers();
    function Harness() {
      const [isOpen, setOpen] = useState(true);
      return <TakeActionsSheet take={take()} open={isOpen} onOpenChange={setOpen} isPlaying={false} on={on} />;
    }
    render(<Harness />);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete take' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(on.delete).toHaveBeenCalledTimes(1));
    expect(on.share).not.toHaveBeenCalled();
  });

  it('shows only Play for a take shared with me', () => {
    const { dialog } = open({ is_owner: false, is_shared: true });
    expect(within(dialog).getAllByRole('button')).toHaveLength(1);
    expect(within(dialog).queryByRole('separator')).toBeNull();
  });
});

describe('copy', () => {
  it('needs no new texts, and the used keys exist in every language', () => {
    const keys = [
      'rehearsal.recording.play',
      'rehearsal.recording.pause',
      'rehearsal.recording.edit.ariaLabel',
      'rehearsal.recording.download.ariaLabel',
      'recording.sharing.button',
      'recording.attribution.button',
      'recording.publish.makePublic',
      'recording.publish.makePrivate',
      'rehearsal.recording.copyLink',
      'rehearsal.recording.delete.ariaLabel',
      'common.moreActions',
    ];
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      for (const k of keys) expect(d[k], `${locale} ${k}`).toBeTruthy();
    }
  });
});
