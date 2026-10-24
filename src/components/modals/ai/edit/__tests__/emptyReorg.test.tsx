// @vitest-environment jsdom
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * An empty reorganisation is no proposal, and the server is what says
 * so: `isReorg` is `isReorgResult` over the response's shape, so `skills: []`
 * arrives as `isReorg: false` and the client routes on that flag alone.
 * The server half is pinned in `tests/netlify-functions/no-op-grading.test.mjs`.
 */

let pollRow: { status: string; result?: unknown } = { status: 'processing' };

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: vi.fn(async () => ({ error: null })),
      select: () => ({
        eq: () => ({ single: vi.fn(async () => ({ data: pollRow, error: null })) }),
      }),
      delete: () => ({ eq: vi.fn(async () => ({ error: null })) }),
      update: () => ({ eq: vi.fn(async () => ({ error: null })) }),
    }),
  },
}));

const applyAISuggestion = vi.fn();
const applyReorgSuggestion = vi.fn();
const acceptReorg = vi.fn();

const mount = () =>
  renderHook(() =>
    useAIGeneration({
      session: { access_token: 'token', user: { id: 'user-1' } } as never,
      cvLanguage: 'en',
      refreshProfile: vi.fn(async () => {}),
      syncUsageStatus: vi.fn(async () => ({ proRequestsToday: 1, isDailyLimitReached: false })),
      setMonetizationMode: vi.fn(),
      setIsUpgradeModalOpen: vi.fn(),
      t: (key: string) => key,
    }),
  );

const RUN = {
  activeTarget: 'cv' as const,
  mode: 'job_description' as const,
  jobDescription: 'Senior Frontend Engineer, Berlin.',
  customPrompt: '',
  isReorgEligible: true,
  allowReorg: true,
  translateToAnotherLanguage: false,
  targetLang: 'en' as const,
  isWholeCV: true,
  coverLetter: null,
};

const runTo = async (result: unknown, run: Partial<typeof RUN> = {}) => {
  const { result: hook } = mount();
  await act(async () => {
    void hook.current.handleGenerate({ ...RUN, ...run } as typeof RUN);
  });
  pollRow = { status: 'completed', result };
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2100);
  });
  return hook;
};

const WORK = [{ _vId: 'w1', improvedFields: { position: 'Staff Engineer' } }];

beforeEach(() => {
  vi.useFakeTimers();
  pollRow = { status: 'processing' };
  applyAISuggestion.mockClear();
  applyReorgSuggestion.mockClear();
  acceptReorg.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
  useResumeStore.setState({ applyAISuggestion, applyReorgSuggestion, acceptReorg });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('a whole-CV reorg run whose skills came back empty', () => {
  it('arrives as no reorg, so skills go through the item merge and are left alone', async () => {
    const hook = await runTo({ isNoOp: false, isReorg: false, skills: [], work: WORK });

    expect(applyReorgSuggestion).not.toHaveBeenCalled();
    expect(applyAISuggestion).toHaveBeenCalledTimes(1);
    // An empty list matches no entry in `applyCvSuggestion`, so it writes nothing.
    expect(applyAISuggestion.mock.calls[0]?.[1]).toEqual({ skills: [], work: WORK });
    expect(hook.current.status).toBe('success');
  });

  /** The other side: a real proposal still reaches the reorg path. */
  it('still applies a non-empty reorganisation', async () => {
    const skills = [{ name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] }];
    await runTo({ isNoOp: false, isReorg: true, skills, work: WORK });

    expect(applyReorgSuggestion).toHaveBeenCalledWith('skills', skills);
    expect(applyAISuggestion.mock.calls[0]?.[1]).toEqual({ work: WORK });
    expect(acceptReorg).not.toHaveBeenCalled();
  });

  // A translation has nothing to discard; a skills proposal left open would
  // revert alone into the old language on Discard all (#26).
  it('accepts the restructure of a translation at once', async () => {
    const skills = [{ name: 'Frontend-Entwicklung', keywords: ['React'], _sourceVIds: ['s1'] }];
    await runTo(
      { isNoOp: false, isReorg: true, skills, work: WORK },
      { translateToAnotherLanguage: true, targetLang: 'de' as never },
    );

    expect(applyReorgSuggestion).toHaveBeenCalledWith('skills', skills);
    expect(acceptReorg).toHaveBeenCalledTimes(1);
  });

  /** Skills the server did not flag never reach the reorg path, whatever they hold. */
  it('routes on the flag, not on the payload', async () => {
    const skills = [{ _vId: 's1', improvedFields: { name: 'Frontend Engineering' } }];
    await runTo({ isNoOp: false, isReorg: false, skills, work: WORK });

    expect(applyReorgSuggestion).not.toHaveBeenCalled();
    expect(applyAISuggestion.mock.calls[0]?.[1]).toEqual({ skills, work: WORK });
  });
});
