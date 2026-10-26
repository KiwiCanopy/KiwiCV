// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { COVER_LETTER_STYLE_OPTION } from '@/components/modals/ai/template/coverLetterLabels';
import {
  COVER_LETTER_DEFAULT_LENGTH,
  COVER_LETTER_DEFAULT_TONE,
  COVER_LETTER_STYLE_MAX,
} from '@/constants/ai';
import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Signed in with an active Pass, as the sibling composer suites are. */
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: { ai_requests_today: 0 },
    session: { access_token: 'token' },
    isPremium: true,
    refreshProfile: async () => {},
  }),
}));

vi.mock('@/utils/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/ai')>()),
  fetchAIUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
}));

const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  useUIStore.setState({ aiComposerCollapsed: false });
  // ⚠️ Stated, never borrowed from `resetPrompt()`. That helper deliberately
  // KEEPS the cover-letter settings — they are written from two live surfaces
  // and clearing them there is what forced the band to keep mirrors — so a
  // suite that used it as its clean slate leaked a ticked box from one case
  // into the next, and failed with a message about `aria-disabled`.
  useFlowStore.setState({
    prompt: {
      mode: null,
      jobDescription: '',
      customPrompt: '',
      allowReorg: false,
      draftCoverLetter: false,
      coverLetterLength: COVER_LETTER_DEFAULT_LENGTH,
      coverLetterTone: COVER_LETTER_DEFAULT_TONE,
      coverLetterMatchStyle: false,
      coverLetterToneChosen: false,
    },
  });
  useResumeStore.getState().closeAIModal();
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...state.resume.coverLetter, subject: '', paragraphs: [] },
    },
  }));
});

const tick = () =>
  screen.getByRole('checkbox', { name: 'Also draft a cover letter' }) as HTMLInputElement;
const tone = () => screen.getByRole('combobox', { name: 'Tone' }) as HTMLSelectElement;

/**
 * ⚠️ **All three of these were found by opening the app, not by a test.** The
 * suite was green through every one of them, because each is a disagreement
 * between two places the same fact lives — which is exactly the class of bug
 * this repository keeps shipping.
 */
describe('the composer cover-letter add-on', () => {
  /**
   * `useFlowStore.prompt.mode` is written only when the bar RUNS or hands off,
   * so the runner's copy is stale for the whole time the user is choosing a
   * mode. Shipped as "Add a job description to draft a letter." sitting under a
   * bar already set to Job tailoring.
   */
  it('takes the refusal from the bar own mode, not from the store', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    // Job tailoring is the bar's default; the store's mode is still null.
    expect(useFlowStore.getState().prompt.mode).toBeNull();
    expect(tick().getAttribute('aria-disabled')).toBeNull();
    expect(screen.queryByText('Add a job description to draft a letter.')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));
    expect(tick().getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText('Add a job description to draft a letter.')).toBeTruthy();
  });

  /**
   * ⚠️ **Choosing the writing style must NOT open the AI config screen.**
   *
   * It used to: `openAIModal('cv')` answered "let me paste a sample" with a
   * 576×722 dialog restating the job description, offering translation and
   * restructure, and putting the field below the fold — the heaviest surface in
   * the app for the smallest request in the flow. A single-purpose dialog
   * replaced it.
   */
  it('opens the sample dialog, not the AI config modal', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    fireEvent.click(tick());
    act(() => {
      fireEvent.change(tone(), { target: { value: COVER_LETTER_STYLE_OPTION } });
    });

    expect(screen.getByRole('dialog', { name: en.ai.style_sample_title })).toBeTruthy();
    expect(useResumeStore.getState().ai.isModalOpen).toBe(false);
    expect(useFlowStore.getState().prompt.coverLetterMatchStyle).toBe(true);

    // The capped field is in the dialog, and only there — named by the
    // dialog's own heading rather than carrying a second, different name.
    //
    // ⚠️ Read from the constant, not restated. The cap has moved once (4,000 →
    // 5,000) and a literal here pins the field to whichever value was current
    // when the assertion was written, not to the one the server enforces.
    const field = screen.getByRole('textbox', { name: en.ai.style_sample_title });
    expect(field.getAttribute('maxlength')).toBe(String(COVER_LETTER_STYLE_MAX));
    expect(screen.queryByText(en.ai.style_sample_label)).toBeNull();
  });

  /**
   * ⚠️ **The whole reason the checkbox became a fifth dropdown value.**
   *
   * Two widgets could show a live tone adjective beside "no sample yet" while
   * the run used that adjective — asserting one voice and delivering another,
   * for two billed requests. A select renders one value, so the state cannot
   * exist. This pins that the option is IN the select rather than beside it,
   * and that picking it back restores the adjective rather than discarding it.
   */
  it('offers the writing style inside the tone select, and restores the tone on the way back', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(tick());

    expect(screen.queryByRole('checkbox', { name: /writing style/i })).toBeNull();
    expect([...tone().options].map((option) => option.value)).toContain(COVER_LETTER_STYLE_OPTION);

    act(() => void fireEvent.change(tone(), { target: { value: 'confident' } }));
    expect(useFlowStore.getState().prompt.coverLetterTone).toBe('confident');

    act(() => void fireEvent.change(tone(), { target: { value: COVER_LETTER_STYLE_OPTION } }));
    expect(useFlowStore.getState().prompt.coverLetterMatchStyle).toBe(true);
    // Untouched underneath, so coming back is not a loss.
    expect(useFlowStore.getState().prompt.coverLetterTone).toBe('confident');

    // The dialog opens over the band and hides it, so dismiss it to read back.
    act(() => void fireEvent.click(screen.getByRole('button', { name: en.common.ok })));
    expect(tone().value).toBe(COVER_LETTER_STYLE_OPTION);
  });

  /**
   * ⚠️ The sentinel is a UI value and must never reach the wire — the backend
   * validates tones against its own table, so it would be `LETTER_BAD_REQUEST`.
   */
  it('never sends the writing-style sentinel as a tone', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(tick());
    act(() => void fireEvent.change(tone(), { target: { value: COVER_LETTER_STYLE_OPTION } }));

    expect(useFlowStore.getState().prompt.coverLetterTone).not.toBe(COVER_LETTER_STYLE_OPTION);
  });

  /**
   * ⚠️ This once asserted the opposite: an existing letter refused the
   * tick, because a draft would have overwritten it. It no longer can — the
   * letter arrives as an `item:coverLetter` proposal keeping the old one as
   * `originalValue` — and refusing was the dead end this change removed.
   */
  it('offers a letter even when the user already has one', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: { ...state.resume.coverLetter, paragraphs: ['Dear Hiring Manager,'] },
      },
    }));
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    const box = tick();
    expect(box.getAttribute('aria-disabled')).toBeNull();

    fireEvent.click(box);
    expect(useFlowStore.getState().prompt.draftCoverLetter).toBe(true);
  });

  it('forces the tick false when a refusal appears under a box already ticked', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(tick());
    expect(tick().checked).toBe(true);

    // ⚠️ The MODE is the surviving refusal (the content one is gone), and
    // it is band-local — switching it in the store would not reach the bar,
    // which is the very disagreement the test above pins.
    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));

    // Still ticked would promise a letter the request builder will not ask for.
    expect(tick().checked).toBe(false);
    expect(screen.queryByRole('combobox', { name: 'Length' })).toBeNull();
  });

  /**
   * The button that opens the sample editor says which of the two it will do,
   * and that is the only thing distinguishing "no sample yet" from "one saved"
   * now that the summary line is gone.
   */
  it('names the sample button for the state it is in', () => {
    useFlowStore.setState((state) => ({
      prompt: {
        ...state.prompt,
        draftCoverLetter: true,
        coverLetterMatchStyle: true,
        coverLetterToneChosen: true,
      },
    }));
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    const button = screen.getByRole('button', { name: en.ai.style_sample_add });
    expect(button.getAttribute('aria-label')).toBeNull();
    expect(en.ai.style_sample_add).not.toBe(en.ai.style_sample_edit);
  });

  /**
   * ⚠️ The run is REFUSED, not made impossible. `AIComposerBar` renders the run
   * button as `{canRunNow && …}` — absent, not disabled — so folding this into
   * `canRun` would make the primary action vanish because of a cover-letter
   * dropdown.
   */
  it('holds the run when the writing style is chosen with no sample, without hiding it', () => {
    useFlowStore.setState((state) => ({
      prompt: {
        ...state.prompt,
        draftCoverLetter: true,
        coverLetterMatchStyle: true,
        coverLetterToneChosen: true,
        jobDescription: 'Senior Frontend Engineer, Berlin.',
      },
    }));
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    const runButton = screen.getByRole('button', { name: en.ai.composer_run_documents });
    expect(runButton).toBeTruthy();
    expect(runButton.getAttribute('aria-disabled')).toBe('true');

    const reason = document.getElementById(runButton.getAttribute('aria-describedby') as string);
    expect(reason?.textContent).toBe(en.ai.cover_letter_needs_sample);

    fireEvent.click(runButton);
    expect(useResumeStore.getState().ai.isModalOpen).toBe(false);
  });

  /**
   * ⚠️ **The fragment's DOM contract, which lived only in a comment.**
   *
   * The inline variant returns a fragment whose settings row is `basis-full`,
   * and that is only meaningful if the IMMEDIATE parent is the strip's own
   * `flex-wrap` container. Wrap the control in a `<div>` for spacing and the
   * row silently folds back onto the tick row — measured as not fitting: German
   * occupies 653px of a 1038px strip at 1180, and an inline reveal of both
   * selects needs 1249.
   */
  it('drops its settings to a row of their own inside the strip', () => {
    useFlowStore.setState((state) => ({ prompt: { ...state.prompt, draftCoverLetter: true } }));
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    const strip = tick().closest('.flex-wrap');
    const settingsRow = screen.getByRole('combobox', { name: 'Length' }).closest('.basis-full');

    expect(strip).not.toBeNull();
    expect(settingsRow).not.toBeNull();
    expect(settingsRow?.parentElement).toBe(strip);
  });

  /**
   * ⚠️ **An `aria-describedby` that names a missing element is an invalid ARIA
   * reference (4.1.2), not a harmless one.** The visible reason lives in the
   * add-ons strip, which unmounts with the band — and the band RESTS CLOSED, so
   * the dangling state is the common one, not the edge case. `AIComposerBar`
   * already carries this exact lesson for `aria-controls`; the run button
   * repeated it, and it was caught by a mis-click rather than by a test.
   */
  const blockedDraft = () =>
    useFlowStore.setState((state) => ({
      prompt: {
        ...state.prompt,
        draftCoverLetter: true,
        coverLetterMatchStyle: true,
        coverLetterToneChosen: true,
        jobDescription: 'Senior Frontend Engineer, Berlin.',
      },
    }));

  it('keeps the run button reason resolvable while the band is open', () => {
    useUIStore.setState({ aiComposerCollapsed: false });
    blockedDraft();
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    const runButton = screen.getByRole('button', { name: en.ai.composer_run_documents });
    const describedBy = runButton.getAttribute('aria-describedby') as string;

    expect(describedBy).toBeTruthy();
    const target = document.getElementById(describedBy);
    expect(target).not.toBeNull();
    expect(target?.textContent).toBe(en.ai.cover_letter_needs_sample);
    expect(document.querySelectorAll(`[id="${describedBy}"]`)).toHaveLength(1);
  });

  // Closed, the run is absent in this mode (#27), so nothing references a reason.
  it('shows no run button, and so no dangling reason, while the band is closed', () => {
    useUIStore.setState({ aiComposerCollapsed: true });
    blockedDraft();
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    expect(screen.queryByRole('button', { name: en.ai.composer_run_documents })).toBeNull();
    expect(document.querySelector('[aria-describedby]')).toBeNull();
  });

  /**
   * The other half, and the one a mutation caught missing: an unblocked run
   * must not carry the reference at all. Set unconditionally it dangles in
   * every state where the reason is not rendered — which is most of them.
   */
  it('carries no reason on the run button when nothing is blocking it', () => {
    useFlowStore.setState((state) => ({
      prompt: {
        ...state.prompt,
        draftCoverLetter: true,
        coverLetterMatchStyle: false,
        jobDescription: 'Senior Frontend Engineer, Berlin.',
      },
    }));
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    const runButton = screen.getByRole('button', { name: en.ai.composer_run_documents });
    expect(runButton.getAttribute('aria-disabled')).toBeNull();
    expect(runButton.getAttribute('aria-describedby')).toBeNull();
  });
});
