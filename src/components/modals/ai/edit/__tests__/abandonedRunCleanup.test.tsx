// @vitest-environment jsdom
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { AI_POLL_FLOOR_MS } from '@/constants/ai';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * What the improve dialog shows when a run ends each way, and how long the
 * client waits before giving up — the flat 60 s window abandoned runs the
 * worker finished (the figures are in `aiPollWindow.test.ts`).
 *
 * The row's fate on every exit — deleted, never marked, once, before the result
 * is applied — is the lifecycle's, pinned in `src/hooks/__tests__/useAIJobRun.test.ts`.
 */

let pollRow: { status: string; result?: unknown; error?: string } = { status: 'processing' };

const insert = vi.fn(async (_row: { id: string; user_id?: string; status: string }) => ({
  error: null,
}));
const single = vi.fn(async () => ({ data: pollRow, error: null }));
const deleteEq = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert,
      select: () => ({ eq: () => ({ single }) }),
      delete: () => ({ eq: deleteEq }),
    }),
  },
}));

const applyAISuggestion = vi.fn();
const syncUsageStatus = vi.fn();

const mount = () =>
  renderHook(() =>
    useAIGeneration({
      session: { access_token: 'token', user: { id: 'user-1' } } as never,
      cvLanguage: 'en',
      refreshProfile: vi.fn(async () => {}),
      syncUsageStatus,
      setMonetizationMode: vi.fn(),
      setIsUpgradeModalOpen: vi.fn(),
      t: (key: string) => key,
    }),
  );

const RUN = {
  activeTarget: 'cv' as const,
  mode: 'professional' as const,
  jobDescription: '',
  customPrompt: '',
  isReorgEligible: false,
  allowReorg: false,
  translateToAnotherLanguage: false,
  targetLang: 'en' as const,
  isWholeCV: true,
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  pollRow = { status: 'processing' };
  insert.mockClear();
  deleteEq.mockClear();
  applyAISuggestion.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
  useResumeStore.setState({ applyAISuggestion });
  syncUsageStatus.mockReset();
  syncUsageStatus.mockResolvedValue({ proRequestsToday: 1, isDailyLimitReached: false });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('what the dialog shows when a run ends', () => {
  it('an error on the client timeout', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate(RUN);
    });

    await advance(AI_POLL_FLOOR_MS + 10_000 + 2_100);

    expect(result.current.status).toBe('error');
  });

  it('an error when applying a completed result throws', async () => {
    applyAISuggestion.mockImplementationOnce(() => {
      throw new Error('apply exploded');
    });
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate(RUN);
    });

    pollRow = { status: 'completed', result: { isNoOp: false, isReorg: false, work: [] } };
    await advance(2_100);

    expect(result.current.status).toBe('error');
  });

  it('nothing, back to idle, when the worker refuses the run at the paywall', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 402 })),
    );
    const { result } = mount();
    await act(async () => {
      await result.current.handleGenerate(RUN);
    });

    expect(result.current.status).toBe('idle');
  });

  // A target with nothing to send fails before any job exists, so
  // there is no row to clean up and no request spent.
  it('an error, instead of a hanging spinner, when the target no longer exists', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({
        ...RUN,
        activeTarget: 'item:work:gone',
        isWholeCV: false,
      });
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });

  it('an error when the worker marks the run failed', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate(RUN);
    });

    pollRow = { status: 'failed', error: 'INVALID_AI_RESPONSE_FORMAT' };
    await advance(2_100);

    expect(result.current.status).toBe('error');
  });

  it('an error when the worker could not be started', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    const { result } = mount();
    await act(async () => {
      await result.current.handleGenerate(RUN);
    });

    expect(result.current.status).toBe('error');
  });

  it('success after reading a completed result', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate(RUN);
    });

    pollRow = { status: 'completed', result: { isNoOp: false, isReorg: false, work: [] } };
    await advance(2_100);

    expect(result.current.status).toBe('success');
  });
});

describe('how long the client waits', () => {
  /** A payload of roughly `chars` characters, as the run would send it. */
  const setPayloadOf = (chars: number) =>
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        basics: { ...state.resume.basics, summary: 'x'.repeat(chars) },
      },
    }));

  it('gives a large payload more than the minute a small one gets', async () => {
    setPayloadOf(120_000);
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate(RUN);
    });

    // Past the old fixed window: still polling.
    await advance(AI_POLL_FLOOR_MS + 30_000);
    expect(result.current.status).toBe('processing');
    expect(deleteEq).not.toHaveBeenCalled();

    // A result that lands in that window is still collected.
    pollRow = { status: 'completed', result: { isNoOp: false, isReorg: false, work: [] } };
    await advance(2_100);
    expect(result.current.status).toBe('success');
  });

  it('does give up, once the derived window has passed', async () => {
    setPayloadOf(120_000);
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate(RUN);
    });

    await advance(AI_POLL_FLOOR_MS + 120_000 + 10_000);
    expect(result.current.status).toBe('error');
    expect(deleteEq).toHaveBeenCalledTimes(1);
  });
});
