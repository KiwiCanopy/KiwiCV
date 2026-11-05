// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useSyncWorkflow } from '@/hooks/useSyncWorkflow';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { service: string; success: boolean; error?: string };
type Outcome = { success: boolean; results: Result[]; error?: string };

const handleSync = vi.fn<() => Promise<Outcome>>();
vi.mock('@/hooks/useCloudSync', () => ({ useCloudSync: () => ({ handleSync }) }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, hasDrivePermission: null }),
}));
vi.mock('@/hooks/sync/useSyncAuthGateway', () => ({
  useSyncAuthGateway: () => ({ ensureConnected: vi.fn() }),
}));
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { BACKUP_PERFORMED: 'backup_performed' },
  analytics: { track: vi.fn() },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/en/dashboard']}>{children}</MemoryRouter>
);

async function backUp(outcome: Outcome | Error) {
  if (outcome instanceof Error) handleSync.mockRejectedValue(outcome);
  else handleSync.mockResolvedValue(outcome);
  const { result } = renderHook(() => useSyncWorkflow({ mode: 'sync' }), { wrapper });
  await act(async () => {
    await result.current.performSync();
  });
  return result;
}

const dialog = () => {
  const { isOpen, options } = useConfirmStore.getState();
  return {
    isOpen,
    isLoading: options.isLoading,
    variant: options.variant,
    message: options.message,
  };
};
const errorDialog = (message: string) => ({
  isOpen: true,
  isLoading: false,
  variant: 'destructive',
  message,
});

describe('Back up failing at a provider (#93)', () => {
  beforeEach(() => {
    useConfirmStore.getState().close();
    useFlowStore.getState().resetAuth();
  });

  it('resolves the loading dialog to the failure, with a way out', async () => {
    const result = await backUp({
      success: false,
      results: [{ service: 'github', success: false, error: 'Bad credentials' }],
    });

    expect(dialog()).toEqual(
      errorDialog('sync.export_dialog.dest_github_repo_label: Bad credentials'),
    );
    expect(useConfirmStore.getState().options.showCloseButton).toBe(true);
    expect(result.current.syncStatus).toBe('error');
    expect(result.current.errorMessage).toBe('Bad credentials');
  });

  it('names what failed in a partial success', async () => {
    const result = await backUp({
      success: false,
      results: [
        { service: 'google_drive', success: true },
        { service: 'github', success: false, error: 'Bad credentials' },
      ],
    });

    expect(dialog()).toEqual(
      errorDialog('sync.export_dialog.dest_github_repo_label: Bad credentials'),
    );
    expect(result.current.syncStatus).toBe('success');
  });

  it('names every provider when all of them failed', async () => {
    await backUp({
      success: false,
      results: [
        { service: 'github', success: false, error: 'Bad credentials' },
        { service: 'google_drive', success: false, error: 'Quota' },
      ],
    });

    expect(dialog()).toEqual(
      errorDialog(
        'sync.export_dialog.dest_github_repo_label: Bad credentials sync.export_dialog.dest_google_drive_label: Quota',
      ),
    );
  });

  it('shows an error the sync returned without any provider result', async () => {
    await backUp({ success: false, results: [], error: 'Offline' });

    expect(dialog()).toEqual(errorDialog('Offline'));
    expect(useFlowStore.getState().auth.source).not.toBe('sync');
  });

  it('hands a missing connection to the login dialog, which says so itself', async () => {
    await backUp({
      success: false,
      results: [{ service: 'github', success: false, error: 'PAT missing' }],
    });

    expect(useConfirmStore.getState().isOpen).toBe(false);
    expect(useFlowStore.getState().auth.source).toBe('sync');
  });

  it('reports a thrown failure the same way', async () => {
    await backUp(new Error('Network down'));

    expect(dialog()).toEqual(errorDialog('Network down'));
  });

  it('keeps the success dialog on a full success', async () => {
    const result = await backUp({
      success: true,
      results: [{ service: 'github', success: true }],
    });

    const { isOpen, options } = useConfirmStore.getState();
    expect(isOpen).toBe(true);
    expect(options.isLoading).toBe(false);
    expect(options.variant).toBe('primary');
    expect(result.current.syncStatus).toBe('success');
  });
});
