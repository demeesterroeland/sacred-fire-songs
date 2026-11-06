// @vitest-environment jsdom
// Story 6.1.34 / G9.2 (#418): Escape belongs to a widget that is busy with it (a keyboard drag) before the dialog.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { useModalFocus } from '@/hooks/useModalFocus';

afterEach(cleanup);

function Dialog({ onEscape, escapeBusy }: { onEscape: () => void; escapeBusy?: () => boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useModalFocus({ open: true, containerRef: ref, onEscape, escapeBusy });
  return (
    <div ref={ref} tabIndex={-1} data-testid="dlg">
      <button>inside</button>
    </div>
  );
}

describe('useModalFocus Escape', () => {
  it('closes on Escape', () => {
    const onEscape = vi.fn();
    const { getByText } = render(<Dialog onEscape={onEscape} />);
    getByText('inside').focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not close while a widget inside is busy with Escape (a keyboard drag), then closes again', () => {
    const onEscape = vi.fn();
    let busy = true;
    const { getByText } = render(<Dialog onEscape={onEscape} escapeBusy={() => busy} />);
    getByText('inside').focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
    busy = false;
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
