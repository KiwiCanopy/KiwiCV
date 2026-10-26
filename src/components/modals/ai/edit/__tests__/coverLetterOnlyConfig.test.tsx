// @vitest-environment jsdom
import { AIEditModal } from '@/components/modals/ai/edit/AIEditModal';
import { COVER_LETTER_DEFAULT_LENGTH, COVER_LETTER_DEFAULT_TONE } from '@/constants/ai';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * **The config screen of a run that writes the letter and nothing else.**
 *
 * ⚠️ Reported by the owner on 2026-09-08, from the running app: "New from job
 * description" on the Cover Letter section offered to translate the CV, to
 * regroup the skills, and to switch the cover letter itself OFF — then rewrote
 * the whole CV and billed two requests. Every one of those was accurate; the
 * run really was a whole-CV run, because `startCoverLetterDraft` opened the
 * dialog with the `'cv'` target and nothing else.
 *
 * ⚠️ **`useAIEdit` is NOT mocked here, unlike `AIEditModalStatusWiring`.** The
 * claim is that a flag on the resume store reaches the rendered config screen
 * through `useAIRunner` → `useAIEdit` → `AIConfigView`, and a hand-built context
 * would assert the last link while replacing the first two — the callee/call-site
 * trap `.claude/rules/testing.md` records. Only `useAIGeneration` is stubbed,
 * because it is the network.
 */

vi.mock('@/components/modals/ai/edit/useAIGeneration', () => ({
  useAIGeneration: () => ({
    isLoading: false,
    status: 'idle',
    setStatus: vi.fn(),
    errorMessage: '',
    changeDetails: undefined,
    coverLetterOutcome: null,
    runStage: null,
    handleGenerate: vi.fn(),
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

/** Not under test, and it reaches the router and the language context. */
vi.mock('@/components/modals/InsufficientPremiumAccessModal', () => ({
  InsufficientPremiumAccessModal: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  useFlowStore.setState({
    prompt: {
      mode: 'job_description',
      jobDescription: 'Senior Frontend Engineer, Berlin. React and TypeScript.',
      customPrompt: '',
      allowReorg: false,
      draftCoverLetter: true,
      coverLetterLength: COVER_LETTER_DEFAULT_LENGTH,
      coverLetterTone: COVER_LETTER_DEFAULT_TONE,
      coverLetterMatchStyle: false,
      coverLetterToneChosen: false,
    },
  });
});

/** The three CV-shaped offers, by the copy the owner read on screen. */
const cvControls = () => ({
  translate: screen.queryByText(en.ai.translate_toggle_label),
  reorg: screen.queryByText(
    en.ai.allow_restructuring.replace('{{SectionName}}', en.editor.sections.skills),
  ),
  letterTick: screen.queryByText(en.ai.cover_letter_addon),
  back: screen.queryByRole('button', { name: en.common.back }),
});

describe('the config screen of a letter-only run', () => {
  it('offers none of the three CV controls, nor a way back to them', () => {
    useResumeStore.getState().openAIModal('cv', { draftCoverLetter: true, coverLetterOnly: true });
    render(<AIEditModal />);

    const { translate, reorg, letterTick, back } = cvControls();
    expect(translate, 'translation is call 1’s work, and there is no call 1').toBeNull();
    expect(reorg, 'nothing is being reorganised').toBeNull();
    expect(letterTick, 'the letter is the whole run, not an add-on to switch off').toBeNull();
    // ⚠️ Back returns to the CV action cards; leaving `job_description` there
    // makes the worker throw MISSING_PARAMS on a request carrying
    // `coverLetterOnly` with no letter block.
    expect(back, 'a single-purpose dialog has nowhere to go back to').toBeNull();
  });

  it('keeps the settings the letter actually needs', () => {
    useResumeStore.getState().openAIModal('cv', { draftCoverLetter: true, coverLetterOnly: true });
    render(<AIEditModal />);

    expect(screen.getByLabelText(en.ai.cover_letter_length_label)).toBeTruthy();
    expect(screen.getByLabelText(en.ai.cover_letter_tone_label)).toBeTruthy();
  });

  /**
   * ⚠️ The price is stated once, under the tick that reveals it — and it says
   * the run spends TWO of the day's requests. A letter-only run spends one, so
   * leaving the sentence would be a plain false statement about the user's
   * allowance, not merely a stray control (owner, 2026-09-08).
   */
  it('does not claim the run costs two requests', () => {
    useResumeStore.getState().openAIModal('cv', { draftCoverLetter: true, coverLetterOnly: true });
    render(<AIEditModal />);

    expect(screen.queryByText(/two of today’s/i)).toBeNull();
  });

  /**
   * ⚠️ Borrowed from the Cover Letter section's empty state rather than minted:
   * that key already says this sentence, for this action, in all fifteen
   * locales.
   *
   * ⚠️ **This does NOT pin the borrow, and an earlier version of this comment
   * claimed it did.** The test reads the same key the component reads, so a
   * reword moves both sides together and stays green — two copies of one fact,
   * compared against each other (code-reviewer, 2026-09-08). What it pins is
   * only that the letter-only dialog does not show the generic AI label. The
   * risk it leaves open is real: a reword aimed at the empty-state panel
   * silently relabels this dialog's primary button in fifteen locales, which is
   * why the handoff-catalog entry for the key names both surfaces.
   */
  it('names the letter on the button instead of the generic AI label', async () => {
    useResumeStore.getState().openAIModal('cv', { draftCoverLetter: true, coverLetterOnly: true });
    render(<AIEditModal />);

    // ⚠️ `find`, not `get`: the submit button renders its loading label until
    // `fetchAIUsageStatus` settles, so a synchronous query reads "Loading…" and
    // would pass against ANY label once it did resolve.
    expect(
      await screen.findByRole('button', { name: en.editor.coverLetter.empty_title }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: en.ai.suggest })).toBeNull();
  });

  /**
   * The other half, and the one that catches a fix applied too widely: the
   * ordinary whole-CV run must still offer all three.
   */
  it('leaves the whole-CV run exactly as it was', async () => {
    useResumeStore.getState().openAIModal('cv');
    render(<AIEditModal />);

    const { translate, reorg, letterTick, back } = cvControls();
    expect(translate).not.toBeNull();
    expect(reorg).not.toBeNull();
    expect(letterTick).not.toBeNull();
    expect(back).not.toBeNull();
    expect(await screen.findByRole('button', { name: en.ai.suggest })).toBeTruthy();
    expect(screen.queryByRole('button', { name: en.editor.coverLetter.empty_title })).toBeNull();
  });
});
