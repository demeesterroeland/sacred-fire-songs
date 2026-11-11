// @vitest-environment jsdom
// Story 6.2.15 (#518, G4.1): the reader draws ‖: … :‖ (with ×N) around repeated lines, chords on or off.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import SongDisplay from '@/components/song/SongDisplay';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) }),
}));
afterEach(cleanup);

const content = 'Before\n{start_of_repeat}\n[Am]Rise up\n[G]Fire burning\n{end_of_repeat: x2}\nAfter';

describe('SongDisplay: repeat bars', () => {
  it('draws one start bar and one end bar with the count, named for assistive tech', () => {
    render(<SongDisplay content={content} hasChords showChords />);
    const start = screen.getAllByTestId('repeat-start');
    const end = screen.getAllByTestId('repeat-end');
    expect(start).toHaveLength(1);
    expect(end).toHaveLength(1);
    expect(start[0].textContent).toBe('‖:');
    expect(start[0].getAttribute('aria-label')).toBe('song.repeat.start');
    expect(end[0].textContent).toBe(':‖ ×2');
    expect(end[0].getAttribute('aria-label')).toBe('song.repeat.endTimes:{"count":2}');
  });

  it('puts the bars on the right lines and nothing around the others', () => {
    render(<SongDisplay content={content} hasChords showChords />);
    const rows = screen.getAllByTestId('lyric-line');
    expect(rows.map((r) => r.getAttribute('data-repeat'))).toEqual([null, 'start', 'end', null]);
    expect(rows[1].querySelector('[data-testid="repeat-start"]')).not.toBeNull();
    expect(rows[2].querySelector('[data-testid="repeat-end"]')).not.toBeNull();
  });

  it('shows the bars without a count as plain bars', () => {
    render(<SongDisplay content={'{start_of_repeat}\nOne\n{end_of_repeat}'} />);
    expect(screen.getByTestId('repeat-start').textContent).toBe('‖:');
    expect(screen.getByTestId('repeat-end').textContent).toBe(':‖');
    expect(screen.getByTestId('repeat-end').getAttribute('aria-label')).toBe('song.repeat.end');
    expect(screen.getByTestId('lyric-line').getAttribute('data-repeat')).toBe('single');
  });

  it('keeps the bars when the chords layer is off and when the song has no chords', () => {
    const { unmount } = render(<SongDisplay content={content} hasChords showChords={false} />);
    expect(screen.queryAllByTestId('chord')).toHaveLength(0);
    expect(screen.getAllByTestId('repeat-start')).toHaveLength(1);
    expect(screen.getAllByTestId('repeat-end')).toHaveLength(1);
    unmount();
    render(<SongDisplay content={'{start_of_repeat}\nOne\nTwo\n{end_of_repeat}'} hasChords={false} />);
    expect(screen.getAllByTestId('repeat-start')).toHaveLength(1);
    expect(screen.getAllByTestId('repeat-end')).toHaveLength(1);
  });

  it('marks the lines between the bars as inside the repeat', () => {
    render(<SongDisplay content={'{start_of_repeat}\nOne\nTwo\nThree\n{end_of_repeat}'} />);
    expect(screen.getAllByTestId('lyric-line').map((r) => r.getAttribute('data-repeat'))).toEqual(['start', 'inside', 'end']);
  });

  it('draws nothing for a song without a repeat', () => {
    render(<SongDisplay content={'[Am]Hello\nWorld'} hasChords />);
    expect(screen.queryAllByTestId('repeat-start')).toHaveLength(0);
    expect(screen.queryAllByTestId('repeat-end')).toHaveLength(0);
  });
});
