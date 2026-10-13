// @vitest-environment jsdom
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * A **store** invariant, so it lives with the store rather than with whichever
 * feature happens to exercise it today. `_AuthIsSerializable` in `useFlowStore`
 * states why the slice must be JSON and makes a violation a build error; this
 * proves the round trip actually happens.
 */
afterEach(() => {
  useFlowStore.getState().resetAuth();
});

const persistedAuth = () => {
  const key = Object.keys(sessionStorage).find((name) =>
    (sessionStorage.getItem(name) ?? '').includes('authSurface'),
  );
  expect(key).toBeTruthy();
  return JSON.parse(sessionStorage.getItem(key!)!).state.auth;
};

describe('the auth slice across the OAuth redirect', () => {
  it('carries the focus anchor id through sessionStorage', () => {
    useFlowStore
      .getState()
      .openGoogleLogin({ source: 'sync', restoreFocusToId: EXPORT_TRIGGER_ANCHOR_ID });

    expect(persistedAuth().restoreFocusToId).toBe(EXPORT_TRIGGER_ANCHOR_ID);
  });
});

/**
 * The store outlives a deploy — its job is to survive the OAuth redirect — so a
 * tab mid-sign-in rehydrates the two booleans `authSurface` replaced.
 */
describe('a v0 auth slice rehydrated after the deploy', () => {
  // Spelled out rather than spread from today's slice, which already holds
  // `authSurface` and would let a no-op migration pass.
  const v0 = (isGoogleModalOpen: boolean, isGitHubModalOpen: boolean) =>
    JSON.stringify({
      state: {
        auth: {
          isGoogleModalOpen,
          isGitHubModalOpen,
          description: null,
          allowGitHub: true,
          source: 'sync',
          syncMode: null,
          isPendingRedirect: false,
          requireDrive: false,
          restoreFocusToId: null,
        },
      },
      version: 0,
    });

  it.each([
    [true, false, 'google'],
    [false, true, 'github'],
    [false, false, null],
    // Once reachable: GitHub's Back opened Google without closing itself.
    [true, true, 'google'],
  ] as const)('google=%s github=%s opens %s', async (google, github, surface) => {
    sessionStorage.setItem(BRAND_STORAGE_KEYS.flowState, v0(google, github));
    await useFlowStore.persist.rehydrate();

    const { auth } = useFlowStore.getState();
    // `toHaveProperty`, so the both-false case cannot pass on an absent field.
    expect(auth).toHaveProperty('authSurface', surface);
    expect(auth.source).toBe('sync');
    expect(auth).not.toHaveProperty('isGoogleModalOpen');
    expect(auth).not.toHaveProperty('isGitHubModalOpen');
  });
});
