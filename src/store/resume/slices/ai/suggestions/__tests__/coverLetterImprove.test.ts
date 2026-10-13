import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeCoverLetter, createDefaultCoverLetter } from '@/types/resume';
import { getAISuggestionBreakdown } from '@/utils/ai';
import { spawnSync } from 'node:child_process';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * The cover-letter Improve run, driven end to end.
 *
 * ⚠️ **This file exists because four green suites agreed on a feature that could
 * not work.** `section:coverLetter` shipped once and was reverted: the
 * response schema carried two untyped nodes, it asked for a `_vId` the letter
 * has none of, `applySectionSuggestion` had no branch that could write the
 * result back, and `hasActualChanges` reported a no-op whatever came in. `tsc`,
 * 3,169 tests, lint, `i18n:check` and `ai:check-sync` were all green, because
 * every one of them read the pieces and none of them ran the pipeline.
 *
 * So this file runs it, and it owns the STORE half. The schema's own shape is
 * asserted in `tests/netlify-functions/vertex-request.test.mjs`, where it needs
 * no spawn — what has to happen here is the round trip: a response derived from
 * the real schema, graded by the real `hasActualChanges`, applied by the real
 * store action.
 *
 * ⚠️ The backend is reached by **spawning node**, not by importing it.
 * `.claude/rules/ai-backend.md` forbids the import — that library is ESM shipped
 * to Netlify, outside the app's tsconfig, and importing it would put vite's
 * resolution between this test and the code it is checking. A spawn runs the
 * file Netlify runs.
 */

interface BackendProbe {
  /** The model response, built from the real schema rather than typed out here. */
  response: { improvedFields: { subject: string; paragraphs: string[] } };
  /** What the server strips before the model sees it — the real sanitizer's output. */
  sanitizedSource: Record<string, unknown>;
  grades: {
    letterRewritten: boolean;
    letterUnchanged: boolean;
    basicsRewritten: boolean;
    basicsUnchanged: boolean;
  };
}

const SOURCE_LETTER: ResumeCoverLetter = {
  ...createDefaultCoverLetter(),
  enabled: true,
  subject: 'Application',
  paragraphs: [
    'Dear Hiring Team,',
    'I have worked on payment systems for some time and would like to join you.',
    'Kind regards, Alex Rivera',
  ],
  recipient: { name: 'Dana Fischer', company: 'Northwind', address: '1 Docks Road' },
};

/** `SECTION_COMPOSITION.basics` is `['label', 'summary']`. */
const SOURCE_BASICS = { label: 'Engineer', summary: 'Builds payment systems.' };

/**
 * Builds a response that satisfies the schema, so the fixture cannot drift from
 * the contract the model is given.
 *
 * ⚠️ **Two properties here are load-bearing, and an earlier version had
 * neither.** Every leaf names its own path, so a response whose entries were
 * reordered is not equal to one that was not; and an ARRAY takes its length from
 * the SOURCE, so the fixture itself obeys "return exactly as many entries as
 * were given". The first draft emitted two identical strings for a
 * three-paragraph letter, which made `paragraphs.every(p => p === marker)`
 * satisfied by any arity at all — truncating the array, reversing it or dropping
 * it to `[]` were all green, and losing a paragraph is the exact failure this
 * feature's prompt rule exists to prevent.
 */
const RESPONSE_FROM_SCHEMA = `
  const fill = (node, trail, source) => {
    if (!node || typeof node !== 'object' || !node.type) {
      throw new Error('schema node at ' + trail + ' has no type — Vertex rejects it');
    }
    if (node.type === 'OBJECT') {
      return Object.fromEntries(
        Object.entries(node.properties || {}).map(([key, child]) => [
          key,
          fill(child, trail + '.' + key, source == null ? undefined : source[key]),
        ]),
      );
    }
    if (node.type === 'ARRAY') {
      const length = Array.isArray(source) ? source.length : 2;
      return Array.from({ length }, (_, i) => fill(node.items, trail + '[' + i + ']', undefined));
    }
    if (node.type === 'INTEGER') return 1;
    return 'rewritten ' + trail;
  };
`;

const probeBackend = (): BackendProbe => {
  const script = `
    import { getVertexResponseSchema } from './netlify/functions/lib/ai/generator.js';
    import { hasActualChanges, sanitizeResumeData } from './netlify/functions/lib/ai/utils.js';

    // The real sanitizer, not an assumption about it: if it ever stripped
    // 'subject' or 'paragraphs', every letter run would become a no-op and the
    // grades below would say so.
    const sanitizedSource = sanitizeResumeData(${JSON.stringify(SOURCE_LETTER)});
    const basicsSource = ${JSON.stringify(SOURCE_BASICS)};

    const schema = getVertexResponseSchema('section', ['coverLetter'], false, [], false);
    ${RESPONSE_FROM_SCHEMA}
    const response = fill(schema, '$', { improvedFields: sanitizedSource });

    const grade = (source, improved, id) =>
      hasActualChanges({ granularity: 'section', source, improved, allowReorg: false, id });

    process.stdout.write(
      JSON.stringify({
        response,
        sanitizedSource,
        grades: {
          letterRewritten: grade(sanitizedSource, response, 'coverLetter'),
          // The direction that decides whether a user pays for nothing.
          letterUnchanged: grade(
            sanitizedSource,
            { improvedFields: { subject: sanitizedSource.subject, paragraphs: sanitizedSource.paragraphs } },
            'coverLetter',
          ),
          // \`section:basics\` answers in the same shape and has always graded as
          // a no-op. Same branch, so it is graded here too.
          basicsRewritten: grade(
            basicsSource,
            { improvedFields: { label: 'Staff Engineer', summary: 'Rewritten.' } },
            'basics',
          ),
          basicsUnchanged: grade(basicsSource, { improvedFields: { ...basicsSource } }, 'basics'),
        },
      }),
    );
  `;

  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  if (run.status !== 0) {
    throw new Error(`the backend probe failed:\n${run.stderr || run.stdout}`);
  }

  return JSON.parse(run.stdout) as BackendProbe;
};

const probe = probeBackend();
const proposed = probe.response.improvedFields;

describe('improving a cover letter, from the response schema to the store', () => {
  beforeEach(() => {
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, coverLetter: structuredClone(SOURCE_LETTER) },
      ai: { ...state.ai, suggestions: {} },
    }));
  });

  /**
   * Non-vacuity. The response is generated, so a `fill` that quietly produced
   * nothing would make every assertion below trivially true.
   */
  it('built a response the model could actually have returned', () => {
    expect(Object.keys(probe.response)).toEqual(['improvedFields']);
    expect(Object.keys(proposed).sort()).toEqual(['paragraphs', 'subject']);
    expect(proposed.paragraphs).toHaveLength(SOURCE_LETTER.paragraphs.length);
    expect(new Set(proposed.paragraphs).size).toBe(proposed.paragraphs.length);
    // The addressee never reaches the model, so it can never come back.
    expect(probe.sanitizedSource).not.toHaveProperty('recipient');
    expect(probe.sanitizedSource.paragraphs).toEqual(SOURCE_LETTER.paragraphs);
  });

  /**
   * `hasActualChanges` resolved each returned `_vId` against
   * `Array.isArray(source) ? source : []`, so an object section missed every
   * item and the job completed as a no-op — which the client turns into "No
   * changes", after the request has been spent.
   *
   * ⚠️ **Both directions.** The first version asserted only that a rewrite
   * grades as a change, and this is the repo's only test of no-op detection at
   * any granularity — so `return true` passed it, and the acceptance
   * criterion ("a run that changes nothing reports a no-op BECAUSE nothing
   * changed") had nothing behind it.
   */
  it('grades a rewritten letter as a change and an identical one as a no-op', () => {
    expect(probe.grades.letterRewritten).toBe(true);
    expect(probe.grades.letterUnchanged).toBe(false);
  });

  /**
   * ⚠️ Not the cover letter, and not incidental. `section:basics` is reachable
   * whenever `basics.name` is set, answers in the same `{ improvedFields }`
   * shape with no `items`, and has therefore graded as a no-op since it existed
   * — Improve on Personal Details said "No changes" every time, after paying for
   * itself. The branch that carries the letter carries this too, so it is pinned
   * here rather than left to the changelog entry that claims it.
   */
  it('grades the basics section the same way, which it never used to', () => {
    expect(probe.grades.basicsRewritten).toBe(true);
    expect(probe.grades.basicsUnchanged).toBe(false);
  });

  /**
   * `applySectionSuggestion` branched on `basics` or `Array.isArray`, so for the
   * cover letter it fell off the end and wrote nothing.
   */
  it('writes the improved letter into the store, paragraph for paragraph', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);

    const letter = useResumeStore.getState().resume.coverLetter;
    expect(letter.subject).toBe(proposed.subject);
    // Deep equality, not a predicate over the entries: `every()` is satisfied by
    // an empty array, so a branch that dropped the paragraphs shipped green.
    expect(letter.paragraphs).toEqual(proposed.paragraphs);
    expect(letter.paragraphs).toHaveLength(SOURCE_LETTER.paragraphs.length);
  });

  /** The composition names two fields; the addressee and the layout are not its business. */
  it('leaves the recipient and the layout alone', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);

    const letter = useResumeStore.getState().resume.coverLetter;
    expect(letter.recipient).toEqual(SOURCE_LETTER.recipient);
    expect(letter.layout).toEqual(SOURCE_LETTER.layout);
    expect(letter.enabled).toBe(true);
  });

  /**
   * ⚠️ Two keys, ONE proposal. The `section:` container and the `item:` target
   * record the same rewrite — the container so the section button can accept it,
   * the `item:` one so the diff panel can render it. What the user sees
   * is the COUNT, and `getAISuggestionBreakdown` suppresses the container once
   * an `item:` key exists. That suppression matched a trailing colon until
   * a review caught it, so this pairing would have read "2 proposals".
   */
  it('shows one pending proposal, not one per key that records it', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);

    const { suggestions } = useResumeStore.getState().ai;
    expect(Object.keys(suggestions).sort()).toEqual(['item:coverLetter', 'section:coverLetter']);
    expect(getAISuggestionBreakdown(suggestions, ['coverLetter']).content).toBe(1);
  });

  it('clears both keys when the proposal is accepted', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);
    useResumeStore.getState().acceptAllSuggestions('section:coverLetter');

    expect(useResumeStore.getState().ai.suggestions).toEqual({});
    expect(useResumeStore.getState().resume.coverLetter.subject).toBe(proposed.subject);
  });

  /** Only what moved. On the real run the model echoed `subject` unchanged. */
  it('records only the fields that actually changed', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', {
      improvedFields: { subject: SOURCE_LETTER.subject, paragraphs: proposed.paragraphs },
    });

    const item = useResumeStore.getState().ai.suggestions['item:coverLetter'];
    expect(Object.keys(item.improvedValue)).toEqual(['paragraphs']);
    expect(item.originalValue.paragraphs).toEqual(SOURCE_LETTER.paragraphs);
  });

  /**
   * ⚠️ Discarding has to RESTORE, not merely forget. Every list section restores
   * through its `item:` proposals and `basics` through `item:basics`; without an
   * object branch in `declineAISuggestion` the cover letter would be the one
   * place in the CV where "Discard" keeps the AI's wording and drops the user's.
   */
  it('puts the user’s own letter back when the proposal is discarded', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);
    // The order `usePendingProposals.discardAll` uses: `item:` targets first,
    // because they are the only ones that RESTORE rather than forget.
    useResumeStore.getState().declineAISuggestion('item:coverLetter');

    const letter = useResumeStore.getState().resume.coverLetter;
    expect(letter.subject).toBe(SOURCE_LETTER.subject);
    expect(letter.paragraphs).toEqual(SOURCE_LETTER.paragraphs);
    // `cleanupContainerSuggestions` takes the container with it.
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
  });

  /**
   * ⚠️ The letter is where this bites, because it is the field big enough to
   * invite real typing: the panel is read-only and capped, the textarea below it
   * is the only writable copy, and both are on screen at once. Declining used to
   * write the pre-run original over whatever the user had since written.
   */
  it('leaves paragraphs the user rewrote after the run alone', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);

    const mine = [...proposed.paragraphs];
    mine[1] = 'A paragraph I wrote myself after the run.';
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, coverLetter: { ...state.resume.coverLetter, paragraphs: mine } },
    }));

    useResumeStore.getState().declineAISuggestion('item:coverLetter');

    expect(useResumeStore.getState().resume.coverLetter.paragraphs).toEqual(mine);
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
  });

  /**
   * Rejecting ONE field leaves the other proposed. Nothing renders this for the
   * letter yet, but the branch takes a `field` argument because the
   * `item:` branch beside it does, and a copy that silently ignored it would
   * restore the whole letter on a per-field Reject.
   */
  it('restores only the field a per-field reject names', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);
    useResumeStore.getState().declineAISuggestion('item:coverLetter', 'subject');

    const letter = useResumeStore.getState().resume.coverLetter;
    expect(letter.subject).toBe(SOURCE_LETTER.subject);
    expect(letter.paragraphs).toEqual(proposed.paragraphs);
    expect(useResumeStore.getState().ai.suggestions['item:coverLetter']).toBeTruthy();
  });

  /** A field the proposal does not carry must not write `undefined` into it. */
  it('ignores a per-field reject for a field it never proposed', () => {
    useResumeStore.getState().applyAISuggestion('section:coverLetter', probe.response);
    useResumeStore.getState().declineAISuggestion('item:coverLetter', 'date');

    expect(useResumeStore.getState().resume.coverLetter.date).toBe(SOURCE_LETTER.date);
    expect(useResumeStore.getState().resume.coverLetter.subject).toBe(proposed.subject);
  });
});
