// @vitest-environment jsdom
import { PricingDialog } from '@/components/monetization/PricingDialog';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ANALYTICS_EVENTS } from '@/services/analytics';
import { GITHUB_PAT_KEY, saveGitHubCreds } from '@/services/storage/githubStorage';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

const track = vi.fn();
const purchasePackage = vi.fn(
  (_lookupKey: string, _userId: string, _returnPath: string) => new Promise(() => {}),
);
const auth = {
  user: { id: 'user-1' } as { id: string } | null,
  profile: { id: 'profile-1' } as { id: string } | null,
  signOut: vi.fn(),
};

const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
  // One shared spy: a fresh mock per render would make the navigate-on-close
  // side effect permanently unassertable.
  useNavigate: () => navigate,
  // `useLanguage` reads the locale from the pathname now, not a `:lang` param.
  useLocation: () => ({ pathname: '/' }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));
vi.mock('@/services/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/analytics')>()),
  analytics: { track: (...args: unknown[]) => track(...args) },
}));
vi.mock('@/services/purchase', () => ({
  purchaseService: {
    purchasePackage: (lookupKey: string, userId: string, returnPath: string) =>
      purchasePackage(lookupKey, userId, returnPath),
  },
}));
vi.mock('@/store/ui/useUIStore', () => ({
  useUIStore: (selector: (state: { setDeleteModalOpen: () => void }) => unknown) =>
    selector({ setDeleteModalOpen: vi.fn() }),
}));

function renderDialog(onClose = vi.fn()) {
  return render(<PricingDialog isOpen onClose={onClose} />);
}

describe('PricingDialog', () => {
  beforeEach(() => {
    // The dialog scrolls the recommended card into view on open; jsdom has no
    // layout, so the method does not exist there.
    Element.prototype.scrollIntoView = vi.fn();
    track.mockClear();
    navigate.mockClear();
    purchasePackage.mockClear();
    auth.user = { id: 'user-1' };
    auth.profile = { id: 'profile-1' };
  });

  it('names the dialog once, from the visible heading', async () => {
    const { container } = renderDialog();

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    // The heading used to be duplicated by an sr-only Dialog.Title carrying the
    // same string, which is what this count guards.
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('reports the close button to analytics but leaves Escape untracked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog(onClose);
    track.mockClear();

    await user.keyboard('{Escape}');
    // Assert Escape still closes, not only that it stayed silent — the frame
    // intercepts the key itself now, so a dropped dispatch would strand it.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(track).not.toHaveBeenCalledWith(
      ANALYTICS_EVENTS.PRICING_MODAL_CLOSED,
      expect.anything(),
    );

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(track).toHaveBeenCalledWith(ANALYTICS_EVENTS.PRICING_MODAL_CLOSED, {
      method: 'x_button',
    });
  });

  /**
   * ⚠️ There is no family toggle. Passes shared this dialog with a credits tab
   * until the credits system was removed, and a segmented control with one
   * option is a control that cannot be operated — so the toggle, the switch
   * counter and the `tab` dimension on every event went with it.
   */
  it('offers no family toggle and prices only passes', () => {
    renderDialog();
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getAllByRole('button', { name: /Buy now/i })).toHaveLength(3);
  });

  it('blocks a second purchase while one is in flight', async () => {
    const user = userEvent.setup();
    renderDialog();

    const cards = screen.getAllByRole('button', { name: /Buy now/i });
    await user.click(cards[0]);
    expect(purchasePackage).toHaveBeenCalledTimes(1);

    // The cards carry aria-disabled rather than the native attribute, so
    // nothing stops a second click except the handler's own guard.
    const busyCards = screen.getAllByRole('button', { name: /Buy now/i });
    expect(busyCards[1].getAttribute('aria-disabled')).toBe('true');
    await user.click(busyCards[1]);
    expect(purchasePackage).toHaveBeenCalledTimes(1);

    // Keyboard too: nothing about aria-disabled stops Enter on its own.
    busyCards[1].focus();
    await user.keyboard('{Enter}');
    expect(purchasePackage).toHaveBeenCalledTimes(1);
  });

  it('replaces the pricing surface with the recovery dialog when the profile is missing', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    auth.profile = null;
    renderDialog(onClose);

    expect(screen.queryByRole('button', { name: /Buy now/i })).toBeNull();
    // The recovery affordances themselves, not merely "a dialog rendered".
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeTruthy();

    // Closing a profile-less session still routes the user out of the app.
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(navigate).toHaveBeenCalledWith('/');
    expect(track).not.toHaveBeenCalledWith(
      ANALYTICS_EVENTS.PRICING_MODAL_CLOSED,
      expect.anything(),
    );
  });

  it('offers to remove a stored GitHub connection before signing out', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    auth.profile = null;
    auth.signOut.mockClear();
    saveGitHubCreds('ghp_secret', 'me/cv', true);
    render(
      <>
        <PricingDialog isOpen onClose={onClose} />
        <ConfirmModal />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign Out' }));
    await user.click(await screen.findByRole('button', { name: 'Remove GitHub and sign out' }));

    expect(localStorage.getItem(GITHUB_PAT_KEY)).toBeNull();
    expect(auth.signOut).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });
});
