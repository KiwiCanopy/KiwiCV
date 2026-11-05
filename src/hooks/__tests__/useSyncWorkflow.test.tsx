// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useSyncWorkflow } from '@/hooks/useSyncWorkflow';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useToastStore } from '@/store/ui/useToastStore';
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

const toasts = () => useToastStore.getState().toasts.map(({ message, type }) => [message, type]);

describe('Back up failing at a provider (#93)', () => {
  beforeEach(() => {
    useConfirmStore.getState().close();
    useToastStore.setState({ toasts: [] });
    useFlowStore.getState().resetAuth();
  });

  it('closes the loading dialog and announces a full failure', async () => {
    const result = await backUp({
      success: false,
      results: [{ service: 'github', success: false, error: 'Bad credentials' }],
    });

    expect(useConfirmStore.getState().isOpen).toBe(false);
    expect(result.current.syncStatus).toBe('error');
    expect(toasts()).toEqual([['Bad credentials', 'error']]);
  });

  it('names what failed in a partial success', async () => {
    const result = await backUp({
      success: false,
      results: [
        { service: 'google_drive', success: true },
        { service: 'github', success: false, error: 'Bad credentials' },
      ],
    });

    expect(useConfirmStore.getState().isOpen).toBe(false);
    expect(result.current.syncStatus).toBe('success');
    expect(toasts()).toEqual([
      [
        'sync.export_dialog.result_partial sync.export_dialog.dest_github_repo_label: Bad credentials',
        'warning',
      ],
    ]);
  });

  it('hands a missing connection to the login dialog, which says so itself', async () => {
    await backUp({
      success: false,
      results: [{ service: 'github', success: false, error: 'PAT missing' }],
    });

    expect(useConfirmStore.getState().isOpen).toBe(false);
    expect(useFlowStore.getState().auth.source).toBe('sync');
    expect(toasts()).toEqual([]);
  });

  it('reports a thrown failure the same way', async () => {
    await backUp(new Error('Network down'));

    expect(useConfirmStore.getState().isOpen).toBe(false);
    expect(toasts()).toEqual([['Network down', 'error']]);
  });

  it('keeps the success dialog on a full success', async () => {
    const result = await backUp({
      success: true,
      results: [{ service: 'github', success: true }],
    });

    const { isOpen, options } = useConfirmStore.getState();
    expect(isOpen).toBe(true);
    expect(options.isLoading).toBe(false);
    expect(result.current.syncStatus).toBe('success');
    expect(toasts()).toEqual([]);
  });
});
