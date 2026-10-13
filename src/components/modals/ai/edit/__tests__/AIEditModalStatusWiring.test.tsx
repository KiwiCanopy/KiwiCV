// @vitest-environment jsdom
import { AIEditModal } from '@/components/modals/ai/edit/AIEditModal';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ **The seam the two-step run introduces, and nothing else binds it.**
 *
 * `runStage`, `coverLetterOutcome` and `onCoverLetterRetry` are OPTIONAL on
 * `AIStatusViewProps`, so deleting the three lines that pass them from
 * `AIEditModal` typechecks and leaves every other suite green — `AIStatusView`'s
 * own tests render it directly, and `coverLetterWiring` mocks `useAIGeneration`
 * and asserts one layer below the JSX. What the user would get is the whole of
 * the single-call run: no stage heading, no completed line, no letter card, and a failed
 * letter rendered as a plain green success with no retry.
 *
 * That is the same trap — a guard that pins a callee does not bind the call
 * site — applied to this branch's own new wiring.
 */

const handleCoverLetterRetry = vi.fn();
const handleGenerate = vi.fn();

let context: Record<string, unknown>;

/** Not under test, and it reaches the router and the language context. */
vi.mock('@/components/modals/InsufficientPremiumAccessModal', () => ({
  InsufficientPremiumAccessModal: () => null,
}));

vi.mock('@/components/modals/ai/edit/useAIEdit', () => ({
  useAIEdit: () => context,
}));

const baseContext = () => ({
  isOpen: true,
  autoRun: false,
  activeTarget: 'cv',
  mode: 'job_description',
  isLoading: false,
  status: 'success',
  setStatus: vi.fn(),
  errorMessage: '',
  isUpgradeModalOpen: false,
  setIsUpgradeModalOpen: vi.fn(),
  monetizationMode: 'generic',
  closeAIModal: vi.fn(),
  resetState: vi.fn(),
  handleGenerate,
  handleCoverLetterRetry,
  changeDetails: { itemsCount: 4, reorgCount: 0 },
  coverLetterOutcome: null,
  runStage: null,
});

beforeEach(() => {
  handleCoverLetterRetry.mockClear();
  handleGenerate.mockClear();
  context = baseContext();
  useResumeStore.getState().openAIModal('cv');
});

describe('AIEditModal hands the status view its two-call state', () => {
  it('renders the letter failure and reaches the letter-only re-run', async () => {
    const user = userEvent.setup();
    context = {
      ...baseContext(),
      coverLetterOutcome: { status: 'failed', error: 'LETTER_CALL_FAILED', retryable: true },
      runStage: { stage: 'cover_letter', twoStep: true },
    };
    render(<AIEditModal />);

    // Twice over: the visible description and the sr-only live region that
    // announces it. Both come from the same prop.
    expect(screen.getAllByText(/couldn’t draft the cover letter/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Try the letter again' }));
    expect(handleCoverLetterRetry).toHaveBeenCalledTimes(1);
    // ⚠️ Not the full run. That would re-tailor the CV and bill a second slot.
    expect(handleGenerate).not.toHaveBeenCalled();
  });

  it('renders the drafted-letter outcome', () => {
    context = {
      ...baseContext(),
      coverLetterOutcome: { status: 'success', retryable: false },
      runStage: { stage: 'cover_letter', twoStep: true },
    };
    render(<AIEditModal />);

    expect(
      screen.getByText('Your cover letter is drafted — find it in the Cover Letter section.'),
    ).toBeTruthy();
  });

  it('heads the running two-step job with the call in flight', () => {
    context = {
      ...baseContext(),
      status: 'processing',
      runStage: { stage: 'cover_letter', twoStep: true },
    };
    render(<AIEditModal />);

    expect(
      screen.getByRole('heading', { name: 'Step 2 of 2 — Drafting your cover letter' }),
    ).toBeTruthy();
    expect(screen.getByText('CV tailored')).toBeTruthy();
  });

  /** A run with no letter is the single-call screen, unchanged. */
  it('leaves an ordinary run alone', () => {
    context = { ...baseContext(), status: 'processing' };
    render(<AIEditModal />);

    expect(screen.getByRole('heading', { name: 'Optimizing...' })).toBeTruthy();
    expect(screen.queryByText(/Step \d of 2/)).toBeNull();
  });

  /**
   * ⚠️ `target` and `mode` are two more optional props with nothing visible
   * behind them — they only shape the `AI_SUGGESTION_*` payloads, so dropping
   * either typechecks and leaves every assertion above green while the events
   * start reporting `null`. Same class as the three props this file was written
   * for.
   */
  it('attributes the run in the analytics payload', async () => {
    const user = userEvent.setup();
    const track = vi.spyOn(analytics, 'track').mockImplementation(() => {});
    render(<AIEditModal />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(track).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.AI_SUGGESTION_CONFIRMED,
      expect.objectContaining({ mode: 'job_description', ai_scope: 'cv', ai_target: 'cv' }),
    );
    track.mockRestore();
  });
});
