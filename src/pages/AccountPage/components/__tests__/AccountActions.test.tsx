// @vitest-environment jsdom
import { AccountActions } from '@/pages/AccountPage/components/AccountActions';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderActions(overrides: Partial<Parameters<typeof AccountActions>[0]> = {}) {
  const handleSignOut = vi.fn();
  const setIsDeleteModalOpen = vi.fn();
  render(
    <AccountActions
      handleSignOut={handleSignOut}
      isSigningOut={false}
      setIsDeleteModalOpen={setIsDeleteModalOpen}
      localizedPath={(p) => p}
      {...overrides}
    />,
  );
  return { handleSignOut, setIsDeleteModalOpen };
}

describe('AccountActions', () => {
  it('signs out when the sign-out button is clicked', async () => {
    const user = userEvent.setup();
    const { handleSignOut } = renderActions();

    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });

  it('marks the sign-out button busy without leaving the accessibility tree', async () => {
    const user = userEvent.setup();
    const { handleSignOut } = renderActions({ isSigningOut: true });
    const button = screen.getByRole('button', { name: /loading/i }) as HTMLButtonElement;

    // Not natively disabled: that would remove the button from the tree and
    // take aria-busy and the loading label with it.
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');

    // Still refuses activation.
    await user.click(button);
    expect(handleSignOut).not.toHaveBeenCalled();
  });

  it('opens the delete-account modal from the delete button', async () => {
    const user = userEvent.setup();
    const { setIsDeleteModalOpen } = renderActions();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    expect(setIsDeleteModalOpen).toHaveBeenCalledWith(true);
  });

  it('keeps the destructive delete button in the accessibility tree', () => {
    renderActions();
    // The migration must not drop the destructive control from the a11y tree.
    expect(screen.getByRole('button', { name: /delete account/i })).toBeTruthy();
  });
});
