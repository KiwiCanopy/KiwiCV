// @vitest-environment jsdom
import { AuthView } from '@/components/auth/AuthView';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let resolveSignin: (() => void) | undefined;
const googleSignin = vi.fn(() => new Promise<void>((resolve) => (resolveSignin = resolve)));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ googleSignin }) }));
// `useLanguage` reads the locale from the pathname now, not a `:lang` param.
vi.mock('react-router-dom', () => ({ useLocation: () => ({ pathname: '/' }) }));

function renderView() {
  return render(<AuthView variant="inline" />);
}

describe('AuthView consent gate', () => {
  beforeEach(() => {
    googleSignin.mockClear();
    resolveSignin = undefined;
  });

  it('keeps the sign-in button inert and explained until both policies are accepted', async () => {
    const user = userEvent.setup();
    renderView();

    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    // The reason is shown, not hidden in a title tooltip — and it is wired to
    // the button so a screen reader announces why it cannot be pressed.
    expect(screen.getByText(/Please accept the Terms of Service/i)).toBeTruthy();

    await user.click(button);
    expect(googleSignin).not.toHaveBeenCalled();
  });

  it('signs in with both consents once the boxes are checked', async () => {
    const user = userEvent.setup();
    renderView();

    for (const box of screen.getAllByRole('checkbox')) {
      await user.click(box);
    }

    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(button.getAttribute('aria-disabled')).toBeNull();

    await user.click(button);
    expect(googleSignin).toHaveBeenCalledWith(true, true, { requireDrive: false });
  });

  it('stays inert while a sign-in is in flight and shows no consent reason', async () => {
    const user = userEvent.setup();
    renderView();

    for (const box of screen.getAllByRole('checkbox')) {
      await user.click(box);
    }
    const button = screen.getByRole('button', { name: /Signing in|Sign in with Google/i });
    await user.click(button);

    expect(button.getAttribute('aria-busy')).toBe('true');
    // The consent reason must not leak back in during loading, and a second
    // click must not start a second sign-in.
    expect(screen.queryByText(/Please accept the Terms of Service/i)).toBeNull();
    await user.click(button);
    expect(googleSignin).toHaveBeenCalledTimes(1);

    resolveSignin?.();
  });
});
