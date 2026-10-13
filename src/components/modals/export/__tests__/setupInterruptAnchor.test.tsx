// @vitest-environment jsdom
import { ExportModal } from '@/components/modals/export/ExportModal';
import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `ExportModalBody.handleSetup` closes the dialog its own `Set up` button lives
 * in and opens the auth modal in one state update, so `DialogFrame` captures an
 * opener that is unmounted before it can be restored to.
 *
 * ⚠️ The anchor is the OUTER flow's starting control — the header's Export
 * button — not this row's, and not the dialog's. Measured in the running app:
 * after `Set up`, the pressed control reports `isConnected: false` while
 * `#export-trigger` reports `true`.
 */
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, hasDrivePermission: null, profile: null }),
}));

vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => ({ github: 'not_configured', googleDrive: 'not_configured' }),
}));

beforeEach(() => {
  useFlowStore.getState().resetAuth();
});

afterEach(() => {
  useFlowStore.getState().resetAuth();
  vi.restoreAllMocks();
});

describe('the export dialog interrupting itself for sign-in', () => {
  it('names the export trigger as the anchor, through the flow store', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ExportModal isOpen onClose={onClose} onSetupRequired={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: /set up/i }));

    await waitFor(() => {
      const { auth } = useFlowStore.getState();
      // The surface carrying the pressed control is being closed…
      expect(onClose).toHaveBeenCalled();
      // …and the auth modal that replaces it knows where the flow began.
      expect(auth.authSurface).toBe('google');
      expect(auth.restoreFocusToId).toBe(EXPORT_TRIGGER_ANCHOR_ID);
    });
  });
});
