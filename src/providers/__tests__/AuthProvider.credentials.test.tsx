// @vitest-environment jsdom
/**
 * Credential-handling contract for AuthProvider (slice 1).
 *
 * AuthProvider had no test coverage at all, and it is the only place that
 * writes or clears the Google Drive refresh token — a standing capability
 * against the user's Drive, held in localStorage. These cases pin the four
 * rules that keep it from outliving, or crossing, the session that created it.
 */
import { useEffect } from 'react';

import { useCoverLetterStyle } from '@/components/modals/ai/edit/useCoverLetterStyle';
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { PENDING_GOOGLE_RESTORE_KEY } from '@/constants/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/providers/AuthProvider';
import { readCoverLetterStyle } from '@/services/storage/coverLetterStyleStorage';
import { clearGitHubCreds, saveGitHubCreds } from '@/services/storage/githubStorage';
import {
  clearGoogleDriveCreds,
  loadGoogleDriveCreds,
  saveGoogleDriveCreds,
} from '@/services/storage/googleStorage';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AuthCallback = (event: string, session: unknown) => void | Promise<void>;

let authCallback: AuthCallback = () => {};
const handshake = vi.fn(async (_token?: unknown, _discover?: unknown) => ({}) as unknown);
const discoverBackups = vi.fn(async (_token?: unknown) => ({}) as unknown);
interface OAuthArgs {
  provider: string;
  options?: { scopes?: string; queryParams?: { access_type?: string; prompt?: string } };
}
const signInWithOAuth = vi.fn(async (_args: OAuthArgs) => ({ error: null }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      getUser: vi.fn(async () => ({ data: { user: null } })),
      onAuthStateChange: (cb: AuthCallback) => {
        authCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      signOut: vi.fn(async () => ({ error: null })),
      signInWithOAuth: (args: OAuthArgs) => signInWithOAuth(args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    }),
  },
}));

vi.mock('@/services/google-drive', () => ({
  googleDriveService: {
    handshake: (...args: unknown[]) => handshake(...(args as [])),
    discoverBackups: (...args: unknown[]) => discoverBackups(...(args as [])),
  },
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock('@/utils/avatar-cache', () => ({ clearAvatarCache: vi.fn() }));
vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { SYNC_PROVIDER_CONNECTED: 'x' },
  analytics: { track: vi.fn() },
}));

const updateSync = vi.fn();
const driveSync: { enabled?: boolean } = {};
vi.mock('@/store/resume/useResumeStore', () => ({
  useResumeStore: { getState: () => ({ updateSync, sync: { googleDrive: driveSync } }) },
}));
const setPendingRedirect = vi.fn();
const flowAuth: { source?: string } = {};
vi.mock('@/store/ui/useFlowStore', () => ({
  useFlowStore: { getState: () => ({ auth: flowAuth, setPendingRedirect }) },
}));
vi.mock('@/store/ui/useToastStore', () => ({
  useToastStore: (selector: (s: { addToast: () => void }) => unknown) =>
    selector({ addToast: vi.fn() }),
}));
vi.mock('@/store/ui/useUIStore', () => {
  const state = { appLanguage: 'en' };
  const useUIStore = (selector: (s: typeof state) => unknown) => selector(state);
  // getOAuthRedirectPath reads the language outside React, so the mock needs
  // the store's imperative accessor as well as the hook form.
  useUIStore.getState = () => state;
  return { useUIStore };
});

const USER_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function sessionFor(userId: string, providerRefreshToken?: string) {
  return {
    user: { id: userId, user_metadata: {} },
    ...(providerRefreshToken ? { provider_refresh_token: providerRefreshToken } : {}),
  };
}

async function emit(event: string, session: unknown) {
  await authCallback(event, session);
}

/** Drives the provider's own sign-in entry point, as a consumer would. */
async function signIn(options: { requireDrive: boolean }) {
  await act(async () => {
    await contextSignIn?.(options);
  });
}

/** Surfaces the context the rest of the app reads its Drive state and actions from. */
let contextSignIn: ((options?: { requireDrive?: boolean }) => Promise<void>) | undefined;
let contextSignOut: ((showToast?: boolean) => Promise<void>) | undefined;
function PermissionProbe() {
  const { hasDrivePermission, signInWithGoogle, signOut } = useAuth();
  // In an effect, not during render: capturing it inline is a render-phase
  // side effect, which React's own rules ban.
  useEffect(() => {
    contextSignIn = signInWithGoogle;
    contextSignOut = signOut;
  }, [signInWithGoogle, signOut]);
  return <span data-testid="drive-permission">{String(hasDrivePermission)}</span>;
}

const drivePermission = () => screen.getByTestId('drive-permission').textContent;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  handshake.mockReset();
  handshake.mockResolvedValue({});
  discoverBackups.mockReset();
  discoverBackups.mockResolvedValue({});
  signInWithOAuth.mockClear();
  updateSync.mockClear();
  setPendingRedirect.mockClear();
  delete driveSync.enabled;
  delete flowAuth.source;
  render(
    <AuthProvider>
      <PermissionProbe />
    </AuthProvider>,
  );
});

afterEach(() => {
  clearGoogleDriveCreds();
  clearGitHubCreds();
});

describe('AuthProvider credential handling', () => {
  it('clears the Drive token when a session ends without an explicit sign-out', async () => {
    saveGoogleDriveCreds('drive-token', USER_A);
    saveGitHubCreds('ghp_secret', 'owner/repo', true);

    // Expiry, revocation, or a sign-out in another tab. signOut() never runs.
    await emit('SIGNED_OUT', null);

    await waitFor(() => expect(loadGoogleDriveCreds()).toBe(''));
    // The PAT is an independent credential the user opted into remembering,
    // and GitHub sync works while signed out. It deliberately survives.
    expect(localStorage.getItem('github_pat')).toBe('ghp_secret');
  });

  it('drops another account’s credentials when a different user signs in', async () => {
    saveGoogleDriveCreds('user-a-token', USER_A);
    saveGitHubCreds('ghp_user_a', 'a/repo', true);

    await emit('SIGNED_IN', sessionFor(USER_B));

    await waitFor(() => expect(loadGoogleDriveCreds()).toBe(''));
    // A different person, not the same person leaving: the PAT goes too.
    expect(localStorage.getItem('github_pat')).toBeNull();
    // With sync off and the store's repo gone, or rehydration writes it back.
    expect(updateSync).toHaveBeenCalledWith({
      github: { enabled: false, repo: undefined, branch: undefined },
    });
  });

  it('keeps credentials that predate owner tracking', async () => {
    // No owner recorded. Treating these as foreign would force every existing
    // user to re-consent on their own browser.
    localStorage.setItem('google_drive_refresh_token', 'legacy-token');

    await emit('SIGNED_IN', sessionFor(USER_A));

    await waitFor(() => expect(handshake).toHaveBeenCalled());
    expect(loadGoogleDriveCreds()).toBe('legacy-token');
  });

  it('does not let a base login overwrite a Drive-capable token', async () => {
    saveGoogleDriveCreds('drive-scoped-token', USER_A);
    // A plain sign-in: the flow never asked for Drive, so the token it returns
    // carries no drive.file scope.
    sessionStorage.setItem('google_oauth_require_drive', 'false');

    await emit('SIGNED_IN', sessionFor(USER_A, 'base-login-token'));

    await waitFor(() => expect(handshake).toHaveBeenCalled());
    expect(loadGoogleDriveCreds()).toBe('drive-scoped-token');
    expect(handshake).toHaveBeenCalledWith('drive-scoped-token', false);
  });

  it('stores the token when the flow asked for Drive', async () => {
    saveGoogleDriveCreds('old-token', USER_A);
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A, 'drive-token'));

    await waitFor(() => expect(loadGoogleDriveCreds()).toBe('drive-token'));
    expect(handshake).toHaveBeenCalledWith('drive-token', false);
    expect(handshake).toHaveBeenCalledTimes(1);
  });

  // Data minimisation: sign-in data reaches no server unless an optional
  // feature is used, so a plain sign-in's token is neither kept nor sent.
  it('neither stores nor sends the token a plain sign-in returns', async () => {
    sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
    sessionStorage.setItem('google_oauth_require_drive', 'false');

    await emit('INITIAL_SESSION', sessionFor(USER_A, 'base-login-token'));
    await emit('SIGNED_IN', sessionFor(USER_A, 'base-login-token'));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(loadGoogleDriveCreds()).toBe('');
    expect(handshake).not.toHaveBeenCalled();
  });

  it('still finishes a plain sign-in’s return without a token to wait on', async () => {
    flowAuth.source = 'landing_try_ai';
    sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
    sessionStorage.setItem('google_oauth_require_drive', 'false');

    await emit('SIGNED_IN', sessionFor(USER_A));

    expect(setPendingRedirect).toHaveBeenCalledWith(true);
    expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
    expect(updateSync).not.toHaveBeenCalled();
  });
});

describe('AuthProvider unusable-credential cleanup', () => {
  // A distinct token per case: the handshake dedupe ref outlives a single case.
  const restoreWith = async (token: string) => {
    saveGoogleDriveCreds(token, USER_A);
    await emit('INITIAL_SESSION', sessionFor(USER_A));
  };

  // No drive.file grant (a plain sign-in's leftover), or a revoked grant. Neither
  // can ever serve Drive, so the sync state does not matter.
  it.each([
    ['INSUFFICIENT_SCOPE', false],
    ['INSUFFICIENT_SCOPE', true],
    ['INVALID_GRANT', false],
    ['INVALID_GRANT', true],
  ])('discards the credential on %s (Drive sync on: %s)', async (code, syncOn) => {
    driveSync.enabled = syncOn;
    handshake.mockRejectedValue(new Error(code));

    await restoreWith(`dead-${code}-${syncOn}`);

    await waitFor(() => expect(drivePermission()).toBe('false'));
    expect(loadGoogleDriveCreds()).toBe('');
    expect(localStorage.getItem('google_drive_token_owner')).toBeNull();
  });

  // Quota, Workspace policy, a function-level 401/403: none proves the token dead.
  it.each([false, true])(
    'keeps the credential on a generic UNAUTHORIZED (Drive sync on: %s)',
    async (syncOn) => {
      driveSync.enabled = syncOn;
      handshake.mockRejectedValue(new Error('UNAUTHORIZED'));

      await restoreWith(`refused-${syncOn}`);

      await waitFor(() => expect(drivePermission()).toBe('false'));
      expect(loadGoogleDriveCreds()).toBe(`refused-${syncOn}`);
    },
  );

  it('keeps the credential when the check fails for any other reason', async () => {
    handshake.mockRejectedValue(new Error('Failed to fetch'));

    await restoreWith('unreachable-token');

    await waitFor(() => expect(handshake).toHaveBeenCalled());
    expect(loadGoogleDriveCreds()).toBe('unreachable-token');
  });

  it('checks the newer credential when one replaced the dead one mid-check', async () => {
    handshake.mockImplementation(async (token: unknown) => {
      if (token === 'superseded-token') {
        saveGoogleDriveCreds('newer-token', USER_A);
        throw new Error('INVALID_GRANT');
      }
      return {};
    });

    await restoreWith('superseded-token');

    // The verdict was about a token no longer held; the one held now works.
    await waitFor(() => expect(drivePermission()).toBe('true'));
    expect(handshake).toHaveBeenLastCalledWith('newer-token', false);
    expect(loadGoogleDriveCreds()).toBe('newer-token');
  });

  describe('during a pending Drive return', () => {
    const returnFromDrive = (startedAt: number) => {
      sessionStorage.setItem('google_oauth_in_progress', String(startedAt));
      sessionStorage.setItem('google_oauth_require_drive', 'true');
      sessionStorage.setItem(PENDING_GOOGLE_RESTORE_KEY, 'true');
    };
    const promptOf = (call: number) =>
      signInWithOAuth.mock.calls[call]?.[0]?.options?.queryParams?.prompt;

    // The user just pressed Connect, and Google sent back no fresh token, so
    // the stored credential is what gets checked, and it is dead.
    it('retries the connect once with consent, at once', async () => {
      handshake.mockRejectedValue(new Error('INVALID_GRANT'));
      returnFromDrive(Date.now());
      saveGoogleDriveCreds('dead-at-fresh-return', USER_A);

      await emit('SIGNED_IN', sessionFor(USER_A));

      await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
      expect(promptOf(0)).toBe('consent');
      expect(sessionStorage.getItem('google_oauth_consent_retry')).toBe('1');
      expect(loadGoogleDriveCreds()).toBe('');
    });

    it.each([
      ['the one-shot retry was already spent', Date.now(), true],
      ['the return is long past', Date.now() - 60 * 60 * 1000, false],
    ])(
      'never redirects, now or on a later auth event, when %s',
      async (_case, startedAt, retrySpent) => {
        handshake.mockRejectedValue(new Error('INVALID_GRANT'));
        returnFromDrive(startedAt);
        if (retrySpent) sessionStorage.setItem('google_oauth_consent_retry', '1');
        saveGoogleDriveCreds(`dead-${retrySpent}`, USER_A);

        await emit('SIGNED_IN', sessionFor(USER_A));
        await waitFor(() => expect(loadGoogleDriveCreds()).toBe(''));

        // A token refresh or a refocus, with nobody pressing anything.
        await emit('TOKEN_REFRESHED', sessionFor(USER_A));
        await emit('SIGNED_IN', sessionFor(USER_A));
        await new Promise((resolve) => setTimeout(resolve, 20));

        expect(signInWithOAuth).not.toHaveBeenCalled();
        expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
        expect(sessionStorage.getItem('google_oauth_require_drive')).toBeNull();
        expect(sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY)).toBeNull();
      },
    );

    it('still settles the return when another tab cleared the dead credential first', async () => {
      handshake.mockImplementation(async () => {
        // The other tab's clear lands while this tab's request is in flight.
        await new Promise((resolve) => setTimeout(resolve, 0));
        clearGoogleDriveCreds();
        throw new Error('INVALID_GRANT');
      });
      returnFromDrive(Date.now() - 60 * 60 * 1000);
      saveGoogleDriveCreds('cleared-elsewhere', USER_A);

      await emit('SIGNED_IN', sessionFor(USER_A));
      await waitFor(() => expect(drivePermission()).toBe('false'));

      await emit('TOKEN_REFRESHED', sessionFor(USER_A));
      await emit('SIGNED_IN', sessionFor(USER_A));
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(signInWithOAuth).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
    });
  });

  // A Connect over a stored credential omits prompt=consent, so Google sends no
  // fresh token and the stored one has to decide the return.
  describe('a Drive connect that returns no fresh token over a stored one', () => {
    const connectOver = async (token: string) => {
      saveGoogleDriveCreds(token, USER_A);
      sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
      sessionStorage.setItem('google_oauth_require_drive', 'true');
      sessionStorage.setItem(PENDING_GOOGLE_RESTORE_KEY, 'true');
      // An OAuth return's measured order.
      await emit('INITIAL_SESSION', sessionFor(USER_A));
      await emit('SIGNED_IN', sessionFor(USER_A));
    };
    const returnFlags = () => [
      sessionStorage.getItem('google_oauth_in_progress'),
      sessionStorage.getItem('google_oauth_require_drive'),
    ];

    it('switches sync on and ends the return once the stored credential passes', async () => {
      await connectOver('still-good-token');

      await waitFor(() =>
        expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } }),
      );
      expect(updateSync).toHaveBeenCalledTimes(1);
      expect(handshake).toHaveBeenCalledTimes(1);
      expect(handshake).toHaveBeenCalledWith('still-good-token', false);
      expect(returnFlags()).toEqual([null, null]);
      expect(signInWithOAuth).not.toHaveBeenCalled();
    });

    it('waits for the verdict although the second event was deduped', async () => {
      let answer: (value: unknown) => void = () => {};
      handshake.mockImplementation(() => new Promise((resolve) => (answer = resolve)));

      await connectOver('slow-token');
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(updateSync).not.toHaveBeenCalled();

      answer({});
      await waitFor(() => expect(updateSync).toHaveBeenCalledTimes(1));
      expect(handshake).toHaveBeenCalledTimes(1);
    });

    it('ends the return without switching sync on when Drive refuses it', async () => {
      handshake.mockRejectedValue(new Error('UNAUTHORIZED'));

      await connectOver('stored-refused');

      await waitFor(() => expect(returnFlags()).toEqual([null, null]));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY)).toBeNull();
      expect(updateSync).not.toHaveBeenCalled();
      expect(signInWithOAuth).not.toHaveBeenCalled();
    });

    // A blip is not a refusal; sync stays inert until a later check passes.
    it('finishes the return when Drive cannot be reached', async () => {
      handshake.mockRejectedValue(new Error('Failed to fetch'));

      await connectOver('stored-unreachable');

      await waitFor(() =>
        expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } }),
      );
      expect(returnFlags()).toEqual([null, null]);
      expect(drivePermission()).toBe('null');
      expect(signInWithOAuth).not.toHaveBeenCalled();
    });

    // A reload within ten minutes re-checked the stored token with the
    // consent retry allowed, and a token revoked meanwhile redirected unprompted.
    it('leaves nothing for a later reload to redirect on', async () => {
      await connectOver('valid-then-revoked');
      await waitFor(() => expect(updateSync).toHaveBeenCalledTimes(1));

      // The reload: a fresh page re-checks the stored token, now revoked. A
      // distinct value stands in for the module state a real reload resets.
      handshake.mockRejectedValue(new Error('INVALID_GRANT'));
      saveGoogleDriveCreds('valid-then-revoked-after-reload', USER_A);
      await emit('INITIAL_SESSION', sessionFor(USER_A));
      await waitFor(() => expect(loadGoogleDriveCreds()).toBe(''));
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(signInWithOAuth).not.toHaveBeenCalled();
    });

    it('switches sync on although backup discovery fails after a passing handshake', async () => {
      discoverBackups.mockRejectedValue(new Error('Failed to fetch'));

      await connectOver('usable-but-discovery-fails');

      await waitFor(() =>
        expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } }),
      );
      await waitFor(() => expect(discoverBackups).toHaveBeenCalledTimes(1));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(drivePermission()).toBe('true');
      expect(returnFlags()).toEqual([null, null]);
    });

    // One check at a time: a fresh token's check starts only once the stored one settles.
    it('checks a fresh token only after the stored one’s check settles', async () => {
      let answerStored: (value: unknown) => void = () => {};
      handshake.mockImplementation((token: unknown) =>
        token === 'held-stored-token'
          ? new Promise((resolve) => (answerStored = resolve))
          : Promise.resolve({}),
      );
      saveGoogleDriveCreds('held-stored-token', USER_A);
      await emit('INITIAL_SESSION', sessionFor(USER_A));

      sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
      sessionStorage.setItem('google_oauth_require_drive', 'true');
      await emit('SIGNED_IN', sessionFor(USER_A, 'fresh-after-held'));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(handshake.mock.calls.map(([token]) => token)).toEqual(['held-stored-token']);
      expect(updateSync).not.toHaveBeenCalled();

      answerStored({});
      await waitFor(() =>
        expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } }),
      );
      expect(handshake.mock.calls.map(([token]) => token)).toEqual([
        'held-stored-token',
        'fresh-after-held',
      ]);
      expect(returnFlags()).toEqual([null, null]);
    });

    // Discovery has no timeout, so a waiting check must not wait for it.
    it('does not hold a fresh token’s check behind the stored one’s discovery', async () => {
      discoverBackups.mockImplementation(() => new Promise(() => {}));
      saveGoogleDriveCreds('stored-with-stalled-discovery', USER_A);
      sessionStorage.setItem(PENDING_GOOGLE_RESTORE_KEY, 'true');
      await emit('INITIAL_SESSION', sessionFor(USER_A));
      await waitFor(() => expect(drivePermission()).toBe('true'));

      sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
      sessionStorage.setItem('google_oauth_require_drive', 'true');
      await emit('SIGNED_IN', sessionFor(USER_A, 'fresh-after-stalled-discovery'));

      await waitFor(() =>
        expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } }),
      );
      expect(handshake).toHaveBeenLastCalledWith('fresh-after-stalled-discovery', false);
    });

    // A reset orphans a running check; its late answer must not land in the new state.
    it('drops the answer of a check a sign-out orphaned', async () => {
      let answer: (value: unknown) => void = () => {};
      handshake.mockImplementation(() => new Promise((resolve) => (answer = resolve)));
      saveGoogleDriveCreds('orphaned-by-sign-out', USER_A);
      await emit('INITIAL_SESSION', sessionFor(USER_A));

      await act(async () => {
        await contextSignOut?.(false);
      });
      answer({});
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(drivePermission()).toBe('null');
    });

    // A check superseded mid-flight moves on to the replacing token; a call for
    // that token must share its verdict rather than resolve on nothing.
    it('waits for the replacing token’s check when the stored one was superseded', async () => {
      let answerReplacement: (value: unknown) => void = () => {};
      let rejectFirst: (error: Error) => void = () => {};
      handshake.mockImplementation((token: unknown) =>
        token === 'replaced-mid-check'
          ? new Promise((_resolve, reject) => (rejectFirst = reject))
          : new Promise((resolve) => (answerReplacement = resolve)),
      );
      saveGoogleDriveCreds('replaced-mid-check', USER_A);
      await emit('INITIAL_SESSION', sessionFor(USER_A));

      // Another tab stored a newer token, then the Connect return arrived.
      saveGoogleDriveCreds('replacing-token', USER_A);
      sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
      sessionStorage.setItem('google_oauth_require_drive', 'true');
      rejectFirst(new Error('INVALID_GRANT'));
      await waitFor(() => expect(handshake).toHaveBeenLastCalledWith('replacing-token', false));
      await emit('SIGNED_IN', sessionFor(USER_A));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(returnFlags()[1]).toBe('true');

      answerReplacement({});
      await waitFor(() =>
        expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } }),
      );
      expect(handshake).toHaveBeenCalledTimes(2);
      expect(returnFlags()).toEqual([null, null]);
    });

    // An unstamped token predates owner tracking and may be another person's.
    it('does not finish a Connect against a stored token with no owner stamp', async () => {
      localStorage.setItem('google_drive_refresh_token', 'unstamped-connect-token');
      sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
      sessionStorage.setItem('google_oauth_require_drive', 'true');
      await emit('INITIAL_SESSION', sessionFor(USER_A));
      await emit('SIGNED_IN', sessionFor(USER_A));

      await waitFor(() => expect(returnFlags()).toEqual([null, null]));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(handshake).toHaveBeenCalledWith('unstamped-connect-token', false);
      expect(updateSync).not.toHaveBeenCalled();
      expect(signInWithOAuth).not.toHaveBeenCalled();
    });
  });

  // auth-js saves the exchanged session whole, so INITIAL_SESSION carries
  // the fresh token too, and neither event order can finish on the stored one.
  it.each([
    ['INITIAL_SESSION', 'SIGNED_IN'],
    ['SIGNED_IN', 'INITIAL_SESSION'],
  ])(
    'waits for the fresh token’s verdict over a stored one when %s arrives first',
    async (first, second) => {
      const fresh = `unticked-over-stored-${first}`;
      handshake.mockImplementation(async (token: unknown) => {
        if (token === fresh) throw new Error('INSUFFICIENT_SCOPE');
        return {};
      });
      saveGoogleDriveCreds(`working-stored-${first}`, USER_A);
      sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
      sessionStorage.setItem('google_oauth_require_drive', 'true');

      await emit(first, sessionFor(USER_A, fresh));
      await emit(second, sessionFor(USER_A, fresh));

      await waitFor(() => expect(drivePermission()).toBe('false'));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(updateSync).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
      expect(handshake.mock.calls.map(([token]) => token)).toEqual([fresh]);
      expect(signInWithOAuth).not.toHaveBeenCalled();
    },
  );

  it('ends a Drive return that brought no token once the consent retry is spent', async () => {
    // Stamped by the page that left for Google, minutes before this one loaded.
    sessionStorage.setItem('google_oauth_in_progress', String(Date.now() - 5 * 60 * 1000));
    sessionStorage.setItem('google_oauth_require_drive', 'true');
    sessionStorage.setItem(PENDING_GOOGLE_RESTORE_KEY, 'true');
    sessionStorage.setItem('google_oauth_consent_retry', '1');

    await emit('INITIAL_SESSION', sessionFor(USER_A));
    await emit('SIGNED_IN', sessionFor(USER_A));

    expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
    expect(sessionStorage.getItem('google_oauth_require_drive')).toBeNull();
    expect(sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY)).toBeNull();
    expect(updateSync).not.toHaveBeenCalled();
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });

  // A PKCE return emits SIGNED_IN, INITIAL_SESSION and SIGNED_IN; the retry's
  // redirect is still leaving when the later two arrive.
  it('keeps the consent retry’s flags through the events that follow it', async () => {
    // Stamped by the page that left for Google, minutes before this one loaded.
    sessionStorage.setItem('google_oauth_in_progress', String(Date.now() - 5 * 60 * 1000));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A));
    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
    await emit('INITIAL_SESSION', sessionFor(USER_A));
    await emit('SIGNED_IN', sessionFor(USER_A));

    expect(sessionStorage.getItem('google_oauth_require_drive')).toBe('true');
    expect(sessionStorage.getItem('google_oauth_in_progress')).not.toBeNull();
    expect(signInWithOAuth).toHaveBeenCalledTimes(1);
  });

  it('does not switch sync on for a fresh token when Drive refuses it', async () => {
    handshake.mockRejectedValue(new Error('UNAUTHORIZED'));
    sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A, 'fresh-refused'));

    await waitFor(() => expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(updateSync).not.toHaveBeenCalled();
    // Not a dead grant: the next Connect reuses it without a consent screen.
    expect(loadGoogleDriveCreds()).toBe('fresh-refused');
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });

  // The user just answered Google; a blip must not undo their Connect.
  it('switches sync on for a fresh token when Drive cannot be reached', async () => {
    handshake.mockRejectedValue(new Error('Failed to fetch'));
    sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A, 'fresh-unreachable'));

    await waitFor(() =>
      expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } }),
    );
    expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
    expect(drivePermission()).toBe('null');
    expect(loadGoogleDriveCreds()).toBe('fresh-unreachable');
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });

  // After a blip finished the return, re-checks take the card out of "checking".
  describe('after a blip finished a Drive return', () => {
    const blipReturn = async (token: string) => {
      sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
      sessionStorage.setItem('google_oauth_require_drive', 'true');
      sessionStorage.setItem(PENDING_GOOGLE_RESTORE_KEY, 'true');
      await emit('SIGNED_IN', sessionFor(USER_A, token));
      await vi.advanceTimersByTimeAsync(50);
    };

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout'] });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('re-checks, and keeps the restore prompt for a check that passes', async () => {
      handshake.mockRejectedValueOnce(new Error('Failed to fetch')).mockResolvedValue({});

      await blipReturn('blip-then-ok');
      expect(updateSync).toHaveBeenCalledWith({ googleDrive: { enabled: true } });
      expect(drivePermission()).toBe('null');
      expect(sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY)).toBe('true');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000);
      });
      expect(drivePermission()).toBe('true');
      expect(handshake.mock.calls.map(([token]) => token)).toEqual([
        'blip-then-ok',
        'blip-then-ok',
      ]);
      expect(sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY)).toBe('true');
    });

    it('starts one re-check chain although both events of the return finish it', async () => {
      handshake.mockRejectedValue(new Error('Failed to fetch'));
      const timers = vi.spyOn(globalThis, 'setTimeout');
      sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
      sessionStorage.setItem('google_oauth_require_drive', 'true');

      await emit('INITIAL_SESSION', sessionFor(USER_A, 'blip-two-events'));
      await emit('SIGNED_IN', sessionFor(USER_A, 'blip-two-events'));
      await vi.advanceTimersByTimeAsync(1_000);

      // Two chains would share each check through the dedupe, so count the scheduled re-checks.
      expect(timers.mock.calls.filter(([, delay]) => delay === 5_000)).toHaveLength(1);
      timers.mockRestore();
    });

    it('stops re-checking and disarms the restore prompt once the token is gone', async () => {
      handshake.mockRejectedValue(new Error('Failed to fetch'));

      await blipReturn('blip-then-signed-out');
      clearGoogleDriveCreds();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000 + 15_000 + 45_000);
      });

      expect(handshake).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY)).toBeNull();
    });

    it('gives up after three re-checks and disarms the restore prompt', async () => {
      handshake.mockRejectedValue(new Error('Failed to fetch'));

      await blipReturn('blip-forever');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000 + 15_000 + 45_000);
      });

      expect(handshake).toHaveBeenCalledTimes(4);
      expect(sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY)).toBeNull();
      expect(drivePermission()).toBe('null');
    });

    it('does not finish on an orphaned check whose token is gone', async () => {
      handshake.mockImplementation(async () => {
        clearGoogleDriveCreds();
        throw new Error('Failed to fetch');
      });

      await blipReturn('orphaned-by-sign-out');

      expect(updateSync).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
    });
  });

  // A return reached long after it started (Back into a cached page) is not the user's Connect.
  it('does not retry consent for a stale return that brought no token', async () => {
    sessionStorage.setItem('google_oauth_in_progress', String(Date.now() - 60 * 60 * 1000));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(signInWithOAuth).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('google_oauth_in_progress')).toBeNull();
    expect(sessionStorage.getItem('google_oauth_require_drive')).toBeNull();
  });

  it('does not switch Drive sync on, or re-ask, when a fresh connect lacks the Drive grant', async () => {
    handshake.mockRejectedValue(new Error('INSUFFICIENT_SCOPE'));
    sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A, 'unticked-drive-token'));

    await waitFor(() => expect(drivePermission()).toBe('false'));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(loadGoogleDriveCreds()).toBe('');
    expect(updateSync).not.toHaveBeenCalled();
    // The user answered Google moments ago; sending them straight back would loop.
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });
});

describe('AuthProvider Drive handshake taxonomy', () => {
  it('reports denied access only when Google actually refuses', async () => {
    handshake.mockRejectedValue(new Error('UNAUTHORIZED'));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A, 'revoked-token'));

    await waitFor(() => expect(drivePermission()).toBe('false'));
  });

  it('leaves an unfinished check undetermined instead of calling it denied', async () => {
    // A network failure, a 500, invalid_client. The check did not complete —
    // it did not come back saying access was revoked. Reporting `false` here
    // renders as "Reconnect Google Drive" and asks the user to re-consent for
    // nothing.
    handshake.mockRejectedValue(new Error('Failed to fetch'));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A, 'good-token'));

    await waitFor(() => expect(handshake).toHaveBeenCalled());
    expect(drivePermission()).toBe('null');
    // The credential is untouched: nothing about a failed request says it is bad.
    expect(loadGoogleDriveCreds()).toBe('good-token');
  });

  it('retries after an undetermined check instead of latching', async () => {
    // The dedupe key is set before the request, so an unknown failure would
    // otherwise be permanent for this token: the next call returns early and
    // the state stays null for the rest of the session.
    handshake.mockRejectedValueOnce(new Error('Failed to fetch'));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A, 'flaky-token'));
    await waitFor(() => expect(handshake).toHaveBeenCalledTimes(1));

    handshake.mockResolvedValue({});
    await emit('SIGNED_IN', sessionFor(USER_A, 'flaky-token'));

    await waitFor(() => expect(drivePermission()).toBe('true'));
    expect(handshake).toHaveBeenCalledTimes(2);
  });
});

describe('AuthProvider session restore', () => {
  // A restored session carries no `provider_refresh_token` — that only comes
  // back from a live OAuth redirect — so the stored credential is the only
  // thing there is to check. `hasDrivePermission` starts `null` and nothing
  // else sets it, and `useSyncAuthGateway` treats anything but `true` as "not
  // connected". Gating the handshake on the route is therefore not a saving:
  // it makes every deep link report a working Drive as disconnected.
  // A distinct token per case: `checkDrivePermission` dedupes on the last one
  // it saw, and that ref outlives a single case here.
  const restoreOn = async (pathname: string, token: string) => {
    window.history.replaceState({}, '', pathname);
    saveGoogleDriveCreds(token, USER_A);
    await emit('INITIAL_SESSION', sessionFor(USER_A));
  };

  it('checks the stored credential when reloading on a deep route', async () => {
    await restoreOn('/en/cvs', 'cvs-route-token');

    await waitFor(() => expect(drivePermission()).toBe('true'));
    expect(handshake).toHaveBeenCalledWith('cvs-route-token', false);
  });

  it('still checks it when reloading on the dashboard', async () => {
    await restoreOn('/en/dashboard', 'dashboard-route-token');

    await waitFor(() => expect(drivePermission()).toBe('true'));
  });
});

describe('AuthProvider consent prompting', () => {
  const promptFor = (call: number) =>
    signInWithOAuth.mock.calls[call]?.[0]?.options?.queryParams?.prompt;

  it('does not force the consent screen when a credential is already held', async () => {
    saveGoogleDriveCreds('existing-token', USER_A);

    await signIn({ requireDrive: true });

    // Forcing consent on every Drive authorization is what made the permission
    // feel repetitive: a user who had already granted Drive was walked through
    // the screen again for nothing.
    expect(promptFor(0)).toBeUndefined();
  });

  it('forces the consent screen over a stored token with no owner stamp', async () => {
    // Such a token cannot finish a Connect, so asking without consent would loop.
    localStorage.setItem('google_drive_refresh_token', 'unstamped-token');

    await signIn({ requireDrive: true });

    expect(promptFor(0)).toBe('consent');
  });

  it('forces the consent screen on a first connection', async () => {
    // Google issues a refresh token on first authorization or when
    // prompt=consent is sent. With nothing stored, not asking means coming
    // back empty-handed.
    await signIn({ requireDrive: true });

    expect(promptFor(0)).toBe('consent');
  });

  it('never forces consent for a plain sign-in', async () => {
    await signIn({ requireDrive: false });

    expect(promptFor(0)).toBeUndefined();
    expect(signInWithOAuth.mock.calls[0]?.[0]?.options?.scopes).toBeUndefined();
  });

  it('asks for offline access only when connecting Drive', async () => {
    await signIn({ requireDrive: false });
    await signIn({ requireDrive: true });

    const accessTypeFor = (call: number) =>
      signInWithOAuth.mock.calls[call]?.[0]?.options?.queryParams?.access_type;
    expect(accessTypeFor(0)).toBeUndefined();
    expect(accessTypeFor(1)).toBe('offline');
    expect(promptFor(1)).toBe('consent');
  });

  it('retries once with consent when Drive authorization comes back empty', async () => {
    // The consent loop: Google returns no refresh token because the grant
    // already exists, we have nothing stored, and the user lands on
    // "not connected" having done everything right.
    sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A));

    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
    expect(promptFor(0)).toBe('consent');
  });

  it('retries only once, so a persistent failure cannot loop', async () => {
    sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A));
    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));

    // Back again, still empty-handed. Without the guard this is an endless
    // redirect between KiwiCV and Google.
    await emit('SIGNED_IN', sessionFor(USER_A));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(signInWithOAuth).toHaveBeenCalledTimes(1);
  });

  it('does not retry when the flow never asked for Drive', async () => {
    sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
    sessionStorage.setItem('google_oauth_require_drive', 'false');

    await emit('SIGNED_IN', sessionFor(USER_A));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(signInWithOAuth).not.toHaveBeenCalled();
  });

  it('releases the retry guard once a token arrives', async () => {
    sessionStorage.setItem('google_oauth_in_progress', String(Date.now()));
    sessionStorage.setItem('google_oauth_require_drive', 'true');

    await emit('SIGNED_IN', sessionFor(USER_A));
    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));

    // The retry succeeds. A later genuine failure must be able to retry again,
    // so the one-shot guard cannot be allowed to linger.
    await emit('SIGNED_IN', sessionFor(USER_A, 'recovered-token'));
    await waitFor(() => expect(loadGoogleDriveCreds()).toBe('recovered-token'));

    expect(sessionStorage.getItem('google_oauth_consent_retry')).toBeNull();
  });
});

describe('AuthProvider writing sample', () => {
  const storeSample = (sample: string, owner?: string) =>
    localStorage.setItem(
      BRAND_STORAGE_KEYS.coverLetterStyle,
      JSON.stringify({ v: 1, sample, ...(owner ? { owner } : {}) }),
    );

  it('survives a reload while the user stays signed in', async () => {
    storeSample('Short, direct sentences.', USER_A);

    await emit('INITIAL_SESSION', sessionFor(USER_A));
    await emit('TOKEN_REFRESHED', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('Short, direct sentences.');
  });

  it('is cleared by an explicit sign-out', async () => {
    await emit('SIGNED_IN', sessionFor(USER_A));
    storeSample('Short, direct sentences.', USER_A);

    await act(async () => {
      await contextSignOut?.(false);
    });

    expect(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle)).toBeNull();
  });

  it('is cleared when the session ends without an explicit sign-out', async () => {
    storeSample('Short, direct sentences.', USER_A);

    // Expiry, revocation, or a sign-out in another tab. signOut() never runs.
    await emit('SIGNED_OUT', null);

    expect(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle)).toBeNull();
  });

  // The sequence supabaseLateSubscriber.test.ts measured: a refused startup
  // refresh reaches a late listener as INITIAL_SESSION with null, never SIGNED_OUT.
  it('is cleared when a different account signs in, with no Drive owner stored', async () => {
    storeSample('User A writes like this.', USER_A);

    await emit('INITIAL_SESSION', null);
    await emit('SIGNED_IN', sessionFor(USER_B));

    expect(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle)).toBeNull();
  });

  it('is cleared when a different account signs in over a Drive owner', async () => {
    saveGoogleDriveCreds('user-a-token', USER_A);
    storeSample('User A writes like this.', USER_A);

    await emit('SIGNED_IN', sessionFor(USER_B));

    expect(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle)).toBeNull();
  });

  it('is kept when the same account signs back in after a session that ended silently', async () => {
    await emit('SIGNED_IN', sessionFor(USER_A));
    const { result, unmount } = renderHook(() => useCoverLetterStyle());
    act(() => result.current.setSample('User A writes like this.'));
    unmount(); // flushes the debounced write, stamped by the session above

    await emit('INITIAL_SESSION', null);
    await emit('SIGNED_IN', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('User A writes like this.');
  });

  it('does not stamp a sample written after the session ended', async () => {
    await emit('SIGNED_IN', sessionFor(USER_A));
    await emit('INITIAL_SESSION', null);
    const { result, unmount } = renderHook(() => useCoverLetterStyle());
    act(() => result.current.setSample('Typed while signed out.'));
    unmount();

    expect(JSON.parse(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle) as string)).toEqual(
      { v: 1, sample: 'Typed while signed out.' },
    );
  });

  // Without the OAuth flag every one of these is a restored session, SIGNED_IN
  // included: supabase-js re-sends it on reload and on tab focus.
  it.each(['INITIAL_SESSION', 'TOKEN_REFRESHED', 'SIGNED_IN'])(
    'adopts an unstamped sample on a restored session (%s)',
    async (event) => {
      storeSample('Mine from before the stamp.');

      await emit(event, sessionFor(USER_A));

      expect(readCoverLetterStyle()).toBe('Mine from before the stamp.');
      expect(
        JSON.parse(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle) as string).owner,
      ).toBe(USER_A);
    },
  );

  it('keeps an unstamped sample through a reload’s measured order: SIGNED_IN, INITIAL_SESSION, SIGNED_IN on focus', async () => {
    storeSample('Mine from before the stamp.');

    await emit('SIGNED_IN', sessionFor(USER_A));
    await emit('INITIAL_SESSION', sessionFor(USER_A));
    await emit('SIGNED_IN', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('Mine from before the stamp.');
  });

  it('clears an unstamped sample on an OAuth return, in its measured order: INITIAL_SESSION, then SIGNED_IN', async () => {
    storeSample('Nobody can say whose this is.');
    await signIn({ requireDrive: false });

    await emit('INITIAL_SESSION', sessionFor(USER_B));

    expect(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle)).toBeNull();
    await emit('SIGNED_IN', sessionFor(USER_B));
    expect(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle)).toBeNull();
  });

  it('still clears it when the OAuth progress flag was dropped before the session arrived', async () => {
    storeSample('Nobody can say whose this is.');
    await signIn({ requireDrive: false });
    // The sign-in modal's safety effect, after the loading timeout.
    sessionStorage.removeItem('google_oauth_in_progress');

    await emit('INITIAL_SESSION', sessionFor(USER_B));

    expect(localStorage.getItem(BRAND_STORAGE_KEYS.coverLetterStyle)).toBeNull();
  });

  it('adopts it on a later tab-focus SIGNED_IN: the first session bind consumed the sign-in', async () => {
    await signIn({ requireDrive: false });
    await emit('INITIAL_SESSION', sessionFor(USER_A));
    storeSample('Mine from before the stamp.');

    await emit('SIGNED_IN', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('Mine from before the stamp.');
  });

  it('adopts it although an OAuth progress flag outlived its sign-in', async () => {
    sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
    storeSample('Mine from before the stamp.');

    await emit('INITIAL_SESSION', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('Mine from before the stamp.');
  });

  it('keeps a sample stamped for the account an OAuth sign-in brings back', async () => {
    storeSample('User A writes like this.', USER_A);
    await signIn({ requireDrive: false });

    await emit('SIGNED_IN', sessionFor(USER_A));
    await emit('INITIAL_SESSION', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('User A writes like this.');
  });

  it('forgets the sign-in when it fails to start', async () => {
    signInWithOAuth.mockResolvedValueOnce({ error: new Error('popup blocked') } as never);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      await contextSignIn?.({ requireDrive: false }).catch(() => {});
    });
    storeSample('Mine from before the stamp.');

    await emit('INITIAL_SESSION', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('Mine from before the stamp.');
  });

  it('forgets the sign-in on an explicit sign-out', async () => {
    await signIn({ requireDrive: false });
    await act(async () => {
      await contextSignOut?.(false);
    });
    storeSample('Mine from before the stamp.');

    await emit('INITIAL_SESSION', sessionFor(USER_A));

    expect(readCoverLetterStyle()).toBe('Mine from before the stamp.');
  });

  it('is not shown while signed out, and returns once its own account’s session binds', async () => {
    await emit('INITIAL_SESSION', null);
    storeSample('User A writes like this.', USER_A);
    const { result } = renderHook(() => useCoverLetterStyle());

    expect(readCoverLetterStyle()).toBe('');
    expect(result.current.sample).toBe('');

    await act(async () => {
      await emit('INITIAL_SESSION', sessionFor(USER_A));
    });

    expect(readCoverLetterStyle()).toBe('User A writes like this.');
    expect(result.current.sample).toBe('User A writes like this.');
  });
});
