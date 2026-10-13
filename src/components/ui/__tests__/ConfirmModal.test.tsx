// @vitest-environment jsdom
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const handlers = { onConfirm: vi.fn(), onCancel: vi.fn(), onDismiss: vi.fn() };
type ConfirmOptions = Record<string, unknown>;
let storeValue: {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss: () => void;
};

vi.mock('@/store/ui/useConfirmStore', () => ({
  useConfirmStore: () => storeValue,
}));

function setup(options: ConfirmOptions = {}, isOpen = true) {
  storeValue = {
    isOpen,
    options: {
      title: 'Delete file?',
      message: 'This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      variant: 'destructive',
      preferredFocus: 'cancel',
      isLoading: false,
      showCloseButton: true,
      ...options,
    },
    ...handlers,
  };
  return render(<ConfirmModal />);
}

describe('ConfirmModal', () => {
  it('exposes an alertdialog named by its title', () => {
    setup();
    // The whole point of the migration: the confirm gate keeps role=alertdialog
    // (not the weaker role=dialog) and stays named by its title.
    expect(screen.getByRole('alertdialog', { name: /delete file/i })).toBeTruthy();
  });

  it('renders nothing when the store is closed', () => {
    setup({}, false);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('fires onConfirm from the confirm action', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(handlers.onConfirm).toHaveBeenCalledTimes(1);
    expect(handlers.onCancel).not.toHaveBeenCalled();
  });

  it('fires onCancel from the cancel action', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Keep' }));
    expect(handlers.onCancel).toHaveBeenCalledTimes(1);
    expect(handlers.onConfirm).not.toHaveBeenCalled();
  });

  it('locks both actions while loading', async () => {
    const user = userEvent.setup();
    setup({ isLoading: true });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Keep' }));
    expect(handlers.onConfirm).not.toHaveBeenCalled();
    expect(handlers.onCancel).not.toHaveBeenCalled();
  });

  it('renders a single full-width action when cancel is suppressed', () => {
    setup({ cancelText: '' });
    expect(screen.queryByRole('button', { name: 'Keep' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
  });

  it('honours preferredFocus on open', async () => {
    setup({ preferredFocus: 'confirm' });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete' }));
    });
  });

  /**
   * The close side of `preferredFocus`. `confirm()` is raised from ~18 call
   * sites and several of them are row-level deletes whose row the confirmed
   * action removes, so the store singleton has no opener left to restore to —
   * `restoreFocusTo` is how the caller names one.
   */
  it('restores focus through restoreFocusTo when the caller is gone', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'after-delete';
    anchor.textContent = 'Next row';
    document.body.append(anchor);

    const { rerender } = setup({ restoreFocusTo: () => document.getElementById('after-delete') });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep' }));
    });

    storeValue = { ...storeValue, isOpen: false };
    rerender(<ConfirmModal />);

    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(anchor);
    });

    anchor.remove();
  });
});
