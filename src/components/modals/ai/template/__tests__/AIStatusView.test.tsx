// @vitest-environment jsdom
import { AIStatusView } from '@/components/modals/ai/template/AIStatusView';
import { COVER_LETTER_ICON } from '@/data/sections';
import { RAIL_ICONS } from '@/features/dashboard/editor/rail/railSections';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

/** The rotating phase dots, which the two-step run must not repurpose. */
const dots = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('span')).filter((el) => el.className.includes('h-1.5'));

/** The two-call sentence. A letter-only re-run gets its own — see below. */
const LETTER_FAILED =
  'Your CV is tailored. KiwiCV couldn’t draft the cover letter this time, so only one of today’s requests was used.';

describe('the single-call run is untouched', () => {
  /**
   * ⚠️ `AIImportModal` passes none of the two-step run's props, and this is the shape of
   * that call. The acceptance criterion is that it is unchanged, so it is
   * asserted here rather than assumed from "the props are optional".
   */
  it('keeps its heading and its dot row when no stage is passed', () => {
    const { container } = render(<AIStatusView status="processing" />);

    expect(screen.getByRole('heading', { name: 'Optimizing...' })).toBeTruthy();
    expect(dots(container)).toHaveLength(7);
    expect(screen.queryByText(/Step \d of 2/)).toBeNull();
    expect(screen.queryByText('CV tailored')).toBeNull();
  });

  /**
   * ⚠️ Binds the router→leaf hand-off: moving the processing branch
   * out turned an inline read into an OPTIONAL prop across a seam, the shape
   * `.claude/rules/testing.md` calls an unbound call site. Dropping it from the
   * router still typechecks. `AIImportModal`'s own call site is not covered here.
   */
  it('renders the note the import flow uses to hold the page open', () => {
    render(<AIStatusView status="processing" processingNote="Keep this page open." />);

    expect(screen.getByText('Keep this page open.')).toBeTruthy();
  });

  /** A letter-only re-run is one call, so it keeps the dots and drops the count. */
  it('heads a letter-only re-run without a step count', () => {
    const { container } = render(
      <AIStatusView status="processing" runStage={{ stage: 'cover_letter', twoStep: false }} />,
    );

    expect(screen.getByRole('heading', { name: 'Drafting your cover letter' })).toBeTruthy();
    expect(dots(container)).toHaveLength(7);
    expect(screen.queryByText('CV tailored')).toBeNull();
  });
});

describe('the two-step run', () => {
  it('heads the first step and drops the dot row', () => {
    const { container } = render(
      <AIStatusView status="processing" runStage={{ stage: 'cv', twoStep: true }} />,
    );

    expect(screen.getByRole('heading', { name: 'Step 1 of 2 — Tailoring your CV' })).toBeTruthy();
    // ⚠️ Dropped, not repurposed: at 1.75:1 they fail 1.4.11 the moment they
    // carry which call is running.
    expect(dots(container)).toHaveLength(0);
    expect(screen.queryByText('CV tailored')).toBeNull();
  });

  it('heads the second step and says the CV is already safe', () => {
    const { container } = render(
      <AIStatusView status="processing" runStage={{ stage: 'cover_letter', twoStep: true }} />,
    );

    expect(
      screen.getByRole('heading', { name: 'Step 2 of 2 — Drafting your cover letter' }),
    ).toBeTruthy();
    expect(screen.getByText('CV tailored')).toBeTruthy();
    expect(dots(container)).toHaveLength(0);
  });

  /**
   * The heading and the completed line are the only text in the live region, so
   * the stage change is announced once — not once per phase rotation.
   */
  it('carries the stage inside the announced region', () => {
    render(
      <AIStatusView status="processing" runStage={{ stage: 'cover_letter', twoStep: true }} />,
    );

    const region = screen.getByRole('status');
    expect(region.textContent).toContain('Step 2 of 2 — Drafting your cover letter');
    expect(region.textContent).toContain('CV tailored');
  });

  /**
   * ⚠️ The announcement above depends on this. `aria-busy` tells assistive
   * tech to defer announcing a live region's mutations until it clears — and this
   * node is replaced wholesale by the success or error view, so a hardcoded
   * `"true"` never cleared and the stage change could be deferred forever.
   *
   * ⚠️ It is a `role="status"` region that must not carry it, not the attribute
   * that is wrong everywhere: `StatePanel`, `Button` and `DialogFrame` put
   * `aria-busy` on containers and controls, correctly, and toggle it.
   */
  it('does not defer its own announcement with aria-busy', () => {
    render(
      <AIStatusView status="processing" runStage={{ stage: 'cover_letter', twoStep: true }} />,
    );

    expect(screen.getByRole('status').getAttribute('aria-busy')).toBeNull();
  });

  /** The single-call flows share this region — the import modal included. */
  it('does not defer it on a single-call run either', () => {
    render(<AIStatusView status="processing" />);

    expect(screen.getByRole('status').getAttribute('aria-busy')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AIStatusView status="processing" runStage={{ stage: 'cover_letter', twoStep: true }} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('the letter outcome', () => {
  it('reports a drafted letter as its own card', () => {
    render(
      <AIStatusView
        status="success"
        coverLetterOutcome={{ status: 'success', retryable: false }}
      />,
    );

    expect(
      screen.getByText('Your cover letter is drafted — find it in the Cover Letter section.'),
    ).toBeTruthy();
    expect(screen.getByText('Your content has been successfully improved.')).toBeTruthy();
  });

  /**
   * ⚠️ The failure REPLACES the success description rather than adding a card,
   * because the outcome cards are not announced and a screen reader would
   * otherwise hear only "Optimized! Your content has been successfully
   * improved." on a run whose letter failed.
   */
  it('announces a partial failure instead of the success line', () => {
    render(
      <AIStatusView
        status="success"
        runStage={{ stage: 'cover_letter', twoStep: true }}
        coverLetterOutcome={{ status: 'failed', error: 'LETTER_CALL_FAILED', retryable: true }}
        onCoverLetterRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole('status').textContent).toContain(LETTER_FAILED);
    expect(screen.queryByText('Your content has been successfully improved.')).toBeNull();
    // The CV is what succeeded, and the panel still says so.
    expect(screen.getByText('Optimized!')).toBeTruthy();
  });

  it('offers a retry that re-runs the letter alone', async () => {
    const user = userEvent.setup();
    const onCoverLetterRetry = vi.fn();
    render(
      <AIStatusView
        status="success"
        coverLetterOutcome={{ status: 'failed', error: 'LETTER_CALL_FAILED', retryable: true }}
        onCoverLetterRetry={onCoverLetterRetry}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Try the letter again' }));
    expect(onCoverLetterRetry).toHaveBeenCalledTimes(1);
  });

  /**
   * ⚠️ `LETTER_ALLOWANCE_SPENT` and `LETTER_BAD_REQUEST` are refused the same
   * way a second time. The copy no longer promises a retry, so the absent
   * button and the sentence agree.
   */
  it('offers no retry for a failure a retry cannot clear', () => {
    render(
      <AIStatusView
        status="success"
        runStage={{ stage: 'cover_letter', twoStep: true }}
        coverLetterOutcome={{
          status: 'failed',
          error: 'LETTER_ALLOWANCE_SPENT',
          retryable: false,
        }}
        onCoverLetterRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole('status').textContent).toContain(LETTER_FAILED);
    expect(screen.queryByRole('button', { name: 'Try the letter again' })).toBeNull();
  });

  /**
   * ⚠️ The two-call sentence is FALSE on a letter-only re-run: that run tailored
   * no CV and spent no request, because a failed letter is never billed (the backend's
   * billing rule). Reachable the moment "Try the letter again" fails twice.
   */
  it('does not claim a request was spent when the re-run spent none', () => {
    render(
      <AIStatusView
        status="success"
        runStage={{ stage: 'cover_letter', twoStep: false }}
        coverLetterOutcome={{ status: 'failed', error: 'LETTER_CALL_FAILED', retryable: true }}
        onCoverLetterRetry={vi.fn()}
      />,
    );

    const announced = screen.getByRole('status').textContent ?? '';
    expect(announced).toContain('Your CV is untouched and no request was used.');
    expect(announced).not.toContain('only one of today’s requests was used');
  });

  it('leaves the success panel alone when no letter was asked for', () => {
    render(<AIStatusView status="success" changeDetails={{ itemsCount: 3, reorgCount: 0 }} />);

    expect(screen.getByText('Your content has been successfully improved.')).toBeTruthy();
    expect(screen.getByText('3 items improved')).toBeTruthy();
    expect(screen.queryByText(/couldn’t draft the cover letter/)).toBeNull();
  });

  it('has no accessibility violations on a partial failure', async () => {
    const { container } = render(
      <AIStatusView
        status="success"
        changeDetails={{ itemsCount: 3, reorgCount: 0 }}
        coverLetterOutcome={{ status: 'failed', error: 'LETTER_TRUNCATED', retryable: true }}
        onCoverLetterRetry={vi.fn()}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

/**
 * ⚠️ The card and the section rail must draw the SAME glyph — the card points at
 * the row the user clicks next. They read one constant rather than two copies,
 * so this asserts the RENDERED icon, not a second copy of the import: comparing
 * `RAIL_ICONS.coverLetter` to a `lucide-react` name imported here would stay
 * green while the component drew something else entirely (again).
 */
describe('the cover-letter glyph', () => {
  it('is the one the section rail draws', () => {
    const { container } = render(
      <AIStatusView
        status="success"
        coverLetterOutcome={{ status: 'success', retryable: false }}
      />,
    );

    const rendered = container.querySelector('svg.lucide-scroll-text');
    expect(rendered).not.toBeNull();
    expect(RAIL_ICONS.coverLetter).toBe(COVER_LETTER_ICON);
  });
});
