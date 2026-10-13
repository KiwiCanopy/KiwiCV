// @vitest-environment jsdom
/**
 * The GitHub token is device-bound by default, and a user-initiated
 * sign-out offers its removal — only when one is stored.
 */
import { MemoryRouter } from 'react-router-dom';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useSignOutFlow } from '@/hooks/useSignOutFlow';
import { useAccount } from '@/pages/AccountPage/useAccount';
import { GITHUB_PAT_KEY, saveGitHubCreds } from '@/services/storage/githubStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const signOut = vi.fn(async () => {});
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    signOut,
    refreshProfile: vi.fn(),
  }),
}));
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key, formatUIDate: (d: string) => d }),
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  signOut.mockClear();
});

afterEach(() => {
  useResumeStore.getState().resetSync();
  act(() => useConfirmStore.getState().close());
});

function setup() {
  render(<ConfirmModal />);
  return renderHook(() => useSignOutFlow());
}

describe('useSignOutFlow', () => {
  it('signs out without asking when no GitHub token is stored', async () => {
    const { result } = setup();
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current();
    });
    expect(outcome).toBe(true);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('removes the token and switches GitHub sync off when the user chooses to', async () => {
    const user = userEvent.setup();
    saveGitHubCreds('ghp_secret', 'me/cv', true);
    useResumeStore.getState().updateSync({ github: { enabled: true, repo: 'me/cv' } });
    const { result } = setup();

    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current();
    });
    await screen.findByRole('alertdialog', { name: 'auth.sign_out_github_title' });
    await user.click(screen.getByRole('button', { name: 'auth.sign_out_github_remove' }));

    await expect(pending).resolves.toBe(true);
    expect(localStorage.getItem(GITHUB_PAT_KEY)).toBeNull();
    expect(useResumeStore.getState().sync.github).toEqual({ enabled: false });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the token by default and still signs out', async () => {
    const user = userEvent.setup();
    saveGitHubCreds('ghp_secret', 'me/cv', true);
    useResumeStore.getState().updateSync({ github: { enabled: true, repo: 'me/cv' } });
    const { result } = setup();

    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current();
    });
    // Keeping is the default: it is the button that takes focus.
    const keep = await screen.findByRole('button', { name: 'auth.sign_out_github_keep' });
    await waitFor(() => expect(document.activeElement).toBe(keep));
    await user.click(keep);

    await expect(pending).resolves.toBe(true);
    expect(localStorage.getItem(GITHUB_PAT_KEY)).toBe('ghp_secret');
    expect(useResumeStore.getState().sync.github.enabled).toBe(true);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the prompt is dismissed', async () => {
    const user = userEvent.setup();
    saveGitHubCreds('ghp_secret', 'me/cv', true);
    const { result } = setup();

    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current();
    });
    await screen.findByRole('alertdialog');
    await user.keyboard('{Escape}');

    await expect(pending).resolves.toBe(false);
    expect(localStorage.getItem(GITHUB_PAT_KEY)).toBe('ghp_secret');
    expect(signOut).not.toHaveBeenCalled();
  });
});

describe('Account page sign-out', () => {
  it('routes through the GitHub prompt', async () => {
    saveGitHubCreds('ghp_secret', 'me/cv', true);
    render(<ConfirmModal />);
    const { result } = renderHook(() => useAccount(), { wrapper: MemoryRouter });

    act(() => {
      void result.current.handleSignOut();
    });

    expect(
      await screen.findByRole('alertdialog', { name: 'auth.sign_out_github_title' }),
    ).toBeTruthy();
    expect(signOut).not.toHaveBeenCalled();
  });
});
