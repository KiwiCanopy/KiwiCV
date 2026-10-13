// @vitest-environment jsdom
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { AI_JOB_STAGE_COVER_LETTER } from '@/constants/ai';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The two-call run's outcome, as the client reads it off the job row.
 *
 * ⚠️ The first case here is a defect that shipped: the worker writes
 * `coverLetterRetryable` beside `coverLetterError`, the client split off only
 * the error, and the flag rode into `applyAISuggestion` — which logs
 * `[ai] whole-CV run returned coverLetterRetryable, which this path cannot
 * write` on every letter failure. A notice is not a section.
 */

let pollRow: { status: string; result?: unknown; error?: string } = { status: 'processing' };

const insert = vi.fn(async () => ({ error: null }));
const single = vi.fn(async () => ({ data: pollRow, error: null }));
const deleteEq = vi.fn(async () => ({ error: null }));
const updateEq = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert,
      select: () => ({ eq: () => ({ single }) }),
      delete: () => ({ eq: deleteEq }),
      update: () => ({ eq: updateEq }),
    }),
  },
}));

const applyAISuggestion = vi.fn();
const refreshProfile = vi.fn(async () => {});
const syncUsageStatus = vi.fn();

const LETTER_BLOCK = {
  jobDescription: 'Senior Frontend Engineer, Berlin.',
  targetLang: 'en',
  wordTarget: 300,
  tone: 'professional' as const,
};

const mount = () =>
  renderHook(() =>
    useAIGeneration({
      session: { access_token: 'token', user: { id: 'user-1' } } as never,
      cvLanguage: 'en',
      refreshProfile,
      syncUsageStatus,
      setMonetizationMode: vi.fn(),
      setIsUpgradeModalOpen: vi.fn(),
      t: (key: string) => key,
    }),
  );

const RUN = {
  activeTarget: 'cv' as const,
  mode: 'job_description' as const,
  jobDescription: LETTER_BLOCK.jobDescription,
  customPrompt: '',
  isReorgEligible: false,
  allowReorg: false,
  translateToAnotherLanguage: false,
  targetLang: 'en' as const,
  isWholeCV: true,
};

beforeEach(() => {
  vi.useFakeTimers();
  pollRow = { status: 'processing' };
  insert.mockClear();
  applyAISuggestion.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
  useResumeStore.setState({ applyAISuggestion });
  // Reset rather than clear: a `mockResolvedValueOnce` queued by one case would
  // otherwise answer the next one's first call.
  syncUsageStatus.mockReset();
  syncUsageStatus.mockResolvedValue({ proRequestsToday: 1, isDailyLimitReached: false });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const poll = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2100);
  });
};

/**
 * ⚠️ **A letter-only run must not ask for a reorganisation.** It skips call 1,
 * so a `true` here asks the worker to return a regrouping that the skipped call
 * was supposed to produce.
 *
 * ⚠️ Asserted on the POSTED BODY, and it has to be. The obvious place was
 * `useAIRunner`, by folding `!isLetterOnly` into `isReorgEligible` — but that
 * value is a property of the TARGET and `useAIComposer` reads it to gate the
 * composer bar's restructure checkbox on a different surface, so folding it
 * there let a dialog flag reach an unrelated control (architect-reviewer,
 * 2026-09-08). The two facts are combined in `useAIGeneration` instead, which
 * is below the layer `coverLetterWiring` mocks — this suite stubs `fetch`, so
 * it is the only one that can see the result.
 */
describe('what a letter-only run asks the worker for', () => {
  const bodyOf = (call: number) =>
    JSON.parse((vi.mocked(fetch).mock.calls[call]?.[1] as RequestInit).body as string);

  it('never asks for a reorganisation, even with the tick left on', async () => {
    const { result } = mount();

    await act(async () => {
      await result.current.handleGenerate({
        ...RUN,
        isReorgEligible: true,
        allowReorg: true,
        coverLetter: LETTER_BLOCK,
        coverLetterOnly: true,
      });
    });

    expect(bodyOf(0).allowReorg).toBe(false);
    expect(bodyOf(0).coverLetterOnly).toBe(true);
  });

  /** The other side: an ordinary run with the same two inputs still asks. */
  it('leaves an ordinary run asking for one', async () => {
    const { result } = mount();

    await act(async () => {
      await result.current.handleGenerate({
        ...RUN,
        isReorgEligible: true,
        allowReorg: true,
        coverLetter: LETTER_BLOCK,
      });
    });

    expect(bodyOf(0).allowReorg).toBe(true);
    expect(bodyOf(0).coverLetterOnly).toBeUndefined();
  });
});

describe('the letter half of a two-call run', () => {
  it('never hands the retryable flag to the apply path', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: LETTER_BLOCK });
    });

    pollRow = {
      status: 'completed',
      result: {
        coverLetterError: 'LETTER_CALL_FAILED',
        coverLetterRetryable: true,
        isNoOp: false,
        isReorg: false,
        work: [],
      },
    };
    await poll();

    expect(applyAISuggestion).toHaveBeenCalled();
    const applied = applyAISuggestion.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(applied).not.toHaveProperty('coverLetterRetryable');
    expect(applied).not.toHaveProperty('coverLetterError');
    expect(result.current.coverLetterOutcome).toEqual({
      status: 'failed',
      error: 'LETTER_CALL_FAILED',
      retryable: true,
    });
  });

  it('reports a non-retryable failure as one', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: LETTER_BLOCK });
    });

    pollRow = {
      status: 'completed',
      result: {
        coverLetterError: 'LETTER_ALLOWANCE_SPENT',
        coverLetterRetryable: false,
        isNoOp: false,
        isReorg: false,
        work: [],
      },
    };
    await poll();

    expect(result.current.coverLetterOutcome?.retryable).toBe(false);
  });

  it('reports a letter that arrived as a success', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: LETTER_BLOCK });
    });

    pollRow = {
      status: 'completed',
      result: {
        coverLetter: { improvedFields: { subject: 'Application', paragraphs: ['Dear…'] } },
        isNoOp: false,
        isReorg: false,
      },
    };
    await poll();

    expect(result.current.coverLetterOutcome).toEqual({ status: 'success', retryable: false });
  });

  /** A run that asked for no letter has no outcome — not a failed one. */
  it('leaves the outcome empty when no letter was asked for', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: null });
    });

    pollRow = { status: 'completed', result: { isNoOp: false, isReorg: false, work: [] } };
    await poll();

    expect(result.current.status).toBe('success');
    expect(result.current.coverLetterOutcome).toBeNull();
  });
});

describe('the stage the user is waiting on', () => {
  it('opens on the CV and advances only when the worker says so', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: LETTER_BLOCK });
    });

    expect(result.current.runStage).toEqual({ stage: 'cv', twoStep: true });

    // A poll before the marker leaves the heading exactly where it was.
    await poll();
    expect(result.current.runStage).toEqual({ stage: 'cv', twoStep: true });

    pollRow = { status: 'processing', result: { stage: AI_JOB_STAGE_COVER_LETTER } };
    await poll();
    expect(result.current.runStage).toEqual({ stage: 'cover_letter', twoStep: true });
  });

  /**
   * ⚠️ Identity, not equality. A new object every 2 s re-renders the status view
   * and re-announces a heading that has not changed.
   */
  it('keeps the same stage object across repeated markers', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: LETTER_BLOCK });
    });

    pollRow = { status: 'processing', result: { stage: AI_JOB_STAGE_COVER_LETTER } };
    await poll();
    const first = result.current.runStage;
    await poll();
    expect(result.current.runStage).toBe(first);
  });

  it('is a single letter step on a letter-only re-run', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({
        ...RUN,
        coverLetter: LETTER_BLOCK,
        coverLetterOnly: true,
      });
    });

    expect(result.current.runStage).toEqual({ stage: 'cover_letter', twoStep: false });
  });

  it('has no stage at all for an ordinary single-call run', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: null });
    });

    expect(result.current.runStage).toBeNull();
  });
});

/**
 * A letter-only run with no block is `MISSING_PARAMS` server-side — a failed job
 * in place of a run that had already succeeded.
 */
describe('the letter-only guard', () => {
  it('sends nothing when there is no block to re-run', async () => {
    const { result } = mount();
    await act(async () => {
      await result.current.handleGenerate({ ...RUN, coverLetter: null, coverLetterOnly: true });
    });

    expect(insert).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

/**
 * ⚠️ The letter retry is offered from the SUCCESS panel, which `AIEditModal`
 * renders only while `status !== 'idle'`. A retry refused by the day's allowance
 * must therefore leave `status` alone: resetting it unmounts the panel behind
 * the paywall, so dismissing the paywall drops the user on the config form with
 * the outcome of the CV they just paid for — and the retry — gone.
 */
describe('a retry the allowance refuses', () => {
  it('keeps the panel that offered it', async () => {
    const setIsUpgradeModalOpen = vi.fn();
    const { result } = renderHook(() =>
      useAIGeneration({
        session: { access_token: 'token', user: { id: 'user-1' } } as never,
        cvLanguage: 'en',
        refreshProfile,
        syncUsageStatus,
        setMonetizationMode: vi.fn(),
        setIsUpgradeModalOpen,
        t: (key: string) => key,
      }),
    );

    await act(async () => {
      void result.current.handleGenerate({ ...RUN, coverLetter: LETTER_BLOCK });
    });
    pollRow = {
      status: 'completed',
      result: { coverLetterError: 'LETTER_CALL_FAILED', coverLetterRetryable: true, work: [] },
    };
    await poll();
    expect(result.current.status).toBe('success');

    syncUsageStatus.mockResolvedValueOnce({ proRequestsToday: 200, isDailyLimitReached: true });
    await act(async () => {
      await result.current.handleGenerate({
        ...RUN,
        coverLetter: LETTER_BLOCK,
        coverLetterOnly: true,
      });
    });

    expect(setIsUpgradeModalOpen).toHaveBeenCalledWith(true);
    expect(result.current.status).toBe('success');
  });

  /** The error branch's own retry is the case the reset was written for. */
  it('still returns a full run to the config form', async () => {
    const { result } = mount();
    syncUsageStatus.mockResolvedValueOnce({ proRequestsToday: 200, isDailyLimitReached: true });

    await act(async () => {
      await result.current.handleGenerate({ ...RUN, coverLetter: LETTER_BLOCK });
    });

    expect(result.current.status).toBe('idle');
  });
});
