// @vitest-environment jsdom
import { useFlowStore } from '@/store/ui/useFlowStore';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * `auth.source` is persisted and decides the post-sign-in redirect, and every
 * plain sign-in's return reads it. A source must therefore belong to the
 * opening that set it, never to an earlier one.
 */
afterEach(() => {
  useFlowStore.getState().resetAuth();
});

const source = () => useFlowStore.getState().auth.source;

describe('the Google sign-in source', () => {
  it('is replaced by a later opening that names none', () => {
    useFlowStore.getState().openGoogleLogin({ source: 'landing_try_ai' });
    // Closed the way usePostAuthNavigation closes it: no resetAuth.
    useFlowStore.getState().closeGoogleLogin();

    useFlowStore.getState().openGoogleLogin({ allowGitHub: true });

    expect(source()).toBeNull();
  });

  it('is replaced by a later opening that names another', () => {
    useFlowStore.getState().openGoogleLogin({ source: 'landing_try_ai' });
    useFlowStore.getState().openGoogleLogin({ source: 'sync' });

    expect(source()).toBe('sync');
  });

  // The try-AI redirect reads the source after usePostAuthNavigation has
  // already closed the modal, so closing must not be what clears it.
  it('survives closing, so the return it was opened for can still read it', () => {
    useFlowStore.getState().openGoogleLogin({ source: 'landing_try_ai' });
    useFlowStore.getState().closeGoogleLogin();

    expect(source()).toBe('landing_try_ai');
  });
});
