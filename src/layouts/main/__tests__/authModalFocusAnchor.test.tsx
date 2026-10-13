// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { DashboardHeaderActions } from '@/features/dashboard/layout/DashboardHeaderActions';
import { MainLayoutOverlays } from '@/layouts/main/MainLayoutOverlays';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The consuming half of the seam: an id in the store has to become a working
 * `restoreFocusTo` on the dialog that finally closes.
 *
 * ⚠️ `MainLayoutOverlays` is rendered, not a harness that resolves the id
 * itself. The whole defect this fixes is a hop nobody made, so a test that makes
 * the hop on the component's behalf pins nothing — an earlier phase's two
 * harnesses stood in for the call sites they were meant to protect.
 *
 * ⚠️ And the REAL `DashboardHeaderActions` renders the anchor, because **both**
 * remaining hops are placement facts no type or scan reaches: that the id is
 * passed to `ExportButton` at all, and that `ExportButton` puts it on the
 * `<button>` rather than its wrapping `<div>`. Two earlier cuts of this file
 * each bound one and left the other — first a hand-written
 * `<button id={…}>`, then `<ExportButton id={…}>` with the prop pass written
 * here. Both mutations survived `tsc`, all four runners and the lint census
 * (measured in review). An id on a `<div>` cannot take focus.
 */
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, hasDrivePermission: null, profile: null }),
}));

function renderOverlays() {
  return render(
    <MemoryRouter>
      {/* `HeaderActions` portals into this, so without it the whole header —
          and the anchor with it — renders nothing at all. */}
      <div id="header-actions" />
      {/* The real header, so nothing about where the anchor lands is written
          by this test. */}
      <DashboardHeaderActions />
      <MainLayoutOverlays
        closeUpdateModal={vi.fn()}
        currentVersion="4.3.5"
        isUpdateModalOpen={false}
        missedVersions={[]}
      />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useFlowStore.getState().resetAuth();
});

afterEach(() => {
  useFlowStore.getState().resetAuth();
});

describe('focus when an auth modal opened by another dialog closing is dismissed', () => {
  it('lands on the anchor the opening caller named', async () => {
    const user = userEvent.setup();
    useFlowStore
      .getState()
      .openGoogleLogin({ source: 'sync', restoreFocusToId: EXPORT_TRIGGER_ANCHOR_ID });

    renderOverlays();
    expect(await screen.findByRole('dialog')).toBeTruthy();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(document.getElementById(EXPORT_TRIGGER_ANCHOR_ID));
    });
    // Stated separately from the focus assertion, so the failure says WHY when
    // the id drifts onto a wrapper that cannot hold focus.
    expect(document.getElementById(EXPORT_TRIGGER_ANCHOR_ID)?.tagName).toBe('BUTTON');
  });

  /**
   * ⚠️ The GitHub leg, which the wiki claims is "carried in BOTH directions" and
   * which nothing covered: deleting the anchor from the GitHub side left `tsc`
   * and all 3,499 tests green (measured in review). Real flow:
   * Export → Set up → continue with GitHub → Escape.
   */
  it('carries the anchor across the hand-off to the GitHub modal', async () => {
    const user = userEvent.setup();
    useFlowStore
      .getState()
      .openGoogleLogin({ source: 'sync', restoreFocusToId: EXPORT_TRIGGER_ANCHOR_ID });

    renderOverlays();
    await user.click(await screen.findByRole('button', { name: /github/i }));

    // The hand-off closed one dialog and opened the other.
    await waitFor(() => {
      expect(useFlowStore.getState().auth.authSurface).toBe('github');
      expect(useFlowStore.getState().auth.restoreFocusToId).toBe(EXPORT_TRIGGER_ANCHOR_ID);
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(document.getElementById(EXPORT_TRIGGER_ANCHOR_ID));
    });
  });

  /**
   * ⚠️ The BACK leg. `MainLayoutOverlays`' comment claims the anchor is carried
   * in both directions, and only the forward one was bound — deleting the
   * re-thread on this side left `tsc` and all 3,499 tests green (measured in
   * review). Real flow: Export → Set up → continue with GitHub → Back →
   * Escape.
   */
  it('carries the anchor back from the GitHub modal to the sign-in modal', async () => {
    const user = userEvent.setup();
    useFlowStore.getState().openGitHubLogin({
      source: 'sync',
      allowBack: true,
      restoreFocusToId: EXPORT_TRIGGER_ANCHOR_ID,
    });

    renderOverlays();
    await user.click(await screen.findByRole('button', { name: /zurück|back/i }));

    await waitFor(() => {
      expect(useFlowStore.getState().auth.authSurface).toBe('google');
      expect(useFlowStore.getState().auth.restoreFocusToId).toBe(EXPORT_TRIGGER_ANCHOR_ID);
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(document.getElementById(EXPORT_TRIGGER_ANCHOR_ID));
    });
  });

  /**
   * ⚠️ Counted off the DOM, not with `queryAllByRole`: Radix marks the stale
   * dialog `aria-hidden`, and Testing Library's role queries skip those — so
   * the three tests above stayed green with two dialogs mounted, one of them
   * still holding a live personal-access-token input.
   */
  it('leaves exactly one dialog mounted after each leg of the hand-off', async () => {
    const user = userEvent.setup();
    const mountedDialogs = () => document.querySelectorAll('[role="dialog"]').length;

    useFlowStore
      .getState()
      .openGoogleLogin({ source: 'sync', restoreFocusToId: EXPORT_TRIGGER_ANCHOR_ID });

    renderOverlays();
    await waitFor(() => expect(mountedDialogs()).toBe(1));

    // Forward: sign-in → GitHub.
    await user.click(await screen.findByRole('button', { name: /github/i }));
    await waitFor(() => {
      expect(useFlowStore.getState().auth.authSurface).toBe('github');
      expect(mountedDialogs()).toBe(1);
    });

    // Back: GitHub → sign-in.
    await user.click(await screen.findByRole('button', { name: /zurück|back/i }));
    await waitFor(() => {
      expect(useFlowStore.getState().auth.authSurface).toBe('google');
      expect(mountedDialogs()).toBe(1);
    });

    await user.keyboard('{Escape}');
    await waitFor(() => expect(mountedDialogs()).toBe(0));
  });

  /**
   * ⚠️ Deliberately still `<body>`. A caller that did not name an anchor has an
   * opener that is still alive, or none at all — and a document-level default
   * across every auth entry point is the nearest survivor an earlier ruling rejected.
   * This pins that the seam adds no such default.
   */
  it('leaves focus alone when no anchor was named', async () => {
    const user = userEvent.setup();
    useFlowStore.getState().openGoogleLogin({ source: 'sync' });

    renderOverlays();
    expect(await screen.findByRole('dialog')).toBeTruthy();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(document.body);
  });
});
