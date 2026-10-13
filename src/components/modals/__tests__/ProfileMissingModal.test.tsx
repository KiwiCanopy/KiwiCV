// @vitest-environment jsdom
import { ProfileMissingModal } from '@/components/modals/ProfileMissingModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSignOut: vi.fn(),
    onDeleteAccount: vi.fn(),
    isSigningOut: false,
    ...overrides,
  };
  render(<ProfileMissingModal {...props} />);
  return props;
}

describe('ProfileMissingModal', () => {
  it('exposes an accessible dialog named by its title', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /profile not found/i })).toBeTruthy();
  });

  it('signs out from the sign-out button', async () => {
    const user = userEvent.setup();
    const { onSignOut } = renderModal();

    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('triggers account deletion from the delete button', async () => {
    const user = userEvent.setup();
    const { onDeleteAccount } = renderModal();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    expect(onDeleteAccount).toHaveBeenCalledTimes(1);
  });

  it('marks the sign-out button busy without leaving the accessibility tree', async () => {
    const user = userEvent.setup();
    const { onSignOut } = renderModal({ isSigningOut: true });
    const signOut = screen.getByRole('button', { name: /loading/i }) as HTMLButtonElement;

    // Not natively disabled: that would remove it from the tree along with
    // aria-busy and the loading label.
    expect(signOut.disabled).toBe(false);
    expect(signOut.getAttribute('aria-disabled')).toBe('true');
    expect(signOut.getAttribute('aria-busy')).toBe('true');

    await user.click(signOut);
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
