// @vitest-environment jsdom
import { useAIRunner } from '@/components/modals/ai/edit/useAIRunner';
import { COVER_LETTER_DEFAULT_LENGTH, COVER_LETTER_DEFAULT_TONE } from '@/constants/ai';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ **The seam this whole lane exists to add, and nothing was binding it.**
 *
 * `coverLetterRequest.test.ts` proves the builder is right and
 * `composerCoverLetter.test.tsx` proves the chrome is right — and between them
 * sat one line in `useAIRunner` passing the result to `handleGenerate`. Delete
 * that line and every other suite stays green while the feature is exactly as
 * unreachable as it was before this branch: three merged backend PRs with no
 * caller.
 *
 * That is the same trap (`.claude/rules/ai-backend.md`: "adding a key to
 * SECTION_COMPOSITION is not adding a section") that once shipped a button that
 * spent a daily request to report "No changes" every time, through a green
 * `tsc`, 3,169 tests, lint, `i18n:check` and `ai:check-sync`.
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

const setPrompt = (patch: Partial<ReturnType<typeof useFlowStore.getState>['prompt']>) =>
  useFlowStore.setState({
    prompt: {
      mode: 'job_description',
      jobDescription: 'Senior Frontend Engineer, Berlin. React and TypeScript.',
      customPrompt: '',
      allowReorg: false,
      draftCoverLetter: false,
      coverLetterLength: COVER_LETTER_DEFAULT_LENGTH,
      coverLetterTone: COVER_LETTER_DEFAULT_TONE,
      coverLetterMatchStyle: false,
      ...patch,
    },
  });

beforeEach(() => {
  handleGenerate.mockClear();
  localStorage.clear();
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...state.resume.coverLetter, subject: '', paragraphs: [] },
    },
  }));
  useResumeStore.getState().openAIModal('cv');
});

const run = async () => {
  const { result } = renderHook(() => useAIRunner({ enabled: false, target: 'cv' }));
  await result.current.handleGenerate();
  return handleGenerate.mock.calls[0]?.[0];
};

describe('the cover-letter block reaching the request', () => {
  it('travels when the tick is on for a whole-CV job-tailoring run', async () => {
    setPrompt({ draftCoverLetter: true, coverLetterTone: 'confident' });

    expect(await run()).toMatchObject({
      coverLetter: {
        jobDescription: 'Senior Frontend Engineer, Berlin. React and TypeScript.',
        tone: 'confident',
      },
    });
  });

  it('is null when the tick is off', async () => {
    setPrompt({ draftCoverLetter: false });

    expect((await run()).coverLetter).toBeNull();
  });

  /**
   * The server reads a block with an empty ad as a letter that FAILED, not one
   * nobody asked for — so this must be `null`, never a block.
   */
  it('is null when the tick is on and no ad was pasted', async () => {
    setPrompt({ draftCoverLetter: true, jobDescription: '' });

    expect((await run()).coverLetter).toBeNull();
  });

  it('is null when the run is not tailoring to an ad', async () => {
    setPrompt({ draftCoverLetter: true, mode: 'professional' });

    expect((await run()).coverLetter).toBeNull();
  });

  /**
   * ⚠️ Once asserted `toBeNull()`. A drafted letter now lands on the
   * `item:coverLetter` proposal path with the previous one kept as
   * `originalValue`, so there is nothing to protect by refusing — and refusing
   * left a second application no route to a fresh letter.
   */
  it('asks for a letter even when one already exists', async () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: { ...state.resume.coverLetter, paragraphs: ['Dear Hiring Manager,'] },
      },
    }));
    setPrompt({ draftCoverLetter: true });

    expect((await run()).coverLetter).not.toBeNull();
  });
});

/**
 * The letter-only re-run, from the panel's "Try again". It skips call 1
 * and drafts from the CV a completed run already tailored, so it costs one
 * request and needs no new input — but only if BOTH the flag and the block
 * travel. The flag alone is `MISSING_PARAMS`; the block alone re-runs the whole
 * tailoring and bills two.
 */
describe('the letter-only re-run', () => {
  const retry = async () => {
    const { result } = renderHook(() => useAIRunner({ enabled: false, target: 'cv' }));
    await result.current.handleCoverLetterRetry();
    return handleGenerate.mock.calls[0]?.[0];
  };

  it('carries the flag and the block together', async () => {
    setPrompt({ draftCoverLetter: true, coverLetterTone: 'warm' });

    expect(await retry()).toMatchObject({
      coverLetterOnly: true,
      coverLetter: { tone: 'warm' },
    });
  });

  /** ⚠️ An ordinary run must never carry it, or every run skips the CV. */
  it('is not what an ordinary run sends', async () => {
    setPrompt({ draftCoverLetter: true });

    const { result } = renderHook(() => useAIRunner({ enabled: false, target: 'cv' }));
    await result.current.handleGenerate();
    expect(handleGenerate.mock.calls[0]?.[0].coverLetterOnly).toBeUndefined();
  });

  /**
   * ⚠️ Both are wired to click handlers, and a handler is called with a
   * `MouseEvent`. Neither may read an argument, or the event silently becomes
   * the options object.
   */
  it('ignores the event a click handler passes it', async () => {
    setPrompt({ draftCoverLetter: true });

    const { result } = renderHook(() => useAIRunner({ enabled: false, target: 'cv' }));
    await (result.current.handleCoverLetterRetry as (e: unknown) => Promise<void>)({
      type: 'click',
    });
    expect(handleGenerate.mock.calls[0]?.[0].coverLetterOnly).toBe(true);
  });

  /**
   * ⚠️ **The ordinary run started from the Cover Letter section.** Until
   * 2026-09-08 the retry was the only way `coverLetterOnly` reached a request,
   * so "write from the ad" spent call 1 rewriting a CV nobody had asked it to
   * touch. This is `handleGenerate`, not the retry — the plain primary action.
   */
  it('is what a run started letter-only sends, without any retry', async () => {
    setPrompt({ draftCoverLetter: true });
    useResumeStore.getState().openAIModal('cv', { coverLetterOnly: true });

    const { result } = renderHook(() => useAIRunner({ enabled: false, target: 'cv' }));
    await result.current.handleGenerate();

    expect(handleGenerate.mock.calls[0]?.[0].coverLetterOnly).toBe(true);
    // The letter still travels: skipping call 1 must not skip the ask.
    expect(handleGenerate.mock.calls[0]?.[0].coverLetter).not.toBeNull();
  });

  /**
   * ⚠️ The "a letter-only run never reorganises" claim lives in
   * `coverLetterOutcome.test.tsx`, not here. This suite mocks
   * `useAIGeneration`, which is the layer that combines `isReorgEligible` with
   * `coverLetterOnly` — so the only thing observable at this seam is the raw
   * pair, and asserting it here would pin the inputs while the decision moved
   * out of view. That suite stubs `fetch` and reads the posted body.
   */
});
