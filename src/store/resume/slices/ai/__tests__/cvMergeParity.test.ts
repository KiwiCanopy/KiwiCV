import { areValuesEqual } from '@/store/resume/slices/ai/utils';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { spawnSync } from 'node:child_process';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * A whole-CV response is merged twice: by `mergeImprovedIntoCv` on the server,
 * so the cover-letter call drafts from the wording the user will see, and
 * by `applyCvSuggestion` in the store. If the two drift, the letter quotes a CV
 * that never existed on screen and nothing fails.
 *
 * Compared by running both over one CV and one response, as
 * `aiSanitizerParity.test.ts` does; the backend is spawned because it is ESM
 * outside the app's tsconfig. The carve-outs are on ops/AI_LOGIC.md § The
 * second call.
 */

type Fields = Record<string, unknown>;

/** List entries are partial on purpose; `basics` is the store's own, so it stays a full object. */
const SOURCE = {
  basics: {
    ...useResumeStore.getState().resume.basics,
    name: 'Alex Rivera',
    label: 'Payments Engineer',
    summary: 'Builds payment systems.',
  },
  work: [
    { _vId: 'w1', name: 'Northwind', position: 'Engineer', summary: 'Ran reconciliation.' },
    { _vId: 'w2', name: 'Contoso', position: 'Developer', highlights: ['Shipped SEPA.'] },
  ],
  volunteer: [
    { _vId: 'v1', organization: 'Code Club', summary: 'Taught kids.' },
    { _vId: 'v2', organization: 'Food Bank', summary: 'Sorted parcels.' },
  ],
  education: [{ _vId: 'e1', institution: 'TU Berlin', area: 'Computer Science' }],
  projects: [{ _vId: 'p1', name: 'Ledger', description: 'Double-entry ledger.' }],
  skills: [
    { _vId: 's1', name: 'Payments', keywords: ['SEPA'] },
    { _vId: 's2', name: 'Go', keywords: [] },
  ],
  awards: [],
};

/** Call 1's whole-CV response: every arm of the item-section walk, all real changes. */
const RESPONSE = {
  basics: { improvedFields: { label: 'Senior Payments Engineer' } },
  // Out of order: matched by `_vId`, never by position.
  work: [
    { _vId: 'w2', improvedFields: { highlights: ['Shipped SEPA Instant to 4M users.'] } },
    { _vId: 'w1', improvedFields: { position: 'Lead Engineer' } },
  ],
  // No `_vId`s: the positional fallback.
  volunteer: [
    { improvedFields: { summary: 'Taught programming to 30 kids a week.' } },
    { improvedFields: { summary: 'Sorted 200 parcels a shift.' } },
  ],
  // An id that matches nothing, at index 0: neither side applies it by position.
  projects: [{ _vId: 'unknown', improvedFields: { description: 'A double-entry ledger in Go.' } }],
  // Echoes the source byte for byte: no change on either side.
  education: [{ _vId: 'e1', improvedFields: { area: 'Computer Science' } }],
  skills: [
    { _vId: 's1', improvedFields: { keywords: ['SEPA', 'SWIFT'] } },
    { _vId: 's2', improvedFields: { keywords: ['Concurrency'] } },
  ],
  awards: [{ _vId: 'a1', improvedFields: { title: 'Invented' } }],
};

/** The reorg toggle's whole-CV response for skills: flat items carrying `_sourceVIds`. */
const REORG_SKILLS = [
  { name: 'Payments & Go', keywords: ['SEPA', 'Concurrency'], _sourceVIds: ['s1', 's2'] },
  { name: 'Payments', keywords: ['SEPA', 'SWIFT'], _sourceVIds: ['s1'] },
];

/** Answers for `s2` only, so `value[0]` names a sibling of the unmatched `s1`. */
const SKIP_RESPONSE = {
  skills: [{ _vId: 's2', improvedFields: { keywords: ['Concurrency'] } }],
};

/** Whitespace and nullish echoes: equal under `areValuesEqual`, not byte for byte. */
const ECHO_RESPONSE = {
  work: [{ _vId: 'w1', improvedFields: { summary: 'Ran reconciliation.  ', endDate: null } }],
};

/**
 * One matching rule for the grade and both merges: id-matched, id-less by
 * position, and the two mixed in one section. `ID_LESS_ECHO` is the no-op half.
 */
const MATCHING_CASES = {
  idMatched: {
    work: [{ _vId: 'w2', improvedFields: { position: 'Staff Developer' } }],
  },
  idLess: {
    volunteer: [
      { improvedFields: { summary: 'Taught Scratch weekly.' } },
      { improvedFields: { summary: 'Sorted parcels.' } },
    ],
  },
  mixed: {
    work: [
      { improvedFields: { summary: 'Reconciled ledgers daily.' } },
      { _vId: 'w2', improvedFields: { position: 'Senior Developer' } },
    ],
  },
  idLessEcho: {
    volunteer: [
      { improvedFields: { summary: 'Taught kids.' } },
      { improvedFields: { summary: 'Sorted parcels.' } },
    ],
  },
  /** Shorter than the source and id-less: it cannot say which entry it answers. */
  idLessShorter: {
    volunteer: [{ improvedFields: { summary: 'Taught Scratch weekly.' } }],
  },
  /** Longer, reordered, partly id-less: only the id-matched entry applies. */
  idLessLonger: {
    work: [
      { improvedFields: { summary: 'Reconciled ledgers daily.' } },
      { _vId: 'w2', improvedFields: { position: 'Senior Developer' } },
      { improvedFields: { summary: 'Invented a third job.' } },
    ],
  },
} as const;

type MatchingCase = keyof typeof MATCHING_CASES;

/** The same id-less entries, through a `section:` run. */
const SECTION_ID_LESS = MATCHING_CASES.idLess.volunteer;

interface BackendRun {
  merged: Record<string, unknown>;
  reorgMerged: Record<string, unknown>;
  echoMerged: Record<string, unknown>;
  skipMerged: Record<string, unknown>;
  letterComposition: Record<string, string[]>;
  matching: Record<MatchingCase, { merged: Record<string, unknown>; graded: boolean }>;
  sectionIdLessGraded: boolean;
}

const runBackend = (): BackendRun => {
  const lib = new URL('../../../../../../netlify/functions/lib/ai/', import.meta.url).href;
  // The fixtures travel in the environment: `JSON.stringify` does not escape a
  // backtick or `${`, so interpolating them into the source could break it.
  const script = `
    import { hasActualChanges, mergeImprovedIntoCv } from '${lib}utils.js';
    import { COVER_LETTER_COMPOSITION } from '${lib}definitions.js';
    const { source, response, reorgSkills, echo, skip, matching, sectionIdLess } =
      JSON.parse(process.env.MERGE_FIXTURE);
    const grade = (granularity, improved, id) =>
      hasActualChanges({ granularity, source: id ? source[id] : source, improved, allowReorg: false, id });
    process.stdout.write(JSON.stringify({
      merged: mergeImprovedIntoCv(source, response),
      reorgMerged: mergeImprovedIntoCv(source, { skills: reorgSkills }),
      echoMerged: mergeImprovedIntoCv(source, echo),
      skipMerged: mergeImprovedIntoCv(source, skip),
      letterComposition: COVER_LETTER_COMPOSITION,
      matching: Object.fromEntries(
        Object.entries(matching).map(([name, improved]) => [
          name,
          { merged: mergeImprovedIntoCv(source, improved), graded: grade('cv', improved) },
        ]),
      ),
      sectionIdLessGraded: grade('section', { items: sectionIdLess }, 'volunteer'),
    }));
  `;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: {
      ...process.env,
      MERGE_FIXTURE: JSON.stringify({
        source: SOURCE,
        response: RESPONSE,
        reorgSkills: REORG_SKILLS,
        echo: ECHO_RESPONSE,
        skip: SKIP_RESPONSE,
        matching: MATCHING_CASES,
        sectionIdLess: SECTION_ID_LESS,
      }),
    },
  });
  if (run.status !== 0) {
    throw new Error(`the backend merge could not be run:\n${run.stderr || run.stdout}`);
  }
  return JSON.parse(run.stdout) as BackendRun;
};

const loadSource = () =>
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, ...structuredClone(SOURCE) } as unknown as ResumeData,
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
  }));

const storeResume = () => useResumeStore.getState().resume as unknown as Record<string, unknown>;

/** The sections compared field for field: every list and object section the fixture holds. */
const COMPARED = Object.keys(SOURCE);

describe('the backend CV merge and the store agree', () => {
  const backend = runBackend();

  beforeEach(loadSource);

  it('produces the CV the store does, section for section', () => {
    useResumeStore.getState().applyAISuggestion('cv', RESPONSE, { skipSuggestions: true });
    const frontend = storeResume();

    for (const section of COMPARED) {
      expect({ section, value: backend.merged[section] }).toEqual({
        section,
        value: frontend[section],
      });
    }
  });

  /** Non-vacuity: two merges that both wrote nothing would agree. */
  it('changed every section the response really changed', () => {
    const merged = backend.merged as typeof SOURCE;
    expect(merged.basics.label).toBe('Senior Payments Engineer');
    expect(merged.work.map((item) => (item as Fields).position)).toEqual([
      'Lead Engineer',
      'Developer',
    ]);
    expect(merged.volunteer.map((item) => item.summary)).toEqual([
      'Taught programming to 30 kids a week.',
      'Sorted 200 parcels a shift.',
    ]);
    expect(merged.skills.map((item) => item.keywords)).toEqual([
      ['SEPA', 'SWIFT'],
      ['Concurrency'],
    ]);
  });

  /**
   * Custom sections are left out of the comparison because the letter never
   * reads them; this is what keeps that true. A section the letter reads and
   * this file does not compare is a drift nothing would catch.
   */
  it('compares every section the cover letter reads', () => {
    const letterSections = Object.keys(backend.letterComposition);
    expect(letterSections.length).toBeGreaterThan(0);
    expect(letterSections.filter((section) => !COMPARED.includes(section))).toEqual([]);
  });

  /**
   * ⚠️ Carve-out: the store writes only fields `areValuesEqual` calls changed and
   * keeps its own spelling of an echo; the backend writes what came back. They
   * agree under the comparator `areValuesEqualParity.test.ts` pins, not bytewise.
   */
  it('agrees on an echoed field under the shared comparator', () => {
    useResumeStore.getState().applyAISuggestion('cv', ECHO_RESPONSE, { skipSuggestions: true });
    const frontendItem = (storeResume().work as Fields[])[0];
    const backendItem = (backend.echoMerged.work as Fields[])[0];

    for (const field of ['summary', 'endDate']) {
      expect(areValuesEqual(backendItem[field], frontendItem[field])).toBe(true);
    }
  });

  /**
   * ⚠️ Carve-out: a reorg never reaches `applyCvSuggestion`. `useAIGeneration`
   * routes it to `applyReorgSuggestion`, which mints ids and drops `_sourceVIds`;
   * the backend keeps the response's items. Only the fields the letter reads
   * from skills have to agree, and this holds them to it.
   */
  it('agrees with the reorg path on every skills field the letter reads', () => {
    useResumeStore.getState().applyReorgSuggestion('skills', structuredClone(REORG_SKILLS));
    const frontendSkills = storeResume().skills as Fields[];
    const backendSkills = backend.reorgMerged.skills as Fields[];

    const letterFields = backend.letterComposition.skills;
    // A field the fixture lacks compares `undefined` to `undefined` and proves nothing.
    expect(letterFields.length).toBeGreaterThan(0);
    for (const item of REORG_SKILLS) {
      expect(letterFields.filter((field) => !(field in item))).toEqual([]);
    }

    const project = (items: Fields[]) =>
      items.map((item) => Object.fromEntries(letterFields.map((field) => [field, item[field]])));

    expect(backendSkills).toHaveLength(REORG_SKILLS.length);
    expect(project(backendSkills)).toEqual(project(frontendSkills));
  });

  it('agrees on a response that skips an entry', () => {
    useResumeStore.getState().applyAISuggestion('cv', SKIP_RESPONSE, { skipSuggestions: true });
    expect(backend.skipMerged.skills).toEqual(storeResume().skills);
  });

  /**
   * Position is a fallback only for a response entry with no `_vId`; one that
   * names a sibling, or nothing at all, never lands on the entry at its index.
   */
  it('backend: an entry the response skipped stays untouched', () => {
    expect((backend.skipMerged.skills as Fields[]).map((item) => item.keywords)).toEqual([
      ['SEPA'],
      ['Concurrency'],
    ]);
  });

  it('store: an entry the response skipped stays untouched', () => {
    useResumeStore.getState().applyAISuggestion('cv', SKIP_RESPONSE, { skipSuggestions: true });
    expect((storeResume().skills as Fields[]).map((item) => item.keywords)).toEqual([
      ['SEPA'],
      ['Concurrency'],
    ]);
  });

  it('backend: an id that matches nothing is not applied by position', () => {
    expect(backend.merged.projects).toEqual(SOURCE.projects);
  });

  it('store: an id that matches nothing is not applied by position', () => {
    useResumeStore.getState().applyAISuggestion('cv', RESPONSE, { skipSuggestions: true });
    expect(storeResume().projects).toEqual(SOURCE.projects);
  });

  /** Both-halves: a response that drops every `_vId` still lands by position. */
  it('store: entries answered with no _vId are matched by position', () => {
    useResumeStore.getState().applyAISuggestion('cv', RESPONSE, { skipSuggestions: true });
    expect((storeResume().volunteer as Fields[]).map((item) => item.summary)).toEqual([
      'Taught programming to 30 kids a week.',
      'Sorted 200 parcels a shift.',
    ]);
  });
  /**
   * The grade bills what the store writes: a run graded a change must write one,
   * and one graded a no-op must write nothing.
   */
  describe.each(Object.keys(MATCHING_CASES) as MatchingCase[])('matching rule: %s', (name) => {
    it('the store writes what the backend merge writes', () => {
      useResumeStore
        .getState()
        .applyAISuggestion('cv', structuredClone(MATCHING_CASES[name]), { skipSuggestions: true });
      const frontend = storeResume();
      for (const section of COMPARED) {
        expect({ section, value: backend.matching[name].merged[section] }).toEqual({
          section,
          value: frontend[section],
        });
      }
    });

    it('the grade calls it a change exactly when the store wrote one', () => {
      useResumeStore
        .getState()
        .applyAISuggestion('cv', structuredClone(MATCHING_CASES[name]), { skipSuggestions: true });
      const frontend = storeResume();
      const wrote = COMPARED.some(
        (section) =>
          JSON.stringify(frontend[section]) !==
          JSON.stringify(SOURCE[section as keyof typeof SOURCE]),
      );
      expect(backend.matching[name].graded).toBe(wrote);
    });
  });

  /** Non-vacuity: the three change cases really change, the echo really does not. */
  it('grades id-matched, id-less and mixed responses as changes, and the echo as none', () => {
    expect({
      idMatched: backend.matching.idMatched.graded,
      idLess: backend.matching.idLess.graded,
      mixed: backend.matching.mixed.graded,
      idLessEcho: backend.matching.idLessEcho.graded,
      idLessShorter: backend.matching.idLessShorter.graded,
    }).toEqual({
      idMatched: true,
      idLess: true,
      mixed: true,
      idLessEcho: false,
      idLessShorter: false,
    });
    expect(backend.matching.idLessShorter.merged.volunteer).toEqual(SOURCE.volunteer);
    expect(
      (backend.matching.idLessLonger.merged.work as Fields[]).map((item) => [
        item.summary,
        item.position,
      ]),
    ).toEqual([
      ['Ran reconciliation.', 'Engineer'],
      [undefined, 'Senior Developer'],
    ]);
    expect(
      (backend.matching.mixed.merged.work as Fields[]).map((item) => [item.summary, item.position]),
    ).toEqual([
      ['Reconciled ledgers daily.', 'Engineer'],
      [undefined, 'Senior Developer'],
    ]);
  });

  it('a section run applies and grades id-less entries by position too', () => {
    useResumeStore
      .getState()
      .applyAISuggestion(
        'section:volunteer',
        { items: structuredClone(SECTION_ID_LESS) as unknown as Fields[] },
        { skipSuggestions: true },
      );
    expect((storeResume().volunteer as Fields[]).map((item) => item.summary)).toEqual([
      'Taught Scratch weekly.',
      'Sorted parcels.',
    ]);
    expect(backend.sectionIdLessGraded).toBe(true);
  });
});
