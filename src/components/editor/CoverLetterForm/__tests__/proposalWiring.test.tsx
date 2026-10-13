// @vitest-environment jsdom
import { CoverLetterForm } from '@/components/editor/CoverLetterForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false, session: null }),
}));

/**
 * The cover letter's proposal panel, rendered through the **real form** rather
 * than by handing `EntryDiffPanel` its props directly.
 *
 * ⚠️ **A guard that pins a callee does not bind the call site, and this feature
 * proved it.** `proseDiffRow.test.tsx` covers `ProseDiffRow` thoroughly — 15
 * cases — but every one of them mounts `EntryDiffPanel` itself and passes
 * `proseFields` by hand. Deleting that prop from `CoverLetterForm` left **228
 * tests green** while the whole feature reverted: `proseFields` defaults to
 * `[]`, so the letter falls back to the entry-by-entry bullet diff that measured
 * 2,869px.
 *
 * That is the same shape as an earlier defect one level up — there the backend half was
 * missing and a key-presence assertion signed it off; here the props are
 * missing and a test that supplies them itself signs it off. So these two cases
 * exist to fail when the WIRING goes, not when the component does.
 *
 * ⚠️ The other two `EntryDiffPanel` mounts (`ArrayFormItem`, `BasicsForm`) pass
 * neither prop, so this is the only call site where they are load-bearing.
 */

const MINE = ['Dear Hiring Team,', 'x'.repeat(400), 'Kind regards'];
const PROPOSAL = ['Dear Hiring Team,', 'y'.repeat(250), 'Kind regards'];

const seed = (enabled: boolean) => {
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...createDefaultCoverLetter(), enabled, paragraphs: PROPOSAL },
    },
    ai: {
      ...state.ai,
      suggestions: {
        'item:coverLetter': {
          originalValue: { paragraphs: MINE },
          improvedValue: { paragraphs: PROPOSAL },
          timestamp: 1,
        },
      },
    },
  }));
};

describe('the cover letter form wires its proposal panel', () => {
  beforeEach(() => seed(true));

  /**
   * `proseFields` arriving is what turns the body into a two-version toggle.
   * Without it the panel renders the bullet diff, which has no such control.
   */
  it('asks for the body to be compared by toggling, not by marking entries', () => {
    render(<CoverLetterForm />);

    expect(screen.getByRole('button', { name: 'AI proposal' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Your wording' })).toBeTruthy();
  });

  /**
   * The legend is the other thing `proseFields` brings: without it the row is an
   * `EntryDiffRow`, which has neither a toggle nor a key for its marks.
   */
  it('explains what the marks beside changed paragraphs mean', () => {
    const { container } = render(<CoverLetterForm />);

    // The swatch sits inline in the summary, which is the sentence that names
    // what it marks — a sighted reader had no key to the rules at all before it.
    expect(container.querySelectorAll('[data-mark-key]')).toHaveLength(1);
    expect(screen.getByText(/paragraphs rewritten/)).toBeTruthy();
  });
});
