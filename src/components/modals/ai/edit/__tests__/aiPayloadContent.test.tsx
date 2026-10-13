// @vitest-environment jsdom
import { useAIGeneration } from '@/components/modals/ai/edit/useAIGeneration';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The AI gets what the CV can show — hidden entries included, since the user can
 * show them again — and never what it cannot: pass-through blocks, a project's
 * roles and keywords (owner, 2026-10-05). Asserted on the request body the
 * real `useAIGeneration` sends.
 */

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: async () => ({ error: null }),
      select: () => ({ eq: () => ({ single: async () => ({ data: { status: 'processing' } }) }) }),
      delete: () => ({ eq: async () => ({ error: null }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
}));

const NEVER_SHOWN = 'never-shown-sentinel';
const HIDDEN = 'hidden-entry-sentinel';
const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }));

const resumeWithUnshowableData = (): ResumeData => {
  const resume = buildSingleItemResume('lunar');
  resume.passthrough = { kiwitalents: { salary: NEVER_SHOWN } };
  resume.projects[0].roles = [NEVER_SHOWN];
  resume.projects[0].keywords = [NEVER_SHOWN];
  const hiddenWork = { ...resume.work[0], _vId: 'hidden-work', summary: HIDDEN };
  resume.work = [...resume.work, hiddenWork];
  resume.meta.content.hiddenIds = [getSectionItemHash('work', hiddenWork)];
  return resume;
};

const sentBody = async (activeTarget: string, overrides: Record<string, unknown> = {}) => {
  const { result } = renderHook(() =>
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
  await act(async () => {
    void result.current.handleGenerate({
      activeTarget,
      mode: 'professional',
      jobDescription: '',
      customPrompt: '',
      isReorgEligible: false,
      allowReorg: false,
      translateToAnotherLanguage: false,
      targetLang: 'en',
      isWholeCV: activeTarget === 'cv',
      ...overrides,
    } as never);
  });
  const call = (fetchMock.mock.calls as unknown as Array<[string, { body: string }]>).find(
    ([url]) => url.includes('improve-cv-background'),
  );
  return call
    ? (JSON.parse(call[1].body) as { resumeData: unknown; allowReorg?: boolean })
    : undefined;
};

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  useResumeStore.setState({ resume: resumeWithUnshowableData() });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('what an AI run sends', () => {
  it('a whole-CV run: nothing the CV can never show', async () => {
    expect(JSON.stringify(useResumeStore.getState().resume)).toContain(NEVER_SHOWN);
    const body = await sentBody('cv');
    expect(body).toBeDefined();
    expect(JSON.stringify(body)).not.toContain(NEVER_SHOWN);
  });

  it('a whole-CV run: hidden entries travel, because the CV can show them again', async () => {
    const body = await sentBody('cv');
    expect(JSON.stringify(body)).toContain(HIDDEN);
  });

  it('a whole-CV run: only keys KiwiCV models, so no flattened pass-through either', async () => {
    const body = await sentBody('cv');
    const modelled = Object.keys(initialResumeState);
    expect(Object.keys(body?.resumeData as object).filter((k) => !modelled.includes(k))).toEqual(
      [],
    );
  });

  it('a run on an entry that no longer exists sends nothing at all', async () => {
    expect(await sentBody('item:work:gone')).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
