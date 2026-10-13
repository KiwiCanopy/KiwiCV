// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SyncWorkflowModals } from '@/components/modals/SyncWorkflowModals';
import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { useUIStore } from '@/store/ui/useUIStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The export ⇄ gateway swap, which `activeSyncModal` performs as a single enum:
 * one dialog unmounts in the commit that mounts the other, so the control the
 * arriving dialog captures is already gone.
 *
 * ⚠️ Measured during review: on **both** legs `DialogFrame`'s first rung finds a
 * dead opener, so `restoreFocusTo` is the only rung that answers — deleting
 * either prop dropped focus to `<body>` with `tsc`, all four runners and the
 * lint census green. Two optional props, both unbound call sites.
 *
 * ⚠️ Its own file rather than `SyncWorkflowModals.test.tsx`, which mocks
 * `ExportModal` away and stubs the résumé store down to `{ meta: {} }`. Asserting
 * an optional prop through a mock of the component that receives it proves
 * nothing, so this renders both dialogs for real.
 */
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    hasDrivePermission: null,
    profile: null,
    signInWithGoogle: vi.fn(),
  }),
}));

vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => ({ github: 'active', googleDrive: 'not_configured' }),
}));

// The gateway only needs `performSync` from it, and the real hook reaches for
// the whole cloud stack.
vi.mock('@/hooks/useSyncWorkflow', () => ({
  useSyncWorkflow: () => ({ performSync: vi.fn() }),
}));

function renderExportChain(modal: 'gateway' | 'name') {
  useUIStore.getState().setSyncModal(modal, 'export');
  return render(
    <MemoryRouter initialEntries={['/de/dashboard']}>
      {/* The control that started the chain, and the only one that outlives
          both dialogs. */}
      <button id={EXPORT_TRIGGER_ANCHOR_ID}>Export</button>
      <Routes>
        <Route path="*" element={<SyncWorkflowModals />} />
      </Routes>
    </MemoryRouter>,
  );
}

const exportAnchor = () => document.getElementById(EXPORT_TRIGGER_ANCHOR_ID);

beforeEach(() => {
  useUIStore.getState().setSyncModal('none');
});

afterEach(() => {
  useUIStore.getState().setSyncModal('none');
});

describe('focus after the export ⇄ gateway swap', () => {
  it('lands on the export trigger when the gateway is dismissed', async () => {
    const user = userEvent.setup();
    renderExportChain('gateway');
    expect(await screen.findByRole('dialog')).toBeTruthy();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(exportAnchor());
    });
  });

  /** The reverse leg: the gateway's CTA swaps back to the export dialog. */
  it('lands on the export trigger when the export dialog is dismissed', async () => {
    const user = userEvent.setup();
    renderExportChain('name');
    expect(await screen.findByRole('dialog')).toBeTruthy();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(exportAnchor());
    });
  });

  /**
   * ⚠️ A gateway the user reached from somewhere else keeps a live opener, so it
   * must NOT be handed the export anchor — that would send focus to a control
   * they never pressed, which is the ruled-out "nearest survivor" fallback.
   */
  it('does not offer the export anchor to a gateway opened for another target', async () => {
    const user = userEvent.setup();
    useUIStore.getState().setSyncModal('gateway', 'manage');
    render(
      <MemoryRouter initialEntries={['/de/dashboard']}>
        <button id={EXPORT_TRIGGER_ANCHOR_ID}>Export</button>
        <Routes>
          <Route path="*" element={<SyncWorkflowModals />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('dialog')).toBeTruthy();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).not.toBe(exportAnchor());
  });
});
