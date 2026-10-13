// @vitest-environment jsdom
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { GITHUB_PAT_KEY, GITHUB_REPO_KEY, saveGitHubCreds } from '@/services/storage/githubStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key, formatUIDate: (d: string) => d }),
}));

const signOut = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, profile: {}, signOut }),
}));

const addToast = vi.fn();
vi.mock('@/store/ui/useToastStore', () => ({
  useToastStore: (selector: (s: { addToast: typeof addToast }) => unknown) =>
    selector({ addToast }),
}));

const track = vi.fn();
vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: {
    ACCOUNT_DELETE_MODAL_OPENED: 'opened',
    ACCOUNT_DELETE_CANCELLED: 'cancelled',
    ACCOUNT_DELETE_COMPLETED: 'completed',
  },
  analytics: { track: (...args: unknown[]) => track(...args) },
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  signOut.mockReset();
  addToast.mockReset();
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  useResumeStore.getState().resetSync();
});

function renderModal(overrides = {}) {
  const props = { isOpen: true, onClose: vi.fn(), ...overrides };
  render(<DeleteAccountModal {...props} />);
  return props;
}

const confirmBtn = () => screen.getByRole('button', { name: /confirm_btn/i }) as HTMLButtonElement;
const consentBox = () => screen.getByRole('checkbox', { name: /consent_label/i });
const githubBox = () =>
  screen.queryByRole('checkbox', { name: /remove_github/i }) as HTMLInputElement | null;

function storeGitHubToken() {
  saveGitHubCreds('ghp_secret', 'me/cv', true);
  useResumeStore.getState().updateSync({ github: { enabled: true, repo: 'me/cv' } });
}

const expectTokenKept = () => {
  expect(localStorage.getItem(GITHUB_PAT_KEY)).toBe('ghp_secret');
  expect(localStorage.getItem(GITHUB_REPO_KEY)).toBe('me/cv');
  expect(useResumeStore.getState().sync.github).toMatchObject({ enabled: true, repo: 'me/cv' });
};

describe('DeleteAccountModal', () => {
  it('names the destructive dialog by its title', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /delete_account\.title/i })).toBeTruthy();
  });

  it('stays closed when not open', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('gates delete behind the consent checkbox, and says why', async () => {
    const user = userEvent.setup();
    renderModal();

    const before = confirmBtn();
    // aria-disabled, not native: the button carries a disabledReason, and a
    // natively disabled button is removed from the accessibility tree along
    // with the aria-describedby that would have explained it.
    expect(before.disabled).toBe(false);
    expect(before.getAttribute('aria-disabled')).toBe('true');

    const describedBy = before.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toContain('consent_label');

    await user.click(before);
    expect(fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('checkbox'));
    expect(confirmBtn().getAttribute('aria-disabled')).toBeNull();
  });

  it('clears the consent each time the dialog opens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DeleteAccountModal isOpen onClose={vi.fn()} />);
    await user.click(consentBox());
    expect((consentBox() as HTMLInputElement).checked).toBe(true);

    rerender(<DeleteAccountModal isOpen={false} onClose={vi.fn()} />);
    rerender(<DeleteAccountModal isOpen onClose={vi.fn()} />);
    expect((consentBox() as HTMLInputElement).checked).toBe(false);
    expect(confirmBtn().getAttribute('aria-disabled')).toBe('true');
  });

  it('cancels without deleting and tracks the cancel', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await user.click(screen.getByRole('button', { name: /common\.cancel/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('cancelled');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('deletes the account once confirmed and signs out', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await user.click(screen.getByRole('checkbox'));
    await user.click(confirmBtn());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      '/.netlify/functions/delete-user',
      expect.objectContaining({ method: 'POST' }),
    );
    await waitFor(() => expect(signOut).toHaveBeenCalledWith(false));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('cannot be dismissed while the deletion is in flight', async () => {
    // A never-resolving fetch keeps the modal in its deleting state.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    const user = userEvent.setup();
    const props = renderModal();
    await user.click(screen.getByRole('checkbox'));
    await user.click(confirmBtn());

    // While deleting, the confirm action swaps to its loading label and is
    // inert (aria-disabled, kept in the tree).
    const deleting = await screen.findByRole('button', { name: /common\.deleting/i });
    expect(deleting.getAttribute('aria-disabled')).toBe('true');

    await user.click(screen.getByRole('button', { name: /common\.cancel/i }));
    await user.keyboard('{Escape}');
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('re-enables the confirm action after a failed delete', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'nope' }) })),
    );
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('checkbox'));
    await user.click(confirmBtn());

    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.anything(), 'error'));
    // finally { setIsDeleting(false) } returns the confirmed button to enabled.
    await waitFor(() => expect(confirmBtn().disabled).toBe(false));
  });

  describe('GitHub connection on this device', () => {
    it('does not offer to remove GitHub when no token is stored', () => {
      renderModal();
      expect(githubBox()).toBeNull();
    });

    it('offers it ticked by default, before the consent gate', () => {
      storeGitHubToken();
      renderModal();
      const box = githubBox()!;
      expect(box.checked).toBe(true);
      // Focus order follows the DOM: the option comes before the consent gate.
      expect(box.compareDocumentPosition(consentBox()) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it('re-reads the token and re-ticks the box on each opening', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<DeleteAccountModal isOpen={false} onClose={vi.fn()} />);
      storeGitHubToken();
      rerender(<DeleteAccountModal isOpen onClose={vi.fn()} />);
      await user.click(githubBox()!);
      expect(githubBox()!.checked).toBe(false);

      rerender(<DeleteAccountModal isOpen={false} onClose={vi.fn()} />);
      rerender(<DeleteAccountModal isOpen onClose={vi.fn()} />);
      expect(githubBox()!.checked).toBe(true);
    });

    it('is keyboard-operable', async () => {
      storeGitHubToken();
      const user = userEvent.setup();
      renderModal();
      const box = githubBox()!;
      box.focus();
      await user.keyboard(' ');
      expect(box.checked).toBe(false);
      await user.tab();
      expect(document.activeElement).toBe(consentBox());
    });

    it('removes the GitHub connection only once the deletion succeeds', async () => {
      storeGitHubToken();
      let respond: (value: unknown) => void = () => {};
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise((resolve) => (respond = resolve))),
      );
      const user = userEvent.setup();
      renderModal();
      await user.click(consentBox());
      await user.click(confirmBtn());

      // In flight: nothing is removed before the server confirms.
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
      expectTokenKept();

      respond({ ok: true, json: () => Promise.resolve({}) });
      await waitFor(() => expect(signOut).toHaveBeenCalledWith(false));
      expect(localStorage.getItem(GITHUB_PAT_KEY)).toBeNull();
      expect(localStorage.getItem(GITHUB_REPO_KEY)).toBeNull();
      expect(useResumeStore.getState().sync.github.enabled).toBe(false);
      expect(useResumeStore.getState().sync.github.repo).toBeUndefined();
    });

    it('still completes the deletion when removing the connection throws', async () => {
      storeGitHubToken();
      // Blocked storage: the real disconnectGitHub() throws partway through.
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new DOMException('blocked', 'SecurityError');
      });
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const user = userEvent.setup();
        const props = renderModal();
        await user.click(consentBox());
        await user.click(confirmBtn());

        await waitFor(() => expect(signOut).toHaveBeenCalledWith(false));
        expect(addToast).toHaveBeenCalledWith(
          'account.modals.delete_account.success_message',
          'success',
        );
        expect(addToast).not.toHaveBeenCalledWith(expect.anything(), 'error');
        expect(props.onClose).toHaveBeenCalled();
      } finally {
        removeItem.mockRestore();
        consoleError.mockRestore();
      }
    });

    it('keeps the token when unticked', async () => {
      storeGitHubToken();
      const user = userEvent.setup();
      renderModal();
      await user.click(githubBox()!);
      await user.click(consentBox());
      await user.click(confirmBtn());

      await waitFor(() => expect(signOut).toHaveBeenCalledWith(false));
      expectTokenKept();
    });

    it('keeps the token when the deletion fails', async () => {
      storeGitHubToken();
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'nope' }) })),
      );
      const user = userEvent.setup();
      renderModal();
      await user.click(consentBox());
      await user.click(confirmBtn());

      await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.anything(), 'error'));
      expect(signOut).not.toHaveBeenCalled();
      expectTokenKept();
    });
  });
});
