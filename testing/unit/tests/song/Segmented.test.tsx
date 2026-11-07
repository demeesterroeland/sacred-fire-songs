// @vitest-environment jsdom
// Story 6.1.11 / G2.6 (#395): the segmented control is a radio group with roving tabindex (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Segmented } from '@/components/ui/segmented';

afterEach(cleanup);

const options = [
  { value: 'a', label: 'Original' },
  { value: 'b', label: 'Simplified' },
  { value: 'c', label: 'Live' },
];

function setup(value = 'a', onChange = vi.fn()) {
  render(<Segmented aria-label="Song version" options={options} value={value} onChange={onChange} />);
  return { onChange, radios: screen.getAllByRole('radio') };
}

describe('Segmented', () => {
  it('is a labelled radio group; the current segment is checked', () => {
    const { radios } = setup('b');
    expect(screen.getByRole('radiogroup', { name: 'Song version' })).toBeTruthy();
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(radios.some((r) => r.hasAttribute('aria-pressed'))).toBe(false);
  });

  it('has one tab stop: only the checked segment is tabbable', () => {
    const { radios } = setup('b');
    expect(radios.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('raises the pressed segment with a hairline ring and an underline on its label', () => {
    const { radios } = setup('a');
    expect(radios[0].className).toContain('ring-1');
    expect(radios[0].className).toContain('ring-line');
    expect(radios[1].className).not.toContain('ring-1');
    expect(radios[0].querySelector('span')!.className).toContain('underline');
  });

  it('has no redundant title tooltip', () => {
    const { radios } = setup();
    expect(radios.some((r) => r.hasAttribute('title'))).toBe(false);
  });

  it('ArrowRight / ArrowLeft move the selection and the focus, wrapping around', () => {
    const { onChange, radios } = setup('a');
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('b');
    fireEvent.keyDown(radios[0], { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('c');
    expect(document.activeElement).toBe(radios[2]);
  });

  it('Home and End jump to the first and last segment', () => {
    const { onChange, radios } = setup('b');
    fireEvent.keyDown(radios[1], { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('c');
    fireEvent.keyDown(radios[1], { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('ignores other keys and a click on the checked segment', () => {
    const { onChange, radios } = setup('a');
    fireEvent.keyDown(radios[0], { key: 'Enter' });
    fireEvent.keyDown(radios[0], { key: 'a' });
    fireEvent.click(radios[0]);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(radios[2]);
    expect(onChange).toHaveBeenCalledWith('c');
  });
});
