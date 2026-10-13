// @vitest-environment jsdom
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

const TARGET = 'item:work:v1';

const LABELS = {
  summary: 'Summary',
  highlights: 'Highlights',
};

function seed(
  improvedValue: Record<string, unknown>,
  originalValue: Record<string, unknown>,
  target = TARGET,
) {
  useResumeStore.setState((state) => ({
    ai: {
      ...state.ai,
      reorgSuggestion: null,
      suggestions: {
        [target]: {
          originalValue,
          improvedValue,
          timestamp: 1,
        },
      },
    },
  }));
}

function seedWorkEntry() {
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      work: [
        {
          _vId: 'v1',
          name: 'Acme',
          position: 'Engineer',
          summary: 'Improved wording',
        },
      ] as never,
    },
  }));
}

beforeEach(() => {
  useResumeStore.setState((state) => ({
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
  }));
  seedWorkEntry();
});

describe('the entry diff panel', () => {
  // Only its empty live region: it has to be in the tree before a decision
  // clears the last row, or that decision is never announced.
  it('renders nothing but an empty status when the entry has no proposal', () => {
    const { container } = render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);
    expect(container.children).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('renders nothing for an entry AI cannot touch', () => {
    seed({ summary: 'new' }, { summary: 'old' });
    const { container } = render(<EntryDiffPanel target={undefined} fieldLabels={LABELS} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows both wordings, not just the one that is live', () => {
    seed({ summary: 'Improved wording' }, { summary: 'Original wording' });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    expect(screen.getByText('Original wording')).toBeTruthy();
    expect(screen.getByText('Improved wording')).toBeTruthy();
    expect(screen.getByText('Summary')).toBeTruthy();
  });

  it('says the field was empty rather than showing a blank box', () => {
    seed({ summary: 'Improved wording' }, { summary: '' });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);
    expect(screen.getByText('Empty')).toBeTruthy();
  });

  it('drops the pending marker when the proposal is used', () => {
    seed({ summary: 'Improved wording' }, { summary: 'Original wording' });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Use the proposal' }));

    expect(useResumeStore.getState().ai.suggestions[TARGET]).toBeUndefined();
    expect(useResumeStore.getState().resume.work[0].summary).toBe('Improved wording');
  });

  /**
   * ⚠️ The asymmetry that matters. The improved value is applied the moment the
   * run lands, so accepting only deletes a marker — declining is the branch that
   * writes, and it has to put the user's wording back.
   */
  it('restores the original wording when the user keeps theirs', () => {
    seed({ summary: 'Improved wording' }, { summary: 'Original wording' });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Keep mine' }));

    expect(useResumeStore.getState().resume.work[0].summary).toBe('Original wording');
    expect(useResumeStore.getState().ai.suggestions[TARGET]).toBeUndefined();
  });

  it('counts the changed fields in its heading', () => {
    seed(
      { summary: 'Improved wording', position: 'Staff Engineer' },
      { summary: 'Original wording', position: 'Engineer' },
    );
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);
    expect(screen.getByText('2 fields the AI rewrote')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Use all 2' })).toBeTruthy();
    // ⚠️ Named, not just present. Both header buttons read "Keep mine" until
    // Three controls with that name and three different blast radii,
    // which a screen-reader user browsing by button list cannot tell apart.
    // `i18n:check` sees the key is referenced; it cannot see it is the wrong one.
    expect(screen.getByRole('button', { name: 'Keep all 2' })).toBeTruthy();
  });

  /**
   * ⚠️ **The header's write path, activated.** The two wiring cases above seed a
   * SINGLE field, so `rows.length > 1` is false and this cluster never renders —
   * leaving "Keep all N" asserted by name only. Swapping `declineAll` for
   * `acceptAll` kept the whole suite green while the button did the opposite of
   * its label: keeping the AI's rewrite of every field and discarding the user's.
   *
   * That is verbatim the defect this change set fixed one component down, in
   * `ProseDiffRow`. It was still live one level up.
   *
   * ⚠️ Both cases put the IMPROVED values in the résumé first, because that is
   * the real state: the run applies its proposal on arrival, which is why "Use
   * the proposal" only drops the marker and "Keep mine" is the button that
   * writes. Seeded the other way round, "Keep all" passes without doing anything.
   */
  const seedApplied = () => {
    seed(
      { summary: 'Improved wording', position: 'Staff Engineer' },
      { summary: 'Original wording', position: 'Engineer' },
    );
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        work: [
          { ...state.resume.work[0], summary: 'Improved wording', position: 'Staff Engineer' },
        ],
      },
    }));
  };

  it('restores every field when the header’s Keep all is pressed', () => {
    seedApplied();
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);
    expect(useResumeStore.getState().resume.work[0].summary).toBe('Improved wording');

    fireEvent.click(screen.getByRole('button', { name: 'Keep all 2' }));

    const entry = useResumeStore.getState().resume.work[0];
    expect(entry.summary).toBe('Original wording');
    expect(entry.position).toBe('Engineer');
    expect(useResumeStore.getState().ai.suggestions[TARGET]).toBeUndefined();
  });

  it('leaves the AI’s wording in place when the header’s Use all is pressed', () => {
    seedApplied();
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Use all 2' }));

    const entry = useResumeStore.getState().resume.work[0];
    expect(entry.summary).toBe('Improved wording');
    expect(entry.position).toBe('Staff Engineer');
    expect(useResumeStore.getState().ai.suggestions[TARGET]).toBeUndefined();
  });

  /**
   * With one changed field the header's accept-all would be the row's own
   * button repeated verbatim, one of which secretly means "and the rest".
   */
  it('drops the entry-wide buttons when there is only one field to decide', () => {
    seed({ summary: 'Improved wording' }, { summary: 'Original wording' });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    expect(screen.getAllByRole('button', { name: 'Use the proposal' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Keep mine' })).toHaveLength(1);
  });

  /**
   * `+`, `−` and `·` are punctuation. A screen reader either skips them or reads
   * them as symbols, so the mark has to carry a word of its own.
   */
  it('gives the list diff marks accessible names', () => {
    seed({ highlights: ['kept', 'brand new'] }, { highlights: ['kept', 'dropped'] });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    expect(screen.getByText('Added')).toBeTruthy();
    expect(screen.getByText('Removed')).toBeTruthy();
    expect(screen.getByText('Unchanged')).toBeTruthy();
    expect(screen.getByText('brand new')).toBeTruthy();
    expect(screen.getByText('dropped')).toBeTruthy();
  });

  /**
   * ⚠️ One clause, not two. "The preview already shows the proposal." led this
   * footer until a `ui-designer` pass struck it: it explained an implementation
   * fact — that the run pre-applies its proposal — and it was measurably false
   * the moment anyone edited the live field. What survives states an
   * irreversible consequence, and is the only warning about the edit-then-
   * decline path `declineAISuggestion` now guards. The key is gone since it was left
   * unreferenced, so this matches the SENTENCE and not the key — and a `t()` for
   * the deleted key reds `i18n:check` ("references missing") before it reaches a
   * test, measured on this branch.
   */
  it('warns what the two buttons cost, without explaining the mechanism', () => {
    seed({ summary: 'Improved wording' }, { summary: 'Original wording' });
    render(<EntryDiffPanel target={TARGET} fieldLabels={LABELS} />);

    expect(screen.getByText(/Keeping yours restores your original wording/)).toBeTruthy();
    expect(screen.queryByText(/The preview already shows the proposal/)).toBeNull();
  });
});
