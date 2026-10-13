// @vitest-environment jsdom
/**
 * A stored GitHub token must be removable from every state that holds
 * one — `connected_disabled` included — without switching sync on first.
 */
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { GitHubCard } from '@/features/settings/github/GitHubCard';
import { GITHUB_PAT_KEY, GITHUB_REPO_KEY, saveGitHubCreds } from '@/services/storage/githubStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, hasDrivePermission: null }),
}));
vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { SYNC_PROVIDER_TOGGLED: 'x' },
  analytics: { track: vi.fn() },
}));

const fetchSpy = vi.fn();

function renderCard(enabled: boolean) {
  saveGitHubCreds('ghp_secret', 'me/cv', true);
  useResumeStore.getState().updateSync({ github: { enabled, repo: 'me/cv' } });
  return render(
    <>
      <GitHubCard />
      <ConfirmModal />
    </>,
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  fetchSpy.mockReset();
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
  useResumeStore.getState().resetSync();
});

describe('GitHubCard Disconnect', () => {
  it.each([
    ['connected_disabled', false],
    ['active', true],
  ])('removes the token in the %s state without enabling or pushing', async (_state, enabled) => {
    const user = userEvent.setup();
    renderCard(enabled);
    // Sync must never be switched on along the way, not merely end up off.
    const enabledWrites: boolean[] = [];
    const unsubscribe = useResumeStore.subscribe((state) =>
      enabledWrites.push(!!state.sync.github.enabled),
    );

    await user.click(screen.getByRole('button', { name: 'sync.disconnect_github' }));
    await user.click(
      await screen.findByRole('button', { name: 'sync.confirm_disconnect_github_yes' }),
    );

    await waitFor(() => expect(localStorage.getItem(GITHUB_PAT_KEY)).toBeNull());
    unsubscribe();
    expect(localStorage.getItem(GITHUB_REPO_KEY)).toBeNull();
    expect(useResumeStore.getState().sync.github.enabled).toBe(false);
    // The copy promises the repository setting goes too; the store would restore it on load.
    expect(useResumeStore.getState().sync.github.repo).toBeUndefined();
    if (!enabled) expect(enabledWrites).not.toContain(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'sync.disconnect_github' })).toBeNull(),
    );
  });

  it('returns focus to the card once the Disconnect button is gone', async () => {
    const user = userEvent.setup();
    renderCard(false);

    await user.click(screen.getByRole('button', { name: 'sync.disconnect_github' }));
    await user.click(
      await screen.findByRole('button', { name: 'sync.confirm_disconnect_github_yes' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'sync.disconnect_github' })).toBeNull(),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'sync.setup' })),
    );
  });

  it('removes the connection, repository included, from the switch-off prompt', async () => {
    const user = userEvent.setup();
    renderCard(true);

    await user.click(screen.getByRole('switch', { name: 'sync.github_title' }));
    await user.click(await screen.findByRole('button', { name: 'sync.confirm_delete_github_yes' }));

    await waitFor(() => expect(localStorage.getItem(GITHUB_PAT_KEY)).toBeNull());
    expect(useResumeStore.getState().sync.github).toEqual({ enabled: false });
  });

  it('only switches sync off when the switch-off prompt keeps the credentials', async () => {
    const user = userEvent.setup();
    renderCard(true);

    await user.click(screen.getByRole('switch', { name: 'sync.github_title' }));
    await user.click(await screen.findByRole('button', { name: 'sync.confirm_delete_github_no' }));

    await waitFor(() => expect(useResumeStore.getState().sync.github.enabled).toBe(false));
    expect(useResumeStore.getState().sync.github.repo).toBe('me/cv');
    expect(localStorage.getItem(GITHUB_PAT_KEY)).toBe('ghp_secret');
    expect(localStorage.getItem(GITHUB_REPO_KEY)).toBe('me/cv');
  });

  it('keeps the token when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderCard(false);

    await user.click(screen.getByRole('button', { name: 'sync.disconnect_github' }));
    await user.click(await screen.findByRole('button', { name: 'common.cancel' }));

    expect(localStorage.getItem(GITHUB_PAT_KEY)).toBe('ghp_secret');
    expect(useResumeStore.getState().sync.github.enabled).toBe(false);
  });

  it('offers no Disconnect when no token is stored', () => {
    render(<GitHubCard />);
    expect(screen.queryByRole('button', { name: 'sync.disconnect_github' })).toBeNull();
  });
});
