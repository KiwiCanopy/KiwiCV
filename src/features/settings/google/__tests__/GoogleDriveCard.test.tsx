// @vitest-environment jsdom
/**
 * A stored Drive credential must be revocable from every state that
 * holds one — `connected_disabled` included — without switching sync on first.
 */
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { GoogleDriveCard } from '@/features/settings/google/GoogleDriveCard';
import {
  GOOGLE_REFRESH_TOKEN_KEY,
  GOOGLE_TOKEN_OWNER_KEY,
  saveGoogleDriveCreds,
} from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
const auth = vi.hoisted(() => ({ hasDrivePermission: true as boolean }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    hasDrivePermission: auth.hasDrivePermission,
    signInWithGoogle: vi.fn(),
  }),
}));
vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { SYNC_PROVIDER_TOGGLED: 'x' },
  analytics: { track: vi.fn() },
}));

const fetchSpy = vi.fn();

const revokeCalls = () =>
  fetchSpy.mock.calls.filter(([, init]) => JSON.parse(init.body).action === 'revoke');

function renderCard(enabled: boolean) {
  saveGoogleDriveCreds('refresh-secret', 'user-1');
  useResumeStore.getState().updateSync({ googleDrive: { enabled } });
  return render(
    <>
      <GoogleDriveCard />
      <ConfirmModal />
    </>,
  );
}

const toasts = () =>
  useToastStore.getState().toasts.map(({ message, type }) => ({ message, type }));

beforeEach(() => {
  auth.hasDrivePermission = true;
  localStorage.clear();
  useToastStore.setState({ toasts: [] });
  fetchSpy.mockReset();
  fetchSpy.mockResolvedValue(new Response(JSON.stringify({ success: true })));
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  useConfirmStore.getState().close();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  useResumeStore.getState().resetSync();
});

describe('GoogleDriveCard Disconnect', () => {
  // permission_required with a stored credential: Google refused the handshake
  // (UNAUTHORIZED) but the credential is kept, and the card shows Grant.
  it.each([
    ['connected_disabled', false, true],
    ['active', true, true],
    ['permission_required', false, false],
  ])(
    'revokes and clears the credential in the %s state without enabling',
    async (_s, enabled, permission) => {
      auth.hasDrivePermission = permission;
      const user = userEvent.setup();
      renderCard(enabled);
      // Sync must never be switched on along the way, not merely end up off.
      const enabledWrites: boolean[] = [];
      const unsubscribe = useResumeStore.subscribe((state) =>
        enabledWrites.push(!!state.sync.googleDrive.enabled),
      );

      await user.click(screen.getByRole('button', { name: 'sync.disconnect_drive' }));
      await user.click(
        await screen.findByRole('button', { name: 'sync.confirm_disconnect_drive_yes' }),
      );

      await waitFor(() => expect(localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY)).toBeNull());
      unsubscribe();
      expect(localStorage.getItem(GOOGLE_TOKEN_OWNER_KEY)).toBeNull();
      expect(useResumeStore.getState().sync.googleDrive.enabled).toBe(false);
      if (!enabled) expect(enabledWrites).not.toContain(true);
      expect(revokeCalls()).toHaveLength(1);
      expect(JSON.parse(revokeCalls()[0][1].body).refreshToken).toBe('refresh-secret');
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'sync.disconnect_drive' })).toBeNull(),
      );
      expect(toasts()).toEqual([{ message: 'sync.disconnect_drive_success', type: 'success' }]);
    },
  );

  // A failed revoke still clears, but must not claim access is gone.
  it.each([
    ['card button', 'network error'],
    ['card button', 'error response'],
    ['switch-off prompt', 'network error'],
    ['switch-off prompt', 'error response'],
  ])(
    'warns instead of confirming when the revoke from the %s fails (%s)',
    async (path, failure) => {
      if (failure === 'network error') fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));
      else fetchSpy.mockResolvedValue(new Response('{}', { status: 502 }));
      const user = userEvent.setup();
      renderCard(path === 'switch-off prompt');

      if (path === 'card button') {
        await user.click(screen.getByRole('button', { name: 'sync.disconnect_drive' }));
      } else {
        await user.click(screen.getByRole('switch', { name: 'sync.google_drive_title' }));
      }
      await user.click(
        await screen.findByRole('button', { name: 'sync.confirm_disconnect_drive_yes' }),
      );

      await waitFor(() => expect(toasts()).toHaveLength(1));
      expect(localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY)).toBeNull();
      expect(revokeCalls()).toHaveLength(1);
      expect(toasts()).toEqual([
        { message: 'sync.disconnect_drive_revoke_failed', type: 'warning' },
      ]);
    },
  );

  // Not Grant or the switch: Enter on either would start a new authorization.
  it('lands focus on the card heading once the Disconnect button is gone', async () => {
    const user = userEvent.setup();
    renderCard(false);

    await user.click(screen.getByRole('button', { name: 'sync.disconnect_drive' }));
    await user.click(
      await screen.findByRole('button', { name: 'sync.confirm_disconnect_drive_yes' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'sync.disconnect_drive' })).toBeNull(),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('heading', { name: 'sync.google_drive_title' }),
      ),
    );
  });

  it('keeps the credential when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderCard(false);

    await user.click(screen.getByRole('button', { name: 'sync.disconnect_drive' }));
    await user.click(await screen.findByRole('button', { name: 'common.cancel' }));

    expect(localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY)).toBe('refresh-secret');
    expect(useResumeStore.getState().sync.googleDrive.enabled).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('offers no Disconnect when no credential is stored', () => {
    render(<GoogleDriveCard />);
    expect(screen.queryByRole('button', { name: 'sync.disconnect_drive' })).toBeNull();
  });

  it('revokes and clears from the switch-off prompt', async () => {
    const user = userEvent.setup();
    renderCard(true);

    await user.click(screen.getByRole('switch', { name: 'sync.google_drive_title' }));
    await user.click(
      await screen.findByRole('button', { name: 'sync.confirm_disconnect_drive_yes' }),
    );

    await waitFor(() => expect(localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY)).toBeNull());
    expect(revokeCalls()).toHaveLength(1);
    expect(useResumeStore.getState().sync.googleDrive.enabled).toBe(false);
    await waitFor(() =>
      expect(toasts()).toEqual([{ message: 'sync.disconnect_drive_success', type: 'success' }]),
    );
  });

  it('only switches sync off when the switch-off prompt keeps access', async () => {
    const user = userEvent.setup();
    renderCard(true);

    await user.click(screen.getByRole('switch', { name: 'sync.google_drive_title' }));
    await user.click(
      await screen.findByRole('button', { name: 'sync.confirm_disconnect_drive_no' }),
    );

    await waitFor(() => expect(useResumeStore.getState().sync.googleDrive.enabled).toBe(false));
    expect(localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY)).toBe('refresh-secret');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'sync.disconnect_drive' })).toBeTruthy();
  });
  it.each([['card button'], ['switch-off prompt']])(
    'keeps the confirm open and busy until the revoke from the %s settles',
    async (path) => {
      let answer!: (response: Response) => void;
      fetchSpy.mockReturnValue(new Promise<Response>((resolve) => (answer = resolve)));
      const user = userEvent.setup();
      renderCard(path === 'switch-off prompt');

      if (path === 'card button') {
        await user.click(screen.getByRole('button', { name: 'sync.disconnect_drive' }));
      } else {
        await user.click(screen.getByRole('switch', { name: 'sync.google_drive_title' }));
      }
      await user.click(
        await screen.findByRole('button', { name: 'sync.confirm_disconnect_drive_yes' }),
      );

      await waitFor(() => expect(revokeCalls()).toHaveLength(1));
      expect(screen.getByRole('alertdialog').getAttribute('aria-busy')).toBe('true');
      expect(localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY)).toBe('refresh-secret');

      answer(new Response(JSON.stringify({ success: true })));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      expect(localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY)).toBeNull();
    },
  );

  it('closes the confirm and reports an error when clearing throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderCard(false);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    await user.click(screen.getByRole('button', { name: 'sync.disconnect_drive' }));
    await user.click(
      await screen.findByRole('button', { name: 'sync.confirm_disconnect_drive_yes' }),
    );

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(toasts()).toEqual([{ message: 'common.error_occurred', type: 'error' }]);
  });
});
