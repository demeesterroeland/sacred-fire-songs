// @vitest-environment jsdom
// Story 6.1.34 / G9.2 (#418): the delete confirmation is a real dialog (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

function setup(props: Partial<React.ComponentProps<typeof DeleteConfirmationModal>> = {}) {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} title="Delete take?" message="Remove Take 1?" {...props} />
  );
  return { onClose, onConfirm };
}

describe('DeleteConfirmationModal', () => {
  it('is an alert dialog named by its title and described by its message', () => {
    setup();
    const dialog = screen.getByRole('alertdialog', { name: 'Delete take?' });
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(dialog.textContent).toContain('Remove Take 1?');
  });

  it('moves focus to Cancel (the safe choice) when it opens', async () => {
    setup();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' })));
  });

  it('Escape closes only the confirmation', () => {
    const { onClose } = setup();
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('confirms and cancels with their buttons', () => {
    const { onClose, onConfirm } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close while deleting', () => {
    const { onClose } = setup({ isDeleting: true });
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    setup({ isOpen: false });
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
