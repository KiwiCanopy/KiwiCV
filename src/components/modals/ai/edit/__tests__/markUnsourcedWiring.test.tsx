// @vitest-environment jsdom
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The run decides whether its skill proposals are checked against the CV:
 * tailoring (`job_description`) is, every other mode is not. The store's
 * marking is pinned in `unsourcedKeywords.test.tsx`; this pins the call site.
 */

let pollRow: { status: string; result?: unknown } = { status: 'processing' };

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: async () => ({ error: null }),
      select: () => ({ eq: () => ({ single: async () => ({ data: pollRow, error: null }) }) }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
}));

const applyAISuggestion = vi.fn();

const mount = () =>
  renderHook(() =>
    useAIGeneration({
      session: { access_token: 'token', user: { id: 'user-1' } } as never,
      cvLanguage: 'en',
      refreshProfile: vi.fn(async () => {}),
      syncUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
      setMonetizationMode: vi.fn(),
      setIsUpgradeModalOpen: vi.fn(),
      t: (key: string) => key,
    }),
  );

const RUN = {
  activeTarget: 'section:skills' as const,
  jobDescription: 'Platform engineer, Kubernetes.',
  customPrompt: '',
  isReorgEligible: false,
  allowReorg: false,
  translateToAnotherLanguage: false,
  targetLang: 'en' as const,
  isWholeCV: false,
};

beforeEach(() => {
  vi.useFakeTimers();
  pollRow = { status: 'processing' };
  applyAISuggestion.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
  useResumeStore.setState({ applyAISuggestion });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const runIn = async (mode: 'job_description' | 'professional') => {
  const { result } = mount();
  await act(async () => {
    void result.current.handleGenerate({ ...RUN, mode });
  });
  pollRow = { status: 'completed', result: { isNoOp: false, isReorg: false, items: [] } };
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2_100);
  });
  expect(applyAISuggestion).toHaveBeenCalledTimes(1);
  return applyAISuggestion.mock.calls[0][2];
};

describe('which runs mark unsourced skill keywords', () => {
  it('a tailoring run does', async () => {
    expect(await runIn('job_description')).toMatchObject({ markUnsourced: true });
  });

  it('a professional run does not', async () => {
    expect(await runIn('professional')).toMatchObject({ markUnsourced: false });
  });
});
