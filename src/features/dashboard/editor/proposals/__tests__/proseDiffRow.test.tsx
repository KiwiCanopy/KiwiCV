// @vitest-environment jsdom
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * A long prose field's proposal — the cover letter's body.
 *
 * ⚠️ **The mode this replaces was measured, not disliked.** `markList` on a real
 * 11-paragraph letter renders 2,869px at 1440×900 and 5,205px on a phone: three
 * to six screens of green-and-red prose, struck through, above the letter it
 * describes. The toggle holds the panel at a fixed height whatever the letter
 * does, so the assertions here are about the two things that buys — one version
 * at a time, and a summary that answers "what changed" before a word is read.
 *
 * ⚠️ **Nothing here may pair paragraph `i` with paragraph `i` for an ACTION.**
 * The count is asked for in the prompt with nothing enforcing it, so a merged
 * paragraph shifts every index below. The same-index comparison is a HINT and
 * must vanish when the counts differ — the last two cases pin exactly that.
 */

const LABELS = { paragraphs: 'Letter body', summary: 'Summary' };

const seed = (originalValue: Record<string, unknown>, improvedValue: Record<string, unknown>) => {
  useResumeStore.setState((state) => ({
    // The letter holds the PROPOSAL, because the run already applied it — that
    // is what makes "Keep mine" the button that writes.
    resume: {
      ...state.resume,
      coverLetter: {
        ...state.resume.coverLetter,
        ...(improvedValue as { paragraphs?: string[] }),
      },
    },
    ai: {
      ...state.ai,
      suggestions: {
        'item:coverLetter': { originalValue, improvedValue, timestamp: 1 },
      },
    },
  }));
};

const renderPanel = (proseFields: readonly (keyof typeof LABELS)[] = ['paragraphs']) =>
  render(
    <EntryDiffPanel target="item:coverLetter" fieldLabels={LABELS} proseFields={proseFields} />,
  );

/** Eleven paragraphs, nine of them rewritten, and shorter — the observed run. */
const MINE = Array.from({ length: 11 }, (_, i) =>
  i === 0 ? 'Salutation' : i === 10 ? 'Closing' : `mine ${i} `.repeat(20),
);
const PROPOSAL = MINE.map((entry, i) => (i === 0 || i === 10 ? entry : `theirs ${i} `.repeat(10)));

const body = () => screen.getByRole('group', { name: /AI proposal|Your wording/ });
const ruledParagraphs = () =>
  [...body().querySelectorAll('p')].filter(
    (node) => !node.className.includes('border-l-transparent'),
  );

describe('a cover letter’s proposal', () => {
  beforeEach(() => {
    seed({ paragraphs: MINE }, { paragraphs: PROPOSAL });
  });

  it('shows one version at a time instead of marking every entry', () => {
    renderPanel();

    expect(screen.getByRole('button', { name: 'AI proposal' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Your wording' })).toBeTruthy();

    // ⚠️ Asserted on the TREATMENT, not on the word. An earlier version checked
    // that "Added" was absent, which broke the moment the per-paragraph
    // `sr-only` marker landed — and would have passed for a row that rendered
    // the bullet diff with different copy. The `+`/`−` glyphs and the strike are
    // what must not be here.
    const marks = body().parentElement!.querySelectorAll('.line-through');
    expect(marks).toHaveLength(0);
    expect(screen.queryByText('−')).toBeNull();
    expect(screen.queryByText('+')).toBeNull();
  });

  it('says what changed before a word of it is read', () => {
    renderPanel();

    expect(screen.getByText(/9 of 11 paragraphs rewritten/)).toBeTruthy();
    // ⚠️ The NUMBER, not just the word. `/shorter/` alone pinned the direction
    // and left the magnitude free: dividing by the proposal's length instead of
    // the original's renders "54% shorter" for the same pair, and passed.
    expect(screen.getByText(/about 35% shorter/)).toBeTruthy();
  });

  it('opens on the proposal, which is what the preview beside it already shows', () => {
    renderPanel();

    expect(body().getAttribute('aria-label')).toBe('AI proposal');
    expect(within(body()).getByText(/theirs 1/)).toBeTruthy();
  });

  it('marks the paragraphs that moved, and only in the proposal', async () => {
    const user = userEvent.setup();
    renderPanel();

    // Nine rewritten, so nine rules; the salutation and the closing keep none.
    expect(ruledParagraphs()).toHaveLength(9);

    await user.click(screen.getByRole('button', { name: 'Your wording' }));
    expect(ruledParagraphs()).toHaveLength(0);
  });

  /**
   * ⚠️ The key goes with the marks it explains. Left showing in "Your wording"
   * it labels a body that has no marks in it — the same defect as the summary
   * line, which still reads "9 of 11 paragraphs rewritten" over the user's own
   * version and is the aggregate, so it stays.
   */
  it('shows the key for the marks only where the marks are', async () => {
    const user = userEvent.setup();
    const { container } = renderPanel();

    // The swatch, not a word: the summary sentence beside it supplies "rewritten".
    const key = () => container.querySelectorAll('[data-mark-key]');
    expect(key()).toHaveLength(1);
    expect(screen.getByText(/9 of 11 paragraphs rewritten/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Your wording' }));
    expect(key()).toHaveLength(0);
  });

  it('swaps the whole body when the version is switched', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Your wording' }));

    expect(body().getAttribute('aria-label')).toBe('Your wording');
    expect(within(body()).getByText(/mine 1/)).toBeTruthy();
    expect(within(body()).queryByText(/theirs 1/)).toBeNull();
  });

  /**
   * ⚠️ The owner's requirement, and the reason this is not a `readOnly` control:
   * accept/decline is per field, so copying one sentence back out of your own
   * version is the recovery path when you want most of the rewrite but not all
   * of it. Text that cannot be selected closes that path.
   */
  it('renders text the reader can select and copy, and cannot type into', () => {
    renderPanel();

    const paragraph = body().querySelector('p')!;
    // ⚠️ `isContentEditable` is unimplemented in jsdom and reads `undefined`,
    // which `toBe(false)` would have failed on and `toBeFalsy()` would have
    // passed on for the wrong reason. The attribute is what the browser reads.
    expect(paragraph.hasAttribute('contenteditable')).toBe(false);
    expect(body().querySelector('textarea')).toBeNull();
    expect(body().querySelector('input')).toBeNull();
    // ⚠️ The docstring's actual claim. Without this, adding `select-none` would
    // close the recovery path and keep the case green.
    expect(paragraph.className).not.toContain('select-none');
    expect(body().className).not.toContain('select-none');
  });

  /**
   * ⚠️ **The wiring, not the labels.** An earlier version asserted only that the
   * two buttons existed by name — so swapping `onAccept` and `onDecline` on the
   * row left the whole suite green, with "Keep mine" discarding the user's
   * letter and "Use the proposal" restoring it. That is a known failure shape exactly:
   * a cover-letter control that cannot work, shipped with every gate green, on
   * the branch built to stop it happening.
   */
  it('puts the user’s letter back when Keep mine is pressed', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Keep mine' }));

    expect(useResumeStore.getState().resume.coverLetter.paragraphs).toEqual(MINE);
    expect(useResumeStore.getState().ai.suggestions['item:coverLetter']).toBeUndefined();
  });

  it('keeps the proposal and clears the pending marker when Use the proposal is pressed', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Use the proposal' }));

    expect(useResumeStore.getState().resume.coverLetter.paragraphs).toEqual(PROPOSAL);
    expect(useResumeStore.getState().ai.suggestions['item:coverLetter']).toBeUndefined();
  });

  /**
   * ⚠️ A changed paragraph COUNT makes same-index comparison meaningless, and
   * the count is then the headline. Without this the panel would confidently
   * mark paragraph 5 as "changed" because it now holds what used to be
   * paragraph 6.
   */
  it('drops the per-paragraph marks when the count changed, and says so', () => {
    seed({ paragraphs: MINE }, { paragraphs: PROPOSAL.slice(0, 9) });
    renderPanel();

    expect(screen.getByText(/now has 9 paragraphs instead of 11/)).toBeTruthy();
    expect(screen.queryByText(/paragraphs rewritten/)).toBeNull();
    expect(ruledParagraphs()).toHaveLength(0);
  });

  /**
   * ⚠️ The nudge has to land INSIDE the floor and PAST the rounding, or the case
   * proves nothing. An earlier version appended one character to a 1,277-
   * character letter — 0.08%, which `Math.round` takes to 0 — so the note was
   * suppressed by `lengthDeltaPercent === 0`, never by the 5% floor the case is
   * named after. Deleting the floor entirely left it green. ~3% exercises it.
   */
  it('reports no length note when the letter barely changed size', () => {
    const nudged = MINE.map((entry, i) => (i === 5 ? `${entry}${'x'.repeat(38)}` : entry));
    seed({ paragraphs: MINE }, { paragraphs: nudged });
    renderPanel();

    expect(screen.queryByText(/shorter|longer/)).toBeNull();
    expect(screen.getByText(/1 of 11 paragraphs rewritten/)).toBeTruthy();
  });

  /**
   * ⚠️ jsdom computes no layout, so `scrollHeight` is 0 and nothing ever
   * overflows here. That makes this a pin on the GATE — a fold control is
   * offered only when something is folded — while the browser measurement pins
   * the behaviour (517px panel, 11 paragraphs: body capped at 352px of 1,320px).
   * Rendering it unconditionally, as an earlier version did, put a dead control
   * under every short letter.
   */
  it('offers no fold control when nothing is folded', () => {
    renderPanel();

    expect(screen.queryByRole('button', { name: /Show the whole letter/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Show less/ })).toBeNull();
  });

  /**
   * ⚠️ The rule marking a rewritten paragraph is a border, and a border is not
   * readable. Without a text equivalent a screen-reader user gets the aggregate
   * count and no way to tell WHICH paragraph moved — information sighted users
   * have. `EntryDiffRow` solved the same problem next door with `sr-only` marks
   * (WCAG 1.3.1).
   */
  it('names each rewritten paragraph for a screen reader, not just with a rule', () => {
    renderPanel();

    const marked = [...body().querySelectorAll('p')].filter((node) =>
      node.querySelector('.sr-only'),
    );
    // Nine rewritten of eleven, matching the rules and the summary line.
    expect(marked).toHaveLength(9);
    expect(marked[0].querySelector('.sr-only')!.textContent!.trim()).toBe('Rewritten');

    // The salutation and the closing did not move, so they carry no marker.
    const unmarked = [...body().querySelectorAll('p')].filter(
      (node) => !node.querySelector('.sr-only'),
    );
    expect(unmarked).toHaveLength(2);
  });

  it('reports a proposal that grew, not only one that shrank', () => {
    const padded = MINE.map((entry, i) => (i === 0 || i === 10 ? entry : `${entry}${entry}`));
    seed({ paragraphs: MINE }, { paragraphs: padded });
    renderPanel();

    expect(screen.getByText(/longer/)).toBeTruthy();
    expect(screen.queryByText(/shorter/)).toBeNull();
  });

  /** A field not named as prose keeps the two-column comparison, unmarked. */
  it('leaves a non-prose field on the unmarked two-column comparison', () => {
    seed({ summary: 'before' }, { summary: 'after' });
    renderPanel([]);

    expect(screen.queryByRole('button', { name: 'AI proposal' })).toBeNull();
    expect(screen.getByText('before')).toBeTruthy();
    expect(screen.getByText('after')).toBeTruthy();
  });

  /**
   * ⚠️ A class assertion, because jsdom evaluates no container query — so this
   * pins the RULE and the browser pinned the RESULT (517px panel → one column at
   * 61 characters per line; 911px → two at 55, both inside the 45–75 band).
   *
   * It is worth pinning because the wrong answer here shipped twice. The
   * original `sm:grid-cols-2` is a VIEWPORT breakpoint inside a pane-relative
   * layout: it split however narrow the pane was, at 28 characters per line.
   * The first repair swapped it for the PANE's own breakpoint, which measured
   * identically — a 704px pane still holds this panel at 517px. Only the panel
   * knows how much room a column gets, and it is inset differently at its two
   * mount sites.
   */
  it('sizes the comparison against the panel, not the viewport or the pane', () => {
    seed({ summary: 'before' }, { summary: 'after' });
    const { container } = renderPanel([]);

    const panel = container.querySelector('[data-ai-pending="entry"]')!;
    const grid = panel.querySelector('div.grid')!;

    expect(panel.className).toContain('@container');
    expect(grid.className).toContain('@min-[48rem]:grid-cols-2');
    expect(grid.className).not.toContain('sm:grid-cols-2');
  });

  /**
   * ⚠️ Also a class assertion, for the same reason: jsdom measures no width. The
   * browser pinned the result — unbounded, this body rendered **109 characters
   * per line** at a 1045px panel, on the surface whose entire justification is
   * legibility, while `EntryDiffRow` one file over splits at 48rem to protect a
   * ~45-character floor. A floor without a ceiling is half a rule.
   *
   * ⚠️ Asserted as `rem`, not `ch`, and that distinction was measured: `ch` is
   * the width of the digit ZERO (10.1px here) against 7.5px for average prose,
   * so `max-w-[72ch]` rendered **97** characters per line. The first attempt at
   * this ceiling did not bind where it claimed to.
   */
  /**
   * ⚠️ One clause, not two. "The preview already shows the proposal." led this
   * footer until a `ui-designer` pass had it struck: it explained an
   * implementation fact — that the run pre-applies its proposal — and it was
   * measurably false the moment anyone edited the live field, where the preview
   * then showed neither version in the panel. What survives states an
   * irreversible consequence, which is the only warning about the edit-then-
   * decline path the store now guards. The key is gone since it was left
   * unreferenced, so this matches the SENTENCE and not the key — and a `t()` for
   * the deleted key reds `i18n:check` ("references missing") before it reaches a
   * test, measured on this branch.
   */
  it('warns what the two buttons cost, without explaining the mechanism', () => {
    renderPanel();

    expect(screen.getByText(/Keeping yours restores your original wording/)).toBeTruthy();
    expect(screen.queryByText(/The preview already shows the proposal/)).toBeNull();
  });

  it('holds the prose to a readable measure', () => {
    renderPanel();
    expect(body().className).toContain('max-w-[34rem]');
  });
});
