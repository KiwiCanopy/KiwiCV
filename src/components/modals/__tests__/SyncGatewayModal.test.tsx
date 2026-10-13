// @vitest-environment jsdom
import { SyncGatewayModal } from '@/components/modals/SyncGatewayModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onConnectGitHub: vi.fn(),
    onConnectGoogle: vi.fn(),
    ...overrides,
  };
  render(<SyncGatewayModal {...props} />);
  return props;
}

describe('SyncGatewayModal', () => {
  it('exposes an accessible dialog with its title', () => {
    renderModal();
    // DialogFrame names the dialog via its title — the migration must keep it.
    expect(screen.getByRole('dialog', { name: /cloud sync/i })).toBeTruthy();
  });

  it('connects GitHub from the GitHub option', async () => {
    const user = userEvent.setup();
    const { onConnectGitHub } = renderModal();

    await user.click(screen.getByRole('button', { name: /github sync/i }));
    expect(onConnectGitHub).toHaveBeenCalledTimes(1);
  });

  it('closes from the cancel button', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
