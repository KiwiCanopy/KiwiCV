// @vitest-environment jsdom
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { Section } from '@/components/ui/Section';
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { PendingProposalsBar } from '@/features/dashboard/editor/proposals/PendingProposalsBar';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type AITargetKey } from '@/utils/aiTarget';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * Where focus goes when the button the user just pressed removes itself.
 *
 * ⚠️ **Every case here presses a key.** `fireEvent.click` cannot see this
 * defect: it never gives the button focus, so there is no focus to lose and
 * `document.activeElement` is `<body>` before and after. The bug reproduces
 * only from a control that actually held focus, which is why each case focuses
 * the button first and activates it with Enter.
 *
 * ⚠️ The harness mounts the panel with the two things it hands focus to — the
 * pending bar and a `page` Section's heading. Rendered alone, the panel has
 * nowhere to hand focus to and every case here would pass or fail for the
 * wrong reason.
 */

const TARGET = 'item:work:v1';
// `subject` and `paragraphs` carry no label here; the panel falls back to the key.
const LABELS: Partial<Record<'summary' | 'position' | 'subject' | 'paragraphs', string>> = {
  summary: 'Summary',
  position: 'Position',
};

const seed = (suggestions: Record<string, Record<string, unknown>>) => {
  useResumeStore.setState((state) => ({
    ai: {
      ...state.ai,
      reorgSuggestion: null,
      suggestions: Object.fromEntries(
        Object.entries(suggestions).map(([target, improvedValue]) => [
          target,
          {
            improvedValue,
            originalValue: Object.fromEntries(
              Object.keys(improvedValue).map((field) => [field, `original ${field}`]),
            ),
            timestamp: 1,
          },
        ]),
      ),
    },
  }));
};

/**
 * One section at a time, titled from `?section=`, the way `EditorSectionPanel`
 * mounts them — so stepping with Next section moves the heading the handoff
 * lands on, instead of leaving one title standing for every section.
 */
const SECTION_TITLES: Record<string, string> = {
  work: 'Work experience',
  education: 'Education',
};

/** The section the rail has open, titled from `?section=` as `EditorSectionPanel` does. */
const OpenSection = ({
  targets,
  proseFields,
}: {
  targets: readonly AITargetKey[];
  proseFields?: readonly (keyof typeof LABELS & string)[];
}) => {
  const [params] = useSearchParams();
  return (
    <Section title={SECTION_TITLES[params.get('section') ?? 'work']} variant="page">
      {targets.map((target) => (
        <EntryDiffPanel
          key={target}
          target={target}
          fieldLabels={LABELS}
          proseFields={proseFields}
        />
      ))}
    </Section>
  );
};

const Harness = ({
  proseFields,
  targets = [TARGET],
}: {
  proseFields?: readonly (keyof typeof LABELS & string)[];
  /** More than one panel is the shape a section-level run leaves behind. */
  targets?: readonly AITargetKey[];
}) => (
  <MemoryRouter initialEntries={['/?section=work']}>
    <PendingProposalsBar />
    <OpenSection targets={targets} proseFields={proseFields} />
  </MemoryRouter>
);

/** Focus a control the way a keyboard user reaches it, then activate it. */
const pressWithKeyboard = async (
  user: ReturnType<typeof userEvent.setup>,
  control: HTMLElement,
) => {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
};

const heading = (name = 'Work experience') => screen.getByRole('heading', { name });

beforeEach(() => {
  useResumeStore.setState((state) => ({
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
    resume: {
      ...state.resume,
      work: [
        { _vId: 'v1', name: 'Acme', position: 'Engineer', summary: 'Improved wording' },
        { _vId: 'v2', name: 'Beta', position: 'Engineer', summary: 'Improved wording' },
      ],
      education: [],
    } as never,
  }));
});

describe('focus when a proposal row clears', () => {
  it('lands on the next row rather than the document body', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { summary: 'Improved wording', position: 'Staff Engineer' } });
    render(<Harness />);

    const [firstAccept] = screen.getAllByRole('button', { name: 'Use the proposal' });
    await pressWithKeyboard(user, firstAccept);

    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Use the proposal' }));
  });

  /** The pressed side is kept, so pressing Enter again repeats the decision the
   *  user has already expressed rather than offering them the opposite one. */
  it('offers the same button it took away', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { summary: 'Improved wording', position: 'Staff Engineer' } });
    render(<Harness />);

    const [firstDecline] = screen.getAllByRole('button', { name: 'Keep mine' });
    await pressWithKeyboard(user, firstDecline);

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep mine' }));
  });

  it('lands on Next section when the panel empties and other sections still have work', async () => {
    const user = userEvent.setup();
    seed({
      [TARGET]: { summary: 'Improved wording' },
      'item:education:v9': { summary: 'Improved wording' },
    });
    render(<Harness />);

    await pressWithKeyboard(user, screen.getByRole('button', { name: 'Use the proposal' }));

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next section' }));
  });

  it('lands on the section heading when nothing is left to review anywhere', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { summary: 'Improved wording' } });
    render(<Harness />);

    await pressWithKeyboard(user, screen.getByRole('button', { name: 'Keep mine' }));

    expect(screen.queryByRole('button', { name: 'Next section' })).toBeNull();
    expect(document.activeElement).toBe(heading());
  });

  /** The header's bulk buttons empty the panel in one press, from a control
   *  that is not in any row. */
  it('hands off from the header’s accept-all too', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { summary: 'Improved wording', position: 'Staff Engineer' } });
    render(<Harness />);

    await pressWithKeyboard(user, screen.getByRole('button', { name: 'Use all 2' }));

    expect(document.activeElement).toBe(heading());
  });

  it('hands off from a prose row', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { summary: ['Improved wording'] } });
    render(<Harness proseFields={['summary']} />);

    await pressWithKeyboard(user, screen.getByRole('button', { name: 'Use the proposal' }));

    expect(document.activeElement).toBe(heading());
  });

  /**
   * The panel's other focus behaviour was already correct and must stay that
   * way: the version toggle changes what is displayed without clearing a row,
   * so the pressed button survives and keeps focus.
   */
  it('leaves the version toggle holding its own focus', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { summary: ['Improved wording'] } });
    render(<Harness proseFields={['summary']} />);

    const mine = screen.getByRole('button', { name: 'Your wording' });
    await pressWithKeyboard(user, mine);

    expect(document.activeElement).toBe(mine);
  });
  /**
   * ⚠️ The one prose case above clears the only row, so it exercises the
   * heading fallback and never reaches the prose row's `data-diff-*` attributes.
   * This is the shipped configuration that needs them — `CoverLetterForm` mounts
   * `subject` beside a prose `paragraphs`.
   */
  it('offers the prose row when a plain row above it is cleared', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { subject: 'Improved subject', paragraphs: ['Improved wording'] } });
    render(<Harness proseFields={['paragraphs']} />);

    const [subjectAccept] = screen.getAllByRole('button', { name: 'Use the proposal' });
    await pressWithKeyboard(user, subjectAccept);

    const survivor = screen.getByRole('button', { name: 'Use the proposal' });
    expect(document.activeElement).toBe(survivor);
    // The version toggle is the prose row's own; a plain row has no such control.
    const row = survivor.closest('[data-diff-row]') as HTMLElement;
    expect(within(row).getByRole('button', { name: 'Your wording' })).toBeTruthy();
  });

  /**
   * ⚠️ A section-level run leaves one panel per entry, all of them on screen.
   * Next section deliberately starts its search AFTER the open section, so
   * without a rung for the sibling panel the entry directly below the one just
   * cleared is stepped over while fully visible.
   */
  it('offers the next entry’s panel before leaving the section', async () => {
    const user = userEvent.setup();
    seed({
      [TARGET]: { summary: 'Improved wording' },
      'item:work:v2': { summary: 'Improved wording' },
    });
    render(<Harness targets={[TARGET, 'item:work:v2']} />);

    const [first, second] = screen.getAllByRole('button', { name: 'Use the proposal' });
    await pressWithKeyboard(user, first);

    expect(document.activeElement).toBe(second);
  });

  /**
   * ⚠️ A focus bug, one keystroke past its own fix. Stepping to the last section with
   * work makes `next` null, which disables the button the user is standing on —
   * and a disabled control drops focus to `<body>`.
   */
  it('does not strand the user on Next section when it disables itself', async () => {
    const user = userEvent.setup();
    seed({
      [TARGET]: { summary: 'Improved wording' },
      'item:education:v9': { summary: 'Improved wording' },
    });
    render(<Harness />);

    await pressWithKeyboard(user, screen.getByRole('button', { name: 'Use the proposal' }));
    const reviewNext = screen.getByRole('button', { name: 'Next section' });
    expect(document.activeElement).toBe(reviewNext);

    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'Next section' })).toHaveProperty('disabled', true);
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(heading('Education'));
  });

  /**
   * ⚠️ Deliberate. A pointer user has no focus they can see, so moving it buys
   * them nothing and costs them a scroll to wherever it went — and this is the
   * defect's own framing: it is invisible to a mouse user. `detail === 0` is the
   * click a key produces, and the one a voice or switch tool synthesizes.
   */
  it('leaves a pointer user where they were', async () => {
    const user = userEvent.setup();
    seed({ [TARGET]: { summary: 'Improved wording', position: 'Staff Engineer' } });
    render(<Harness />);

    const [firstAccept] = screen.getAllByRole('button', { name: 'Use the proposal' });
    await user.click(firstAccept);

    expect(screen.getAllByRole('button', { name: 'Use the proposal' })).toHaveLength(1);
    expect(document.activeElement).toBe(document.body);
  });
});
