// @vitest-environment jsdom
import { useAIImportJob } from '@/components/modals/ai/import/useAIImportJob';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * What the import dialog shows when a run ends each way, within its 180 s window.
 *
 * The row's fate on every exit — deleted, never marked, once, before the result is
 * processed, so neither a late parse nor the uploaded file rests in it — is the
 * lifecycle's, pinned in `src/hooks/__tests__/useAIJobRun.test.ts`.
 */

const TIMEOUT_MS = 180_000;

let pollRow: { status: string; result?: unknown; error?: string } = { status: 'processing' };

const insert = vi.fn(async (_row: { id: string; status: string }) => ({ error: null }));
const single = vi.fn(async () => ({ data: pollRow, error: null }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert,
      select: () => ({ eq: () => ({ single }) }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    session: { access_token: 'token', user: { id: 'user-1' } },
    refreshProfile: async () => {},
    isPremium: false,
  }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key, language: 'en' }),
}));

const setStatus = vi.fn();
const setIsUpgradeModalOpen = vi.fn();
const setRefusedMode = vi.fn();

const mount = () =>
  renderHook(() =>
    useAIImportJob({
      extractedDocxImage: null,
      isTranslationEnabled: false,
      needsUpgrade: false,
      sourceLanguage: 'en',
      sourceLanguageOther: '',
      targetLanguage: 'en',
      setErrorMessage: vi.fn(),
      setIsUpgradeModalOpen,
      setRefusedMode,
      setStatus,
      syncUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
    }),
  );

/** Starts an import, failing the test if no job row was inserted. */
const start = async (result: ReturnType<typeof mount>['result']) => {
  await act(async () => {
    await result.current.handleParse('literal');
  });
  if (!insert.mock.calls[0]) throw new Error('the hook never inserted a job row');
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

/** The status the hook last reported. */
const lastStatus = () => setStatus.mock.calls.at(-1)?.[0];

beforeEach(() => {
  vi.useFakeTimers();
  pollRow = { status: 'processing' };
  insert.mockClear();
  setStatus.mockClear();
  setIsUpgradeModalOpen.mockClear();
  setRefusedMode.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
  useFlowStore.setState((state) => ({
    import: {
      ...state.import,
      fileContent: { text: 'Jane Doe, jane@example.com' },
      fileType: 'text/plain',
    },
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('what the import shows when a run ends', () => {
  it('an error on the client timeout', async () => {
    const { result } = mount();
    await start(result);

    await advance(TIMEOUT_MS + 2_100);

    expect(lastStatus()).toBe('error');
  });

  it('an error when the worker marks the run failed', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = mount();
    await start(result);

    pollRow = { status: 'failed', error: 'INVALID_AI_RESPONSE_FORMAT' };
    await advance(2_100);

    expect(lastStatus()).toBe('error');
    consoleError.mockRestore();
  });

  it('the upgrade modal when the worker refuses the run at the paywall', async () => {
    const { result } = mount();
    await start(result);

    pollRow = { status: 'failed', error: 'PREMIUM_REQUIRED' };
    await advance(2_100);

    expect(setIsUpgradeModalOpen).toHaveBeenCalledWith(true);
    expect(setRefusedMode).toHaveBeenCalledWith('generic');
  });
  it('a LIMIT_REACHED refusal opens the paywall in limit mode, whatever the usage count says', async () => {
    const { result } = mount();
    await start(result);

    pollRow = { status: 'failed', error: 'LIMIT_REACHED' };
    await advance(2_100);

    expect(setIsUpgradeModalOpen).toHaveBeenCalledWith(true);
    expect(setRefusedMode).toHaveBeenCalledWith('limit');
  });

  it('an error when the worker could not be started', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    const { result } = mount();
    await start(result);

    expect(lastStatus()).toBe('error');
    consoleError.mockRestore();
  });

  it('an error when a completed result cannot be processed', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = mount();
    await start(result);

    pollRow = { status: 'completed', result: null };
    await advance(2_100);

    expect(lastStatus()).toBe('error');
    consoleError.mockRestore();
  });

  it('success after reading a completed result', async () => {
    const { result } = mount();
    await start(result);

    pollRow = { status: 'completed', result: { basics: { name: 'Jane Doe' } } };
    await advance(2_100);

    expect(lastStatus()).toBe('success');
  });
});
