// @vitest-environment jsdom
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { AI_TRANSLATION_MAX_CHARS } from '@/constants/ai';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The composer's `autoRun` reaches `handleGenerate` without the config view's
 * refused button, so the run itself refuses an over-cap whole-CV translation
 * — before a job row is written or a request spent.
 */

const insert = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert,
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
}));

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
  activeTarget: 'cv' as const,
  mode: 'professional' as const,
  jobDescription: '',
  customPrompt: '',
  isReorgEligible: false,
  allowReorg: false,
  translateToAnotherLanguage: true,
  targetLang: 'de' as const,
  isWholeCV: true,
};

beforeEach(() => {
  insert.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
  const resume = useResumeStore.getState().resume;
  useResumeStore.setState({
    resume: {
      ...resume,
      work: [{ ...resume.work[0], _vId: 'w1', summary: 'x'.repeat(AI_TRANSLATION_MAX_CHARS) }],
    } as ResumeData,
  });
});

describe('an over-cap whole-CV translation, started without the config view', () => {
  it('is refused with the reason and writes no job row', async () => {
    const { result } = mount();
    await act(async () => {
      await result.current.handleGenerate(RUN);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('ai.translate_too_long');
    expect(insert).not.toHaveBeenCalled();
  });

  it('runs when it does not translate', async () => {
    const { result } = mount();
    await act(async () => {
      void result.current.handleGenerate({ ...RUN, translateToAnotherLanguage: false });
    });

    expect(result.current.errorMessage).not.toBe('ai.translate_too_long');
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
  });
});
