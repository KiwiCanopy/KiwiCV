// @vitest-environment jsdom
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { sha256Hex } from '@/utils/hash';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A tailoring run that leaves an existing letter in place flags it `outdated`,
 * so the export dialog can warn before an old letter goes out with a new CV.
 */

let pollRow: { status: string; result?: unknown; error?: string } = { status: 'processing' };

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: async () => ({ error: null }),
      select: () => ({ eq: () => ({ single: async () => ({ data: pollRow, error: null }) }) }),
      delete: () => ({ eq: async () => ({ error: null }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
}));

const JOB_A = 'Senior Frontend Engineer, Berlin.';
const JOB_B = 'Product Designer, Hamburg.';

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
  jobDescription: JOB_B,
  customPrompt: '',
  isReorgEligible: false,
  allowReorg: false,
  translateToAnotherLanguage: false,
  targetLang: 'en' as const,
  isWholeCV: true,
};

const LETTER_BLOCK = {
  jobDescription: JOB_B,
  targetLang: 'en',
  wordTarget: 300,
  tone: 'professional' as const,
};

const seedLetter = (patch: Partial<ReturnType<typeof createDefaultCoverLetter>>) =>
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, coverLetter: { ...createDefaultCoverLetter(), ...patch } },
  }));

const letter = () => useResumeStore.getState().resume.coverLetter;

const complete = async (
  run: Parameters<ReturnType<typeof mount>['result']['current']['handleGenerate']>[0],
  result: Record<string, unknown>,
) => {
  const hook = mount();
  await act(async () => {
    void hook.result.current.handleGenerate(run);
  });
  pollRow = { status: 'completed', result: { isNoOp: false, isReorg: false, ...result } };
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2100);
  });
  // `processResult` hashes the ad before it writes; let that promise settle.
  await act(async () => {
    await vi.runAllTimersAsync();
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  pollRow = { status: 'processing' };
  useResumeStore.setState({ applyAISuggestion: vi.fn() });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('a tailoring run without a letter', () => {
  it('flags a letter drafted for another job', async () => {
    seedLetter({ paragraphs: ['Dear team,'], draftedFor: await sha256Hex(JOB_A) });
    await complete(RUN, { work: [] });
    expect(letter().outdated).toBe(true);
  });

  it('flags a hand-written letter, which names no job', async () => {
    seedLetter({ paragraphs: ['Dear team,'] });
    await complete(RUN, { work: [] });
    expect(letter().outdated).toBe(true);
  });

  it('leaves a letter drafted for the same ad alone', async () => {
    seedLetter({ paragraphs: ['Dear team,'], draftedFor: await sha256Hex(JOB_B) });
    await complete(RUN, { work: [] });
    expect(letter().outdated).toBeUndefined();
  });

  it('leaves an empty letter alone', async () => {
    seedLetter({});
    await complete(RUN, { work: [] });
    expect(letter().outdated).toBeUndefined();
  });

  it('leaves the letter alone on a run that is not tailoring', async () => {
    seedLetter({ paragraphs: ['Dear team,'] });
    await complete({ ...RUN, mode: 'professional', jobDescription: '' }, { work: [] });
    expect(letter().outdated).toBeUndefined();
  });
});

describe('a run that drafts a letter', () => {
  it('stamps the ad it was drafted for and clears the flag', async () => {
    seedLetter({ paragraphs: ['Old letter'], outdated: true });
    await complete(
      { ...RUN, coverLetter: LETTER_BLOCK },
      { work: [], coverLetter: { subject: 'Hi', paragraphs: ['New letter'] } },
    );
    expect(letter().draftedFor).toBe(await sha256Hex(JOB_B));
    expect(letter().outdated).toBe(false);
    expect(letter().enabled).toBe(true);
  });
});
