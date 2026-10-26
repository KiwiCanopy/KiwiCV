// @vitest-environment jsdom
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { COVER_LETTER_DEFAULT_TONE } from '@/constants/ai';
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

/**
 * v1 stored `coverLetterMatchStyle: false` before any pick, so a tab open across
 * the deploy would otherwise read it as a pick and never get the default (#56).
 */
describe('a v1 cover-letter voice rehydrated after the deploy', () => {
  const v1 = (coverLetterMatchStyle: boolean, coverLetterTone: string) =>
    JSON.stringify({
      state: {
        prompt: { ...useFlowStore.getState().prompt, coverLetterMatchStyle, coverLetterTone },
      },
      version: 1,
    });

  it.each([
    [false, COVER_LETTER_DEFAULT_TONE, null],
    [false, 'warm', false],
    [true, COVER_LETTER_DEFAULT_TONE, true],
  ] as const)('match=%s tone=%s rehydrates as %s', async (match, tone, expected) => {
    sessionStorage.setItem(BRAND_STORAGE_KEYS.flowState, v1(match, tone));
    await useFlowStore.persist.rehydrate();

    expect(useFlowStore.getState().prompt.coverLetterMatchStyle).toBe(expected);
  });

  it('runs after the v0 auth step in one rehydrate', async () => {
    sessionStorage.setItem(
      BRAND_STORAGE_KEYS.flowState,
      JSON.stringify({
        state: {
          auth: { ...useFlowStore.getState().auth, isGoogleModalOpen: true },
          prompt: { ...useFlowStore.getState().prompt, coverLetterMatchStyle: false },
        },
        version: 0,
      }),
    );
    await useFlowStore.persist.rehydrate();

    expect(useFlowStore.getState().auth.authSurface).toBe('google');
    expect(useFlowStore.getState().prompt.coverLetterMatchStyle).toBeNull();
  });
});
