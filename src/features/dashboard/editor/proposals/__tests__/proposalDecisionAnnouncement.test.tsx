// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { Section } from '@/components/ui/Section';
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { PendingProposalsBar } from '@/features/dashboard/editor/proposals/PendingProposalsBar';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type AITargetKey } from '@/utils/aiTarget';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * What a screen reader hears after a proposal is decided: the outcome,
 * then what is left CV-wide. Mounted with the pending bar and a page Section,
 * as the editor composes them, because the last decision unmounts the panel's
 * section and the region has to outlive it.
 */

const FIRST = 'item:work:v1';
const SECOND = 'item:work:v2';
const LABELS = { summary: 'Summary', position: 'Position' };

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

const Harness = ({ targets = [FIRST] }: { targets?: readonly AITargetKey[] }) => (
  <MemoryRouter initialEntries={['/?section=work']}>
    <PendingProposalsBar />
    <Section title="Work experience" variant="page">
      {targets.map((target) => (
        <EntryDiffPanel key={target} target={target} fieldLabels={LABELS} />
      ))}
    </Section>
  </MemoryRouter>
);

/** Every non-empty live status in the tree, so a stray second region shows up too. */
const announced = () =>
  screen
    .queryAllByRole('status')
    .map((node) => node.textContent ?? '')
    .filter(Boolean);

beforeEach(() => {
  useResumeStore.setState((state) => ({
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
    resume: {
      ...state.resume,
      work: [
        { _vId: 'v1', name: 'Acme', position: 'Staff Engineer', summary: 'Improved wording' },
        { _vId: 'v2', name: 'Beta', position: 'Engineer', summary: 'Improved wording' },
      ],
      education: [],
    } as never,
  }));
});

describe('announcing a proposal decision', () => {
  it('names the field and what is left after using one proposal', async () => {
    const user = userEvent.setup();
    seed({ [FIRST]: { summary: 'Improved wording', position: 'Staff Engineer' } });
    render(<Harness />);

    const [summaryAccept] = screen.getAllByRole('button', { name: 'Use the proposal' });
    await user.click(summaryAccept);

    expect(announced()).toEqual(['Used the proposal for Summary. 1 AI proposal to review']);
  });

  it('names the field and what is left after keeping the user’s wording', async () => {
    const user = userEvent.setup();
    seed({ [FIRST]: { summary: 'Improved wording', position: 'Staff Engineer' } });
    render(<Harness />);

    const [summaryDecline] = screen.getAllByRole('button', { name: 'Keep mine' });
    await user.click(summaryDecline);

    expect(announced()).toEqual(['Kept your wording for Summary. 1 AI proposal to review']);
  });

  it('still announces when the decision clears the panel it was made in', async () => {
    const user = userEvent.setup();
    seed({ [FIRST]: { summary: 'Improved wording' } });
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Use the proposal' }));

    expect(screen.queryByRole('button', { name: 'Use the proposal' })).toBeNull();
    expect(announced()).toEqual(['Used the proposal for Summary. No AI proposals left to review.']);
  });

  it('announces the bulk outcome for Use all', async () => {
    const user = userEvent.setup();
    seed({
      [FIRST]: { summary: 'Improved wording', position: 'Staff Engineer' },
      [SECOND]: { summary: 'Improved wording' },
    });
    render(<Harness targets={[FIRST, SECOND]} />);

    await user.click(screen.getByRole('button', { name: 'Use all 2' }));

    expect(announced()).toEqual(['Used every proposal for this entry. 1 AI proposal to review']);
  });

  it('announces the bulk outcome for Keep all', async () => {
    const user = userEvent.setup();
    seed({ [FIRST]: { summary: 'Improved wording', position: 'Staff Engineer' } });
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Keep all 2' }));

    expect(announced()).toEqual([
      'Kept your wording in every field of this entry. No AI proposals left to review.',
    ]);
  });

  it('says nothing when a run lands, and clears a stale message', async () => {
    const user = userEvent.setup();
    seed({ [FIRST]: { summary: 'Improved wording' } });
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Use the proposal' }));
    expect(announced()).toHaveLength(1);

    act(() => seed({ [FIRST]: { summary: 'Improved wording', position: 'Staff Engineer' } }));

    expect(announced()).toEqual([]);
  });
});
