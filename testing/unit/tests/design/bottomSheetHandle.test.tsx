// @vitest-environment jsdom
// Story 6.1.17 / G4.4 (#401): the shared bottom sheet has a 32 px handle that closes it on a swipe down.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';

afterEach(cleanup);

function Sheet({ onOpenChange }: { onOpenChange: (o: boolean) => void }) {
  return (
    <BottomSheet open onOpenChange={onOpenChange}>
      <BottomSheetContent title="Actions">
        <button type="button">One</button>
      </BottomSheetContent>
    </BottomSheet>
  );
}

const handle = () => screen.getByRole('dialog').querySelector('[data-sheet-handle]') as HTMLElement;

describe('BottomSheet handle', () => {
  it('is 32 px tall and only shown on phones', () => {
    render(<Sheet onOpenChange={() => undefined} />);
    expect(handle().className).toContain('h-8');
    expect(handle().className).toContain('sm:hidden');
  });

  it('closes after a swipe down on the handle', () => {
    const calls: boolean[] = [];
    render(<Sheet onOpenChange={(o) => calls.push(o)} />);
    fireEvent.pointerDown(handle(), { pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(handle(), { pointerId: 1, clientY: 150 });
    fireEvent.pointerUp(handle(), { pointerId: 1, clientY: 240 });
    expect(calls).toEqual([false]);
  });

  it('stays open after a tap or a small drag', () => {
    const calls: boolean[] = [];
    render(<Sheet onOpenChange={(o) => calls.push(o)} />);
    fireEvent.pointerDown(handle(), { pointerId: 1, clientY: 100 });
    fireEvent.pointerUp(handle(), { pointerId: 1, clientY: 104 });
    expect(calls).toEqual([]);
  });
});
