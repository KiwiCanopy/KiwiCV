import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { PENDING_GOOGLE_RESTORE_KEY } from '@/constants/auth';
import { UNUSABLE_DRIVE_CREDENTIAL_ERRORS } from '@/constants/cloud';
import { clearExportDraft } from '@/hooks/export/exportDraft';
import { disconnectGitHub } from '@/hooks/sync/disconnectGitHub';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { LANGUAGES } from '@/locales';
import { AuthContext, type Profile } from '@/providers/AuthContext';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { googleDriveService } from '@/services/google-drive';
import {
  bindCoverLetterStyleToUser,
  clearStoredCoverLetterStyle,
  forgetCoverLetterStyleFreshSignIn,
  markCoverLetterStyleFreshSignIn,
} from '@/services/storage/coverLetterStyleStorage';
import {
  clearGoogleDriveCreds,
  getGoogleDriveCredsOwner,
  hasStoredGoogleDriveCreds,
  loadGoogleDriveCreds,
  saveGoogleDriveCreds,
} from '@/services/storage/googleStorage';
import { useCvLibraryStore } from '@/store/library/useCvLibraryStore';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { clearAvatarCache } from '@/utils/avatar-cache';
import { localizedPath, localizedUrl } from '@/utils/localeRouting';
import type { Session, User } from '@supabase/supabase-js';

/**
 * One-shot guard for the post-redirect consent retry. Session-scoped on
 * purpose: it must survive the redirect it triggers, and must not survive the
 * tab.
 */
const CONSENT_RETRY_KEY = 'google_oauth_consent_retry';
/** On the `Date.now()` clock the return stamps use; `performance.timeOrigin` drifts from it. */
const PAGE_LOADED_AT = Date.now();

/** What a handshake pass concluded. */
type DriveVerdict = 'usable' | 'unusable' | 'refused' | 'undetermined';

interface DriveCheck {
  /** The token the check settled on: a replacement, if the first was superseded. */
  token: string;
  pending: boolean;
  verdict: Promise<DriveVerdict>;
}

/**
 * The one Drive check that ran last, or is running. Every reset clears it, and
 * an `undetermined` verdict clears itself so its token is checked again.
 */
const driveCheckRef = { current: null as DriveCheck | null };
const lastFetchedProfileIdRef = { current: null as string | null };
/** The account the last session belonged to; a different one signing in is a user switch. */
const lastSessionUserIdRef = { current: null as string | null };

/**
 * In-memory state that belongs to whoever was signed in: the export dialog's
 * typed company, position and posting link, and the CV library rows (#63).
 */
function forgetSignedInUserMemory() {
  clearExportDraft();
  useCvLibraryStore.getState().reset();
}

// Security & Stability Constants
const PROFILE_CACHE_VERSION = 'v1';
const getProfileCacheKey = (userId: string) => `sb_profile_${userId}_${PROFILE_CACHE_VERSION}`;

/**
 * Where Google sends the user back to. Module scope alongside
 * `startGoogleOAuth`, which the post-redirect recovery calls from outside the
 * component; the UI language is read from the store rather than closed over.
 */
function getOAuthRedirectPath() {
  const pathLang = window.location.pathname.split('/')[1];
  const supportedLanguages = new Set<string>(LANGUAGES.map((language) => language.code));
  const lang = supportedLanguages.has(pathLang)
    ? pathLang
    : useUIStore.getState().appLanguage || 'en';

  const pathname = window.location.pathname;

  // If we are on the landing page or login page, default to dashboard
  // Otherwise, stay on the current page to allow resuming pending actions
  if (
    pathname === localizedPath(lang) ||
    pathname === localizedPath(lang) ||
    pathname.endsWith('/login') ||
    pathname === '/'
  ) {
    return localizedUrl(window.location.origin, lang);
  }

  return `${window.location.origin}${pathname}`;
}

/**
 * Starts the Google OAuth redirect.
 *
 * Module scope on purpose: the post-redirect recovery in the auth-state
 * listener needs to call this, and a component-scoped function would be either
 * a stale closure or an effect dependency that retriggers the subscription.
 * Nothing here reads component state — only sessionStorage and the module-level
 * Supabase client.
 */
async function startGoogleOAuth(options?: { requireDrive?: boolean; forceConsent?: boolean }) {
  const requireDrive = !!options?.requireDrive;
  try {
    sessionStorage.setItem('google_oauth_in_progress', Date.now().toString());
    markCoverLetterStyleFreshSignIn();
    sessionStorage.setItem('google_oauth_require_drive', requireDrive ? 'true' : 'false');

    if (requireDrive) {
      sessionStorage.setItem(PENDING_GOOGLE_RESTORE_KEY, 'true');
    } else {
      sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);
    }

    const oauthOptions: {
      redirectTo?: string;
      scopes?: string;
      queryParams?: {
        access_type?: string;
        prompt?: string;
      };
    } = {
      redirectTo: getOAuthRedirectPath(),
      queryParams: {
        // Offline access exists only to obtain the Drive refresh token, so a
        // plain sign-in does not ask Google for one (data minimisation).
        ...(requireDrive && { access_type: 'offline' }),
        // Google issues a refresh token on first authorization, or whenever
        // `prompt=consent` is sent, and at no other time. Sending it on every
        // Drive authorization is what made the permission feel repetitive:
        // users who had already granted Drive were walked through the consent
        // screen again for nothing.
        //
        // Ask for it only when we genuinely have no usable credential — a first
        // connection, or the recovery retry. When we do hold one, Google
        // returns the session without a refresh token and the stored credential
        // is kept, so the grant survives. An unstamped one cannot finish a
        // Connect (see the stored-credential return below), so it counts as none.
        ...(requireDrive &&
          (options?.forceConsent ||
            !hasStoredGoogleDriveCreds() ||
            !getGoogleDriveCredsOwner()) && {
            prompt: 'consent',
          }),
      },
    };

    if (requireDrive) {
      oauthOptions.scopes = 'https://www.googleapis.com/auth/drive.file';
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: oauthOptions,
    });

    if (error) throw error;
  } catch (error: unknown) {
    sessionStorage.removeItem('google_oauth_in_progress');
    sessionStorage.removeItem('google_oauth_require_drive');
    sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);
    forgetCoverLetterStyleFreshSignIn();
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error signing in with Google:', message);
    throw error;
  }
}

/** How long after leaving for Google a return still counts as the user's own Connect. */
const DRIVE_RETURN_MAX_AGE_MS = 10 * 60 * 1000;

/** Re-checks after a blip finished a return; then the restore prompt is disarmed. */
const DRIVE_BLIP_RECHECK_DELAYS_MS = [5_000, 15_000, 45_000];

/** A Drive return started within the window, so it is still the user's own Connect. */
function isFreshDriveReturn() {
  const startedAt = Number(sessionStorage.getItem('google_oauth_in_progress'));
  return startedAt > 0 && Date.now() - startedAt < DRIVE_RETURN_MAX_AGE_MS;
}

/**
 * Ends a pending Drive return whose stored credential just proved unusable. A
 * fresh return the user started retries once with consent; every other case
 * drops the return's flags, so no later auth event can redirect unprompted.
 */
function settleDeadDriveReturn({ mayRetryConsent }: { mayRetryConsent: boolean }) {
  if (sessionStorage.getItem('google_oauth_require_drive') !== 'true') return;
  if (mayRetryConsent && isFreshDriveReturn() && !sessionStorage.getItem(CONSENT_RETRY_KEY)) {
    sessionStorage.setItem(CONSENT_RETRY_KEY, '1');
    void startGoogleOAuth({ requireDrive: true, forceConsent: true });
    return;
  }
  dropDriveReturnFlags();
}

/** Ends a pending Drive return without switching sync on. */
function dropDriveReturnFlags() {
  sessionStorage.removeItem('google_oauth_in_progress');
  sessionStorage.removeItem('google_oauth_require_drive');
  sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasDrivePermission, setHasDrivePermission] = useState<boolean | null>(null);
  const [availableBackups, setAvailableBackups] = useState<Record<
    string,
    import('@/services/google-drive').DriveFile[]
  > | null>(null);

  const fetchProfile = useCallback(async (userId: string, retries = 3, force = false) => {
    if (!force && lastFetchedProfileIdRef.current === userId) {
      return;
    }
    lastFetchedProfileIdRef.current = userId;
    let count = 0;

    while (count <= retries) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          // Suppress noise from Supabase lock aborts during rapid reloads
          if (error.message !== 'The lock request is aborted') {
            console.error('Error fetching profile:', error.message);
          }
        }

        if (data) {
          setProfile(data);

          // Security: Filter out sensitive internal fields before caching in localStorage
          // We keep 'email' as it's needed for UI, but it's also already in the 'user' object.
          const { stripe_customer_id: _, ...safeProfile } = data;
          localStorage.setItem(getProfileCacheKey(userId), JSON.stringify(safeProfile));
          return;
        }

        // If not found, wait 1 second for the DB trigger to finish
        if (count < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        count++;
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        count++;
      }
    }
  }, []);

  /**
   * One handshake pass, with the token that replaced this one mid-check, or ''.
   * Writes nothing once `entry` stops being the current check (a reset orphaned it).
   */
  const runDriveCheck = useCallback(
    async (
      entry: DriveCheck,
      refreshToken: string,
      { mayRetryConsent }: { mayRetryConsent: boolean },
    ): Promise<{ verdict: DriveVerdict; supersededBy: string }> => {
      const isCurrent = () => driveCheckRef.current === entry;
      let supersededBy = '';
      let verdict: DriveVerdict = 'undetermined';

      // Reset state before checking to ensure we don't show stale data from a previous session
      setHasDrivePermission(null);
      setAvailableBackups(null);

      try {
        // Fast handshake, no discovery: the ExportModal can open right after the redirect.
        await googleDriveService.handshake(refreshToken, false);
        if (!isCurrent()) return { verdict, supersededBy };
        setHasDrivePermission(true);
        verdict = 'usable';
      } catch (err: unknown) {
        if (!isCurrent()) return { verdict, supersededBy };
        const error = err as Error;
        if (UNUSABLE_DRIVE_CREDENTIAL_ERRORS.has(error.message)) {
          // No drive.file grant, or a dead grant: it can never serve Drive, so it
          // goes whatever the sync state, and the next Connect sends prompt=consent.
          const stored = loadGoogleDriveCreds();
          // An emptied store (another tab cleared it) still owes this return a settle.
          if (stored === refreshToken || !stored) {
            if (stored) clearGoogleDriveCreds();
            settleDeadDriveReturn({ mayRetryConsent });
            setHasDrivePermission(false);
            verdict = 'unusable';
          } else {
            // Replaced mid-check: the verdict is about a token no longer held.
            supersededBy = stored;
          }
        } else if (error.message === 'UNAUTHORIZED') {
          console.info(
            'Google Drive sync: User has not granted Drive permissions yet (expected if not connected).',
          );
          setHasDrivePermission(false);
          verdict = 'refused';
        } else {
          // Everything else — a network failure, a 500, invalid_client — means
          // the check did not complete, not that access was denied. This used to
          // also set `false`, which renders as "Reconnect Google Drive": a
          // dropped connection told the user their Drive access had been revoked
          // and asked them to re-consent for nothing. `null` is the existing
          // "not determined" value and is what an unfinished check should leave
          // behind.
          console.error('Permission check failed:', error.message);
          setHasDrivePermission(null);
          verdict = 'undetermined';
        }
      }
      return { verdict, supersededBy };
    },
    [],
  );

  /**
   * Backup discovery after a usable verdict, outside the check's pending window:
   * it has no timeout, so nothing waits on it. Its failure leaves the backups
   * unknown, never the verdict.
   */
  const discoverDriveBackups = useCallback(async (entry: DriveCheck) => {
    try {
      // Small delay to ensure Google API stabilization after handshake
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (driveCheckRef.current !== entry) return;
      const backups = await googleDriveService.discoverBackups(entry.token);
      if (driveCheckRef.current === entry) setAvailableBackups(backups);
    } catch (err: unknown) {
      console.error('Drive backup discovery failed:', (err as Error).message);
    }
  }, []);

  /**
   * Resolves with the verdict on this token, or on the one that replaced it
   * mid-check, once the handshake settles. One check runs at a time: a call for
   * its token shares it, and a call for another token waits for it, then checks
   * again. A check orphaned by a reset resolves `undetermined`.
   */
  const checkDrivePermission = useCallback(
    function check(
      refreshToken: string,
      options: { mayRetryConsent: boolean },
    ): Promise<DriveVerdict> {
      const last = driveCheckRef.current;
      if (last?.token === refreshToken) return last.verdict;
      if (last?.pending) return last.verdict.then(() => check(refreshToken, options));

      // Read before the handshake: the restore prompt clears it once the handshake passes.
      const shouldDiscover = sessionStorage.getItem(PENDING_GOOGLE_RESTORE_KEY) === 'true';
      const entry = { token: refreshToken, pending: true } as DriveCheck;
      const isCurrent = () => driveCheckRef.current === entry;
      driveCheckRef.current = entry;
      entry.verdict = (async () => {
        try {
          // A replacing token is never this call's to re-ask consent for.
          let pass = await runDriveCheck(entry, refreshToken, options);
          while (pass.supersededBy && isCurrent()) {
            entry.token = pass.supersededBy;
            pass = await runDriveCheck(entry, pass.supersededBy, { mayRetryConsent: false });
          }
          if (!isCurrent()) return 'undetermined';
          // An unfinished check must not latch, or this token stays unchecked all session.
          if (pass.verdict === 'undetermined') driveCheckRef.current = null;
          if (pass.verdict === 'usable' && shouldDiscover) void discoverDriveBackups(entry);
          return pass.verdict;
        } finally {
          entry.pending = false;
        }
      })();
      return entry.verdict;
    },
    [runDriveCheck, discoverDriveBackups],
  );

  // TODO: Cross-Tab Sync (Future Enhancement)
  // We've decided to keep this disabled for now to avoid disruptive reloads during active checkouts.
  /*
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('sb_profile_') && !e.newValue) {
        // If profile was removed in another tab, it means they logged out
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  */

  useEffect(() => {
    let isMounted = true;

    // 1. Safety Timeout: Ensure loading doesn't hang indefinitely on slow/unstable mobile connections
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading((prev) => {
          if (prev) {
            console.warn('Auth initialization timed out, forcing loading to false');
            return false;
          }
          return prev;
        });
      }
    }, 6000);

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);

      if (currentUser) {
        // OPTIMISTIC: Load cached profile immediately to prevent UI flicker
        const cached = localStorage.getItem(getProfileCacheKey(currentUser.id));
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch (_e) {
            console.warn('Failed to parse cached profile');
          }
        }

        // We can stop loading now as we have the session and an (optional) cached profile.
        // The background fetch will update the profile silenty.
        setLoading(false);
        clearTimeout(loadingTimeout);

        // Fetch fresh profile in the background
        fetchProfile(currentUser.id).catch((err) => {
          // Suppress noise from Supabase lock aborts during rapid reloads
          if (err?.message !== 'The lock request is aborted') {
            console.error('Background profile fetch failed:', err);
          }
        });
      } else {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    const blipTimers = new Set<ReturnType<typeof setTimeout>>();

    /**
     * A return finished on a blip leaves the card "checking" until a check answers,
     * and the next auth event may be an hour away. Re-check a few times; a chain that
     * ends without a usable verdict drops the restore prompt, so a late success cannot navigate.
     */
    const recheckAfterBlip = (token: string, attempt = 0) => {
      if (attempt >= DRIVE_BLIP_RECHECK_DELAYS_MS.length) {
        sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);
        return;
      }
      const timer = setTimeout(() => {
        blipTimers.delete(timer);
        // Signed out, switched user, or replaced in another tab.
        if (loadGoogleDriveCreds() !== token) {
          sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);
          return;
        }
        void checkDrivePermission(token, { mayRetryConsent: false }).then((verdict) => {
          if (verdict === 'undetermined') recheckAfterBlip(token, attempt + 1);
        });
      }, DRIVE_BLIP_RECHECK_DELAYS_MS[attempt]);
      blipTimers.add(timer);
    };

    /**
     * A blip is not a refusal: the return finishes and sync waits inert until a
     * re-check passes. Only while the checked token is still the one stored — an
     * orphaned check (sign-out, user switch) also resolves `undetermined`. Both
     * events of one return land here; only the one that ends it starts re-checks.
     */
    const finishOnBlip = (token: string, finish: () => void) => {
      if (loadGoogleDriveCreds() !== token) return false;
      const endsReturn = !!sessionStorage.getItem('google_oauth_in_progress');
      finish();
      if (endsReturn) recheckAfterBlip(token);
      return true;
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      try {
        if (!session) {
          bindCoverLetterStyleToUser(null);
          setSession(null);
          setUser(null);
          setProfile(null);
          setHasDrivePermission(null);
          setAvailableBackups(null);

          // Explicit sign-outs run their own cleanup in signOut(), but sessions
          // can also end without it: token expiry/revocation or a logout in
          // another tab (Supabase broadcasts SIGNED_OUT cross-tab). Wipe cached
          // profile data and avatars here too so nothing lingers in localStorage.
          if (event === 'SIGNED_OUT') {
            // The Drive refresh token goes with the session, however the session
            // ended. `signOut()` already clears it, but this branch exists
            // precisely for the sign-outs that do not run it — expiry,
            // revocation, another tab — and it used to leave a standing
            // capability against the user's Google Drive sitting in
            // localStorage indefinitely.
            //
            // The GitHub PAT deliberately stays: it is an independent
            // credential the user opted into remembering, GitHub sync works
            // while signed out (`useSyncAuthGateway` requires no user), and it
            // has its own Disconnect. A user-initiated sign-out offers its
            // removal (`useSignOutFlow`); it is also cleared on a user
            // *switch* below, which is a different person rather than the same
            // person leaving.
            clearGoogleDriveCreds();
            clearAvatarCache();
            // The writing sample is personal text; it leaves with every session.
            clearStoredCoverLetterStyle();
            try {
              Object.keys(localStorage)
                .filter((key) => key.startsWith('sb_profile_'))
                .forEach((key) => localStorage.removeItem(key));
            } catch {
              // Ignore storage access issues
            }
            lastFetchedProfileIdRef.current = null;
            driveCheckRef.current = null;
            lastSessionUserIdRef.current = null;
            forgetSignedInUserMemory();
          }

          // Stale flag cleanup: If we are not logged in but have a flag,
          // check if it's older than 10 seconds. If so, it's likely a stale flag
          // from an aborted or failed login attempt.
          const oauthFlag = sessionStorage.getItem('google_oauth_in_progress');
          if (oauthFlag) {
            const timestamp = parseInt(oauthFlag, 10);
            if (isNaN(timestamp) || Date.now() - timestamp > 10000) {
              sessionStorage.removeItem('google_oauth_in_progress');
              sessionStorage.removeItem('google_oauth_require_drive');
            }
          }
          setLoading(false);
          clearTimeout(loadingTimeout);
          return;
        }

        // A different account than the one these credentials were stored for.
        // localStorage is shared by everyone using the browser profile, so
        // without this the second person to sign in inherits the first
        // person's standing Drive capability and GitHub PAT — and, because a
        // base login used to overwrite the Drive token, could quietly take it
        // over. Both are cleared before anything reads them.
        //
        // An absent owner is credentials written before this key existed, and
        // is deliberately not a mismatch: they belong to whoever is signing in
        // on their own browser, and treating them as foreign would force an
        // unnecessary re-consent on every existing user. Restore keeps working;
        // only a Connect over one re-consents, so its fresh token is stamped.
        const credsOwner = getGoogleDriveCredsOwner();
        if (credsOwner && credsOwner !== session.user.id) {
          clearGoogleDriveCreds();
          disconnectGitHub();
          driveCheckRef.current = null;
        }
        // Independent of Drive: a session can end without SIGNED_OUT.
        bindCoverLetterStyleToUser({ userId: session.user.id });
        // Only a switch: a signed-out visitor signing in keeps the draft they typed.
        if (lastSessionUserIdRef.current && lastSessionUserIdRef.current !== session.user.id) {
          forgetSignedInUserMemory();
        }
        lastSessionUserIdRef.current = session.user.id;

        // --- OPTIMISTIC UPDATE: Set state immediately to avoid blocking on hangs ---
        setSession(session);
        setUser(session.user);

        // Try to load cached profile instantly
        const cachedProfile = localStorage.getItem(getProfileCacheKey(session.user.id));
        if (cachedProfile) {
          try {
            setProfile(JSON.parse(cachedProfile));
          } catch (_e) {
            console.warn('Failed to parse cached profile');
          }
        }
        // -------------------------------------------------------------------------

        // 1. Fetch current profile from database
        // Only show loading screen if we don't have a cached profile yet
        const hasData = !!cachedProfile;
        if (!hasData) setLoading(true);

        // Clear timeout as we are now processing an auth change successfully
        clearTimeout(loadingTimeout);

        fetchProfile(session.user.id, 3, true)
          .catch((err) => {
            if (err?.message !== 'The lock request is aborted') {
              console.error('Profile fetch failed:', err);
            }
          })
          .finally(() => {
            if (isMounted) setLoading(false);
          });

        const storedToken = loadGoogleDriveCreds();

        // Any restored session with a stored credential gets the handshake, on
        // whatever route it was restored on. This used to run only for `/`,
        // `/<lang>` and `/settings`, which reads as a cold-start saving but is
        // a correctness gate: `hasDrivePermission` starts `null` and nothing
        // else determines it, and `useSyncAuthGateway` requires `=== true`. So
        // reloading straight onto My CVs — or any deep link — left Drive
        // looking disconnected until the user re-authorized something that had
        // never lapsed. `checkDrivePermission` already dedupes per token and
        // refuses to run concurrently, so this is one handshake per session,
        // not one per navigation.
        const requestedDrive = sessionStorage.getItem('google_oauth_require_drive') === 'true';
        // INITIAL_SESSION carries the fresh token too: auth-js stores the exchanged session whole.
        const willGetFreshToken = requestedDrive && session.provider_refresh_token;
        const storedCheck =
          storedToken && !willGetFreshToken
            ? checkDrivePermission(storedToken, { mayRetryConsent: true })
            : null;

        // 2. ONLY sync metadata (network call) during an actual login event
        if (event === 'SIGNED_IN') {
          const syncMetadata = async (targetUser: User) => {
            const metadata = targetUser.user_metadata;
            if (metadata && (metadata.full_name || metadata.avatar_url)) {
              const { data: latestProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', targetUser.id)
                .maybeSingle();

              if (latestProfile) {
                const needsNameUpdate =
                  metadata.full_name && metadata.full_name !== latestProfile.full_name;
                const needsAvatarUpdate =
                  metadata.avatar_url && metadata.avatar_url !== latestProfile.avatar_url;
                const isMissingData = !latestProfile.full_name || !latestProfile.avatar_url;

                if (isMissingData || needsNameUpdate || needsAvatarUpdate) {
                  await supabase
                    .from('profiles')
                    .update({
                      full_name: metadata.full_name || latestProfile.full_name,
                      avatar_url: metadata.avatar_url || latestProfile.avatar_url,
                    })
                    .eq('id', targetUser.id);
                  await fetchProfile(targetUser.id, 3, true);
                }
              }
            }
          };

          // Try to get fresh data but don't block
          supabase.auth
            .getUser()
            .then(({ data: { user: freshUser } }) => {
              if (freshUser) {
                setUser(freshUser);
                syncMetadata(freshUser);
              } else {
                syncMetadata(session.user);
              }
            })
            .catch(() => {
              syncMetadata(session.user);
            });
        } else {
          // For other events, we already set the user optimistically
        }

        const finishOAuthReturn = () => {
          const isNewOAuth = !!sessionStorage.getItem('google_oauth_in_progress');
          const oauthRequireDrive = sessionStorage.getItem('google_oauth_require_drive') === 'true';

          if (isNewOAuth) {
            if (oauthRequireDrive) {
              const store = useResumeStore.getState();
              store.updateSync({ googleDrive: { ...store.sync?.googleDrive, enabled: true } });

              analytics.track(ANALYTICS_EVENTS.SYNC_PROVIDER_CONNECTED, {
                provider: 'google_drive',
              });
            }

            // Mark for redirection if login originated from landing page try AI
            const flowStore = useFlowStore.getState();
            if (flowStore.auth.source === 'landing_try_ai') {
              flowStore.setPendingRedirect(true);
            }

            // We've processed this OAuth flow, clear the flags
            sessionStorage.removeItem('google_oauth_in_progress');
            sessionStorage.removeItem('google_oauth_require_drive');
          }

          const currentSync = useResumeStore.getState().sync?.googleDrive;

          if (currentSync?.enabled && isNewOAuth && oauthRequireDrive) {
            // Delay slightly to ensure UI has settled (modals mounted etc.)
            setTimeout(() => {
              window.dispatchEvent(new Event('google-sync-ready'));
            }, 100);
          }
        };

        // Only a flow that asked for Drive stores Google's refresh token or
        // sends it to the functions; a plain sign-in keeps no Google credential.
        if (requestedDrive && session.provider_refresh_token) {
          saveGoogleDriveCreds(session.provider_refresh_token, session.user.id);

          // A token came back, so the recovery below is not needed and its
          // one-shot guard must not linger — a later genuine failure has to be
          // able to retry.
          sessionStorage.removeItem(CONSENT_RETRY_KEY);

          // This token is the user's answer at Google; re-asking would only bounce them back.
          const freshToken = session.provider_refresh_token;
          checkDrivePermission(freshToken, { mayRetryConsent: false }).then((verdict) => {
            if (verdict === 'usable') return finishOAuthReturn();
            // `unusable` was already settled by the check.
            if (verdict === 'unusable') return;
            if (verdict === 'refused' || !finishOnBlip(freshToken, finishOAuthReturn)) {
              dropDriveReturnFlags();
            }
          });
        } else if (!requestedDrive && sessionStorage.getItem('google_oauth_in_progress')) {
          // A plain sign-in's return: no token to wait on, so it finishes here.
          finishOAuthReturn();
        } else if (
          requestedDrive &&
          sessionStorage.getItem('google_oauth_in_progress') &&
          storedCheck
        ) {
          // No fresh token: Google sends one only with consent, which a Connect
          // over a stored credential omits. The stored one decides the return,
          // and every verdict ends it, so no later event can redirect.
          // Only a token stamped for this account may switch sync on: an unstamped
          // one may be another person's, so Connect asks for consent instead.
          storedCheck.then((verdict) => {
            // `unusable` was already settled by the check, possibly into a consent retry.
            if (verdict === 'unusable') return;
            if (getGoogleDriveCredsOwner() !== session.user.id) return dropDriveReturnFlags();
            if (verdict === 'usable') return finishOAuthReturn();
            if (verdict === 'refused' || !finishOnBlip(storedToken, finishOAuthReturn)) {
              dropDriveReturnFlags();
            }
          });
        } else if (
          // We just came back from an OAuth flow that asked for Drive, and we
          // have nothing to show for it: no fresh refresh token, and none
          // stored. Google only issues one on first authorization or when
          // `prompt=consent` is sent, so a user in this position would land on
          // "not connected" having done everything correctly — a loop where
          // pressing Connect changes nothing. It cannot be predicted before the
          // redirect; it can only be detected after.
          //
          // Retry exactly once, forcing consent. The guard is what keeps this
          // from becoming the redirect loop it exists to prevent, and it is
          // cleared above the moment a token does arrive.
          sessionStorage.getItem('google_oauth_require_drive') === 'true' &&
          isFreshDriveReturn() &&
          !hasStoredGoogleDriveCreds() &&
          !sessionStorage.getItem(CONSENT_RETRY_KEY)
        ) {
          sessionStorage.setItem(CONSENT_RETRY_KEY, '1');
          console.info('Drive authorization returned no refresh token; retrying with consent.');
          void startGoogleOAuth({ requireDrive: true, forceConsent: true });
        } else if (
          requestedDrive &&
          sessionStorage.getItem('google_oauth_in_progress') &&
          Number(sessionStorage.getItem('google_oauth_in_progress')) < PAGE_LOADED_AT
        ) {
          // No token at all and the consent retry already spent: the return has
          // nothing left to wait on, so it ends rather than lingering.
          // A flag stamped after this page loaded is a retry still leaving: auth-js
          // emits more events before unload.
          dropDriveReturnFlags();
        }
      } catch (error) {
        // Suppress noise from Supabase lock aborts during rapid reloads
        const err = error as { message?: string; name?: string };
        if (err?.message !== 'The lock request is aborted' && err?.name !== 'AbortError') {
          console.error('Auth change error:', error);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
      blipTimers.forEach(clearTimeout);
    };
  }, [fetchProfile, checkDrivePermission, addToast]);

  // Handle post-redirect consent update globally
  useEffect(() => {
    const updateConsent = async () => {
      const termsGiven = sessionStorage.getItem('consent_terms_given') === 'true';
      const privacyGiven = sessionStorage.getItem('consent_privacy_given') === 'true';

      // Only update if we have a user and profile, and at least one new consent flag exists
      if (user && profile && (termsGiven || privacyGiven)) {
        const { error } = await supabase
          .from('profiles')
          .update({
            accepted_terms: termsGiven || profile.accepted_terms,
            accepted_privacy: privacyGiven || profile.accepted_privacy,
          })
          .eq('id', user.id);

        if (!error) {
          sessionStorage.removeItem('consent_terms_given');
          sessionStorage.removeItem('consent_privacy_given');
          await fetchProfile(user.id, 3, true);
        } else {
          console.error('Error updating consent:', error.message);
        }
      }
    };

    updateConsent();
  }, [user, profile, fetchProfile]);

  const signInWithGoogle = startGoogleOAuth;

  const googleSignin = async (
    terms: boolean,
    privacy: boolean,
    options?: { requireDrive?: boolean },
  ) => {
    if (!terms || !privacy) {
      addToast(t('auth.consent_mandatory'), 'error');
      return;
    }

    try {
      // Store consent intent in sessionStorage to persist through OAuth redirect
      // This is crucial because redirects reset the application state.
      sessionStorage.setItem('consent_terms_given', 'true');
      sessionStorage.setItem('consent_privacy_given', 'true');
      await signInWithGoogle(options);
    } catch (error) {
      console.error('Unified Google sign in failed:', error);
      addToast(t('auth.error_login_failed'), 'error');
    }
  };

  const signOut = async (showToast = true) => {
    try {
      // 1. Clear cloud credentials and caches
      clearGoogleDriveCreds();
      clearAvatarCache();
      clearStoredCoverLetterStyle();
      forgetCoverLetterStyleFreshSignIn();
      forgetSignedInUserMemory();
      lastSessionUserIdRef.current = null;

      // 2. Disable cloud sync in the store but preserve local resume data
      useResumeStore.getState().updateSync({ googleDrive: { enabled: false } });

      // 3. Reset internal guards to allow fresh scans if signing back in
      driveCheckRef.current = null;
      lastFetchedProfileIdRef.current = null;

      // 4. Clear all auth-related session flags to ensure a clean slate
      sessionStorage.removeItem(PENDING_GOOGLE_RESTORE_KEY);
      sessionStorage.removeItem('google_oauth_in_progress');
      sessionStorage.removeItem('google_oauth_require_drive');
      sessionStorage.removeItem(CONSENT_RETRY_KEY);
      sessionStorage.removeItem('consent_terms_given');
      sessionStorage.removeItem('consent_privacy_given');

      // 5. Clear internal state and cache immediately for a snappier UI response
      if (user) {
        localStorage.removeItem(getProfileCacheKey(user.id));
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setHasDrivePermission(null);
      setAvailableBackups(null);

      // 6. Perform the actual Supabase sign-out
      // scope: 'local' only ends THIS browser's session. The default ('global')
      // revokes every refresh token of the user, which silently kills sessions
      // on other devices/origins (e.g. prod vs. Netlify previews) and surfaces
      // as random logouts there once the access token expires.
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Error signing out:', error.message);
        // We don't throw here to ensure the UI remains in a "signed out" state
        // even if the server-side call fails (e.g. network issue).
      }

      if (showToast) {
        addToast(t('auth.success_logout'), 'success');
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, 3, true);
    }
  }, [user, fetchProfile]);

  const [now] = useState(() => Date.now());
  const premiumUntil = profile?.premium_until;

  const isPremium = useMemo(() => {
    if (!premiumUntil) return false;
    return new Date(premiumUntil).getTime() > now;
  }, [premiumUntil, now]);

  const value = {
    user,
    session,
    profile: profile ? { ...profile, isPremium } : null,
    loading,
    signInWithGoogle,
    googleSignin,
    signOut,
    refreshProfile,
    isPremium,
    hasDrivePermission,
    availableBackups,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
