import { useResumeStore } from '@/store/resume/useResumeStore';
import {
  type CustomSection,
  type ResumeCoverLetter,
  createDefaultCoverLetter,
} from '@/types/resume';
import { getAISuggestionBreakdown } from '@/utils/ai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The two sections that are ONE object rather than a list of items — `basics`
 * and the cover letter — go through **one** apply path and one decline path.
 *
 * ⚠️ **This file exists because deleting a 36-line branch changed nothing.**
 * `applySectionSuggestion` had a `sectionKey === 'basics'` branch that was, line
 * for line, the object branch added beside it: same computed
 * `changedFields`, same `item:basics` target, same suggestion shape, same
 * replace-not-mutate write. The object branch was meant to end one fact living
 * in four places; the diff that half-fixed it made five. Removing the copy left the
 * whole suite green, which is the same "nothing exercises this" that shipped
 * So the invariant gets a test rather than a comment.
 *
 * `section:basics` reaches the object branch because its response shape is
 * `{ improvedFields }` with **no `items` array** (and no `_vId`
 * either), so the array branch above it never matches. That is the load-bearing
 * fact; if the backend ever gives basics an `items` wrapper, these tests are
 * what fails.
 */

const SOURCE_BASICS = {
  label: 'Payments Engineer',
  summary: 'Has worked on payments for a while.',
};

const REWRITTEN = {
  label: 'Senior Payments Engineer',
  summary: 'Builds and runs payment systems, with a focus on reconciliation.',
};

describe('an object-shaped section applies through one path', () => {
  beforeEach(() => {
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, basics: { ...state.resume.basics, ...SOURCE_BASICS } },
      ai: { ...state.ai, suggestions: {} },
    }));
  });

  /** The shape the backend actually returns for `section:basics`: no `items`, no `_vId`. */
  const applyBasics = (improvedFields: Record<string, unknown>) =>
    useResumeStore.getState().applyAISuggestion('section:basics', { improvedFields });

  it('writes the improved basics into the store', () => {
    applyBasics(REWRITTEN);

    const { basics } = useResumeStore.getState().resume;
    expect(basics.label).toBe(REWRITTEN.label);
    expect(basics.summary).toBe(REWRITTEN.summary);
  });

  it('records an item proposal carrying only the fields that moved', () => {
    applyBasics({ label: SOURCE_BASICS.label, summary: REWRITTEN.summary });

    const item = useResumeStore.getState().ai.suggestions['item:basics'];
    expect(Object.keys(item.improvedValue)).toEqual(['summary']);
    expect(item.originalValue.summary).toBe(SOURCE_BASICS.summary);
  });

  /**
   * ⚠️ Two keys, one proposal — the count the rail, the pending bar and the
   * section button all read. `item:basics` has no vId and so no trailing colon,
   * which is the spelling the dedup rule once missed.
   */
  it('shows one pending proposal, not one per key that records it', () => {
    applyBasics(REWRITTEN);

    const { suggestions } = useResumeStore.getState().ai;
    expect(Object.keys(suggestions).sort()).toEqual(['item:basics', 'section:basics']);
    expect(getAISuggestionBreakdown(suggestions, ['basics']).content).toBe(1);
  });

  it('puts the user’s own wording back when the proposal is declined', () => {
    applyBasics(REWRITTEN);
    useResumeStore.getState().declineAISuggestion('item:basics');

    const { basics } = useResumeStore.getState().resume;
    expect(basics.label).toBe(SOURCE_BASICS.label);
    expect(basics.summary).toBe(SOURCE_BASICS.summary);
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
  });

  it('restores only the field a per-field reject names', () => {
    applyBasics(REWRITTEN);
    useResumeStore.getState().declineAISuggestion('item:basics', 'label');

    const { basics } = useResumeStore.getState().resume;
    expect(basics.label).toBe(SOURCE_BASICS.label);
    expect(basics.summary).toBe(REWRITTEN.summary);
    expect(useResumeStore.getState().ai.suggestions['item:basics']).toBeTruthy();
  });

  /**
   * ⚠️ **"Keep mine" must not delete what the user typed after the run.**
   *
   * The proposal is applied on arrival and the live field stays editable beside
   * the panel, so a user can rewrite a paragraph the AI just rewrote. Before
   * this guard, declining then wrote `originalValue` straight over that edit —
   * reproduced end to end: the typing vanished from the store and from the
   * textarea, silently, from the button whose label promises to keep their work.
   *
   * A field the user has since edited no longer holds the proposal, so there is
   * nothing of the AI's left to reject. Drop the marker, leave the value.
   */
  it('leaves a field the user edited after the run alone', () => {
    applyBasics(REWRITTEN);
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, basics: { ...state.resume.basics, summary: 'MY OWN TYPING' } },
    }));

    useResumeStore.getState().declineAISuggestion('item:basics');

    // The edited field survives; the untouched one still restores.
    expect(useResumeStore.getState().resume.basics.summary).toBe('MY OWN TYPING');
    expect(useResumeStore.getState().resume.basics.label).toBe(SOURCE_BASICS.label);
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
  });

  it('leaves an edited field alone on a per-field reject too', () => {
    applyBasics(REWRITTEN);
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, basics: { ...state.resume.basics, summary: 'MY OWN TYPING' } },
    }));

    useResumeStore.getState().declineAISuggestion('item:basics', 'summary');

    expect(useResumeStore.getState().resume.basics.summary).toBe('MY OWN TYPING');
  });

  /** A proposal is answered by accept and decline only; the preview toggle was retired. */
  it('records a proposal with no per-field toggle state', () => {
    applyBasics(REWRITTEN);

    expect(Object.keys(useResumeStore.getState().ai.suggestions['item:basics']).sort()).toEqual([
      'improvedValue',
      'originalValue',
      'timestamp',
    ]);
    expect(useResumeStore.getState()).not.toHaveProperty('toggleAISuggestion');
  });

  /**
   * ⚠️ The immer hazard, pinned where it actually lives — and an earlier version
   * of this case pinned the wrong place. The `item:` proposal copies each
   * changed field's VALUE out of the draft, so nothing there can alias; that
   * assertion passed whether the apply path replaced the section or mutated it.
   *
   * The `section:` proposal is the exposed one: `applySectionSuggestion` records
   * `originalValue: section`, which IS the draft. Writing through it with
   * `Object.assign` overwrites the original the restore path reads back, so the
   * decline silently returns the AI's wording as if it were the user's.
   */
  it('keeps the section proposal’s original intact, so declining it restores', () => {
    applyBasics(REWRITTEN);
    // ⚠️ Precondition. Without it every assertion below is satisfied by an apply
    // that wrote nothing at all — the case would pass while the feature was gone.
    expect(useResumeStore.getState().resume.basics.summary).toBe(REWRITTEN.summary);

    useResumeStore.getState().declineAISuggestion('section:basics');

    const { basics } = useResumeStore.getState().resume;
    expect(basics.label).toBe(SOURCE_BASICS.label);
    expect(basics.summary).toBe(SOURCE_BASICS.summary);
  });
});

/**
 * The same object section through the **whole-CV** path.
 *
 * `applyCvSuggestion` skipped any section that was not `basics` and not an array,
 * with a bare `return` inside a `forEach` — so the section was dropped, the run
 * reported success, every other section applied, and nothing logged or threw. It
 * was latent only because every section in `SECTION_COMPOSITION` is a list today;
 * the cover letter is the first that is not.
 *
 * ⚠️ **What is asserted is the AGREEMENT, not the write.** A cv path that lands
 * the letter by its own private rules is the four-criteria problem over again,
 * one copy larger. So the same proposal is driven through both paths and
 * the results are compared.
 *
 * ⚠️ **The payload here is hand-written, and it has to be.** `coverLetterImprove`
 * derives its response from the real schema precisely so a fixture cannot drift
 * from the contract — but the letter is not in `WHOLE_CV_SECTIONS`
 * (`definitions.js`), so no real cv response can
 * carry a letter today. That exclusion is the whole reason this defect was
 * latent. What is pinned here is the apply path's contract; binding it to the
 * wire would need the exclusion lifted, which has not been done.
 */
const SOURCE_LETTER: ResumeCoverLetter = {
  ...createDefaultCoverLetter(),
  enabled: true,
  subject: 'Application for the payments role',
  paragraphs: ['Dear Hiring Team,', 'I have worked on payment systems.', 'Kind regards, Alex'],
};

const REWRITTEN_LETTER = {
  subject: 'Application: Senior Payments Engineer',
  paragraphs: ['Dear Hiring Team,', 'I have run reconciliation at scale.', 'Kind regards, Alex'],
};

const seedLetter = () =>
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: structuredClone(SOURCE_LETTER),
      work: [
        { ...(state.resume.work[0] || {}), _vId: 'w1', name: 'Northwind', position: 'Engineer' },
      ] as typeof state.resume.work,
    },
    ai: { ...state.ai, suggestions: {} },
  }));

describe('a whole-CV run carries an object-shaped section too', () => {
  beforeEach(seedLetter);

  it('writes the improved letter into the store', () => {
    useResumeStore
      .getState()
      .applyAISuggestion('cv', { coverLetter: { improvedFields: REWRITTEN_LETTER } });

    const { coverLetter } = useResumeStore.getState().resume;
    expect(coverLetter.subject).toBe(REWRITTEN_LETTER.subject);
    // Deep equality, not a predicate over the entries: `every()` is satisfied by
    // an empty array, so a branch that dropped the paragraphs would ship green.
    expect(coverLetter.paragraphs).toEqual(REWRITTEN_LETTER.paragraphs);
  });

  /**
   * The acceptance criterion, stated as a comparison rather than as a
   * second set of expectations that could drift from the first.
   */
  it('lands exactly what the section path lands, store and proposal alike', () => {
    useResumeStore
      .getState()
      .applyAISuggestion('cv', { coverLetter: { improvedFields: REWRITTEN_LETTER } });
    const viaCv = {
      letter: structuredClone(useResumeStore.getState().resume.coverLetter),
      proposal: structuredClone(useResumeStore.getState().ai.suggestions['item:coverLetter']),
    };

    seedLetter();
    useResumeStore
      .getState()
      .applyAISuggestion('section:coverLetter', { improvedFields: REWRITTEN_LETTER });
    const viaSection = {
      letter: structuredClone(useResumeStore.getState().resume.coverLetter),
      proposal: structuredClone(useResumeStore.getState().ai.suggestions['item:coverLetter']),
    };

    // Non-vacuity: both paths must have produced a proposal at all, or the
    // comparison below is two undefineds agreeing.
    expect(viaCv.proposal).toBeTruthy();
    expect(Object.keys(viaCv.proposal.improvedValue).sort()).toEqual(['paragraphs', 'subject']);
    expect({ ...viaCv, proposal: { ...viaCv.proposal, timestamp: 0 } }).toEqual({
      ...viaSection,
      proposal: { ...viaSection.proposal, timestamp: 0 },
    });
  });

  it('records only the fields that moved, as the section path does', () => {
    useResumeStore.getState().applyAISuggestion('cv', {
      coverLetter: { improvedFields: { ...REWRITTEN_LETTER, subject: SOURCE_LETTER.subject } },
    });

    const item = useResumeStore.getState().ai.suggestions['item:coverLetter'];
    expect(Object.keys(item.improvedValue)).toEqual(['paragraphs']);
    expect(item.originalValue.paragraphs).toEqual(SOURCE_LETTER.paragraphs);
  });

  /** One rewrite, one pending proposal — the count the rail shows. */
  it('shows one pending proposal for the letter, not one per key', () => {
    useResumeStore
      .getState()
      .applyAISuggestion('cv', { coverLetter: { improvedFields: REWRITTEN_LETTER } });

    expect(
      getAISuggestionBreakdown(useResumeStore.getState().ai.suggestions, ['coverLetter']).content,
    ).toBe(1);
  });

  it('still applies the array sections beside it', () => {
    useResumeStore.getState().applyAISuggestion('cv', {
      coverLetter: { improvedFields: REWRITTEN_LETTER },
      work: [{ _vId: 'w1', improvedFields: { position: 'Staff Engineer' } }],
    });

    expect(useResumeStore.getState().resume.work[0].position).toBe('Staff Engineer');
    expect(useResumeStore.getState().resume.coverLetter.subject).toBe(REWRITTEN_LETTER.subject);
  });
});

describe('a section the whole-CV path cannot write says so', () => {
  // ⚠️ Spied per test, not once for the describe. A single spy restored in
  // `afterEach` is live for the first case only, and the second then asserts
  // against a mock nothing writes to — which reported zero calls while the log
  // it was looking for went to the real console.
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    seedLetter();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  /**
   * ⚠️ The skip must be LOUD. A section the composition names but the
   * apply path cannot handle is a programming error; silence is what let the
   * original defect sit unnoticed behind a successful run.
   */
  it('logs when an array section arrives as something other than an array', () => {
    useResumeStore
      .getState()
      .applyAISuggestion('cv', { work: { improvedFields: { position: 'Staff Engineer' } } });

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0][0])).toContain('work');
  });

  it('logs when an object section arrives without improvedFields', () => {
    useResumeStore.getState().applyAISuggestion('cv', { coverLetter: { subject: 'Bare' } });

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(useResumeStore.getState().resume.coverLetter.subject).toBe(SOURCE_LETTER.subject);
  });

  /**
   * ⚠️ `meta` is object-shaped and always present, so a shape test alone would
   * take it for an improvable section — and the reconcile loop at the foot of
   * `applyCvSuggestion` skips `meta`, so the proposal would be recorded against a
   * section the run never writes. Unreachable through a real job (`meta` is
   * stripped before the request and absent from the cv schema), which is why the
   * bound is asserted rather than left to the shape.
   */
  it('does not take meta for an improvable object section', () => {
    const before = structuredClone(useResumeStore.getState().resume.meta);

    useResumeStore
      .getState()
      .applyAISuggestion('cv', { meta: { improvedFields: { version: '9.9.9' } } });

    expect(useResumeStore.getState().ai.suggestions['item:meta']).toBeUndefined();
    expect(useResumeStore.getState().resume.meta).toEqual(before);
  });
});

/**
 * A vId-less `item:` key is a proposal key, never a run target: no surface
 * starts an `item:` run on an object section, and the backend's `item` mode
 * would answer `{ _vId, improvedFields }` if one did.
 */
describe('an item run on an object section writes nothing', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    seedLetter();
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, basics: { ...state.resume.basics, ...SOURCE_BASICS } },
    }));
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it.each([
    ['raw fields', REWRITTEN],
    ['the item shape the backend sends', { _vId: 'basics', improvedFields: REWRITTEN }],
  ])('ignores item:basics answered with %s', (_label, payload) => {
    useResumeStore.getState().applyAISuggestion('item:basics', payload);

    const { basics } = useResumeStore.getState().resume;
    expect(basics.label).toBe(SOURCE_BASICS.label);
    expect(basics.summary).toBe(SOURCE_BASICS.summary);
    expect(basics).not.toHaveProperty('improvedFields');
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('ignores item:coverLetter', () => {
    useResumeStore.getState().applyAISuggestion('item:coverLetter', REWRITTEN_LETTER);

    expect(useResumeStore.getState().resume.coverLetter.subject).toBe(SOURCE_LETTER.subject);
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('ignores item:custom:<uuid>, the heading key only a whole-CV run writes', () => {
    const id = '11111111-2222-4333-8444-555555555555';
    const section: CustomSection = { id, title: 'Hackathons', visible: true, items: [] };
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, customSections: [section] },
    }));

    useResumeStore.getState().applyAISuggestion(`item:custom:${id}`, { title: 'Renamed' });

    expect(useResumeStore.getState().resume.customSections[0]).toEqual(section);
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining(`item:custom:${id}`));
  });
});
