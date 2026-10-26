// @vitest-environment jsdom
import { useAIRunner } from '@/components/modals/ai/edit/useAIRunner';
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { COVER_LETTER_DEFAULT_LENGTH, COVER_LETTER_DEFAULT_TONE } from '@/constants/ai';
import { bindCoverLetterStyleToUser } from '@/services/storage/coverLetterStyleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A saved writing sample makes "Match my writing style" the default tone (#56).
 *
 * ⚠️ The signed-in case is the one that matters: a sample stamped for an
 * account reads '' until auth binds the owner, so a default seeded when the
 * store is created would never see it.
 */

const handleGenerate = vi.fn();

vi.mock('@/components/modals/ai/edit/useAIGeneration', () => ({
  useAIGeneration: () => ({
    isLoading: false,
    status: 'idle',
    setStatus: vi.fn(),
    errorMessage: '',
    changeDetails: undefined,
    coverLetterOutcome: null,
    runStage: null,
    handleGenerate,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: {},
    session: { access_token: 'token' },
    isPremium: true,
    refreshProfile: async () => {},
  }),
}));

vi.mock('@/utils/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/ai')>()),
  fetchAIUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
}));

const storeSample = (sample: string, owner?: string) =>
  localStorage.setItem(
    BRAND_STORAGE_KEYS.coverLetterStyle,
    JSON.stringify({ v: 1, sample, ...(owner ? { owner } : {}) }),
  );

const mount = () => renderHook(() => useAIRunner({ enabled: false, target: 'cv' }));

// What both tone selects receive; the request has its own test below.
const matchStyle = (hook: ReturnType<typeof mount>) => hook.result.current.coverLetter.matchStyle;

beforeEach(() => {
  handleGenerate.mockClear();
  localStorage.clear();
  useFlowStore.setState((state) => ({
    prompt: {
      ...state.prompt,
      coverLetterLength: COVER_LETTER_DEFAULT_LENGTH,
      coverLetterTone: COVER_LETTER_DEFAULT_TONE,
      coverLetterMatchStyle: null,
    },
  }));
  useResumeStore.getState().openAIModal('cv');
});

afterEach(() => {
  act(() => bindCoverLetterStyleToUser(null));
  localStorage.clear();
});

describe('the writing-style default', () => {
  it('applies to a signed-in sample once the owner resolves', () => {
    storeSample('I write in short, direct sentences.', 'user-1');
    const hook = mount();
    expect(matchStyle(hook)).toBe(false);

    act(() => bindCoverLetterStyleToUser({ userId: 'user-1' }));

    expect(matchStyle(hook)).toBe(true);
  });

  it('applies on mount to a signed-out sample', () => {
    storeSample('Warm and plain.');
    expect(matchStyle(mount())).toBe(true);
  });

  it('never overrides a tone picked in this tab', () => {
    storeSample('I write in short, direct sentences.', 'user-1');
    const hook = mount();

    act(() => {
      hook.result.current.coverLetter.setMatchStyle(false);
      hook.result.current.coverLetter.setTone('warm');
    });
    act(() => bindCoverLetterStyleToUser({ userId: 'user-1' }));

    expect(matchStyle(hook)).toBe(false);
    expect(useFlowStore.getState().prompt.coverLetterTone).toBe('warm');
  });

  it('falls back to the tone when the sample is cleared', () => {
    storeSample('Warm and plain.');
    const hook = mount();
    expect(matchStyle(hook)).toBe(true);

    act(() => hook.result.current.coverLetter.clearStyleSample());

    expect(matchStyle(hook)).toBe(false);
  });

  it('keeps an explicit match-style pick when its sample is cleared', () => {
    storeSample('Warm and plain.');
    const hook = mount();

    act(() => hook.result.current.coverLetter.setMatchStyle(true));
    act(() => hook.result.current.coverLetter.clearStyleSample());

    expect(matchStyle(hook)).toBe(true);
    expect(hook.result.current.coverLetter.needsSample).toBe(true);
  });

  it('sends the sample, not the tone, on the default', async () => {
    storeSample('Warm and plain.');
    useFlowStore.setState((state) => ({
      prompt: {
        ...state.prompt,
        mode: 'job_description',
        jobDescription: 'Senior Frontend Engineer, Berlin.',
        draftCoverLetter: true,
      },
    }));

    await mount().result.current.handleGenerate();

    const letter = handleGenerate.mock.calls[0]?.[0]?.coverLetter;
    expect(letter).toMatchObject({ styleSample: 'Warm and plain.' });
    expect(letter).not.toHaveProperty('tone');
  });
});
