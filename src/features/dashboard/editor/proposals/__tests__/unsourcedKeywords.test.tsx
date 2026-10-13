// @vitest-environment jsdom
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { en } from '@/locales/en/index';
import { occursIn } from '@/store/resume/slices/ai/suggestions/unsourcedKeywords';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A skill keyword a tailoring run proposes that the CV never mentions is
 * MARKED in the review panel, not dropped: "JS" → "JavaScript" is a truthful
 * rewording when the CV says JavaScript elsewhere, and the user decides about
 * the rest. Driven through the real store apply and the real panel.
 */

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

const LABELS = { keywords: 'Keywords' };
const TARGET = 'item:skills:s1';

const PROPOSAL = {
  items: [{ _vId: 's1', improvedFields: { keywords: ['JavaScript', 'React', 'Kubernetes'] } }],
};

beforeEach(() => {
  useResumeStore.setState((state) => ({
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
    resume: {
      ...state.resume,
      work: [
        {
          _vId: 'w1',
          name: 'Acme',
          position: 'Engineer',
          highlights: ['Rebuilt the checkout in javascript and React.'],
        },
      ],
      skills: [{ _vId: 's1', name: 'Frontend', level: 0, keywords: ['JS', 'React'] }],
    } as unknown as ResumeData,
  }));
});

/** The innermost list item carrying `keyword`: one mark, not the field row around it. */
const rowFor = (keyword: string) =>
  screen
    .getAllByRole('listitem')
    .filter((item) => item.textContent?.includes(keyword))
    .at(-1);

const cautionsShown = () => screen.queryAllByText(en.ai.diff_mark_unsourced);

describe('a proposed skill keyword the CV never mentions', () => {
  it('is marked, and a rewording the CV mentions elsewhere is not', () => {
    useResumeStore
      .getState()
      .applyAISuggestion('section:skills', PROPOSAL, { markUnsourced: true });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    const invented = rowFor('Kubernetes');
    expect(invented && within(invented).queryByText(en.ai.diff_mark_unsourced)).toBeTruthy();
    const reworded = rowFor('JavaScript');
    expect(reworded && within(reworded).queryByText(en.ai.diff_mark_unsourced)).toBeNull();
    expect(cautionsShown()).toHaveLength(1);
  });

  it('carries the caution in the accessibility tree, as text', () => {
    useResumeStore
      .getState()
      .applyAISuggestion('section:skills', PROPOSAL, { markUnsourced: true });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    const [caution] = cautionsShown();
    expect(caution.closest('[aria-hidden="true"]')).toBeNull();
    expect(caution.classList.contains('sr-only')).toBe(false);
    expect(rowFor('Kubernetes')?.textContent).toContain(
      `${en.ai.diff_mark_added}Kubernetes${en.ai.diff_mark_unsourced}`,
    );
  });

  it('reads the CV as it was before the run, not the proposal just applied', () => {
    useResumeStore.getState().applyAISuggestion(
      'cv',
      {
        work: [{ _vId: 'w1', improvedFields: { highlights: ['Ran Kubernetes clusters.'] } }],
        skills: PROPOSAL.items,
      },
      { markUnsourced: true },
    );
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    expect(cautionsShown()).toHaveLength(1);
  });

  /** The letter and its addressee can be copied from the ad, so they vouch for nothing. */
  it('is marked when only the cover letter or its recipient mentions it', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: {
          ...state.resume.coverLetter,
          paragraphs: ['I run Kubernetes in production.'],
          recipient: { name: '', company: 'Kubernetes Inc.', address: '' },
        },
      },
    }));
    useResumeStore
      .getState()
      .applyAISuggestion('section:skills', PROPOSAL, { markUnsourced: true });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    const invented = rowFor('Kubernetes');
    expect(invented && within(invented).queryByText(en.ai.diff_mark_unsourced)).toBeTruthy();
  });

  it('is not marked on a run that does not ask for it', () => {
    useResumeStore.getState().applyAISuggestion('section:skills', PROPOSAL);
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    expect(rowFor('Kubernetes')).toBeTruthy();
    expect(cautionsShown()).toHaveLength(0);
  });
});

describe('occursIn', () => {
  it.each([
    ['Wrote services in Go.', 'go', true],
    ['Works at Google.', 'Go', false],
    ['Built with Django.', 'Go', false],
    ['Modern C++ and Rust.', 'C++', true],
    ['Shipped on Next.js 14.', 'next.js', true],
    ['Postgres administration.', 'PostgreSQL', false],
  ])('%s / %s → %s', (text, word, expected) => {
    expect(occursIn(text, word)).toBe(expected);
  });
});
