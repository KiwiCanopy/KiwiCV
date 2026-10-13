// @vitest-environment jsdom
import { TranslationInviteModal } from '@/components/modals/TranslationInviteModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<TranslationInviteModal {...props} />);
  return props;
}

describe('TranslationInviteModal', () => {
  it('exposes an accessible dialog named by its title', () => {
    renderModal();
    // DialogFrameTitle inside the header slot is the dialog's one accessible name.
    expect(screen.getByRole('dialog', { name: /global opportunities/i })).toBeTruthy();
  });

  it('confirms from the primary action', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderModal();

    await user.click(screen.getByRole('button', { name: /let.?s do it/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes from the manual (secondary) action', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: /manually/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
