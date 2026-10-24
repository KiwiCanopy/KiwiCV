/**
 * Whether a run that changed something is graded as having changed something.
 *
 * `hasActualChanges` decides whether the user is told "No changes" after a
 * request they have already been billed for, so both directions matter and only
 * one of them fails loudly. A cover letter once shipped grading as a no-op
 * every time; a fix repaired that for `section:` runs and left the `cv` branch
 * asking for the NAME `basics`, so any other object-shaped section in a whole-CV
 * run graded as unchanged however good the response was.
 *
 * ⚠️ Both directions are asserted throughout. A grader that answers `true`
 * unconditionally passes every "counts as a change" case on its own, and that is
 * exactly the shape the bug had — inverted.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  dropUnchangedSkillsReorg,
  hasActualChanges,
  isReorgResult,
  mergeImprovedIntoCv,
} from '../../netlify/functions/lib/ai/utils.js';

const SOURCE = {
  basics: { label: 'Engineer', summary: 'Builds payment systems.' },
  coverLetter: {
    subject: 'Application',
    paragraphs: ['Dear Hiring Team,', 'I have worked on payments.'],
  },
  work: [{ _vId: 'w1', position: 'Engineer', summary: 'Ran reconciliation.' }],
};

const gradeCv = (improved) =>
  hasActualChanges({
    granularity: 'cv',
    source: SOURCE,
    improved,
    allowReorg: false,
    id: undefined,
  });

const echoed = (section) => ({ improvedFields: { ...SOURCE[section] } });

test('a rewritten cover letter in a whole-CV run counts as a change', () => {
  assert.equal(
    gradeCv({ coverLetter: { improvedFields: { subject: 'Application: Senior Engineer' } } }),
    true,
  );
});

test('a cover letter returned unchanged does not', () => {
  assert.equal(gradeCv({ coverLetter: echoed('coverLetter') }), false);
});

test('a rewritten paragraph list counts, so the check is not comparing identity', () => {
  assert.equal(
    gradeCv({
      coverLetter: {
        improvedFields: { paragraphs: ['Dear Hiring Team,', 'I have RUN payments at scale.'] },
      },
    }),
    true,
  );
});

test('basics still grades both ways, as it did before the name test went', () => {
  assert.equal(gradeCv({ basics: { improvedFields: { summary: 'Rewritten.' } } }), true);
  assert.equal(gradeCv({ basics: echoed('basics') }), false);
});

test('a list section still grades both ways', () => {
  assert.equal(
    gradeCv({ work: [{ _vId: 'w1', improvedFields: { position: 'Staff Engineer' } }] }),
    true,
  );
  assert.equal(
    gradeCv({ work: [{ _vId: 'w1', improvedFields: { position: 'Engineer' } }] }),
    false,
  );
});

test('a whole run in which nothing moved is a no-op', () => {
  assert.equal(
    gradeCv({
      basics: echoed('basics'),
      coverLetter: echoed('coverLetter'),
      work: [{ _vId: 'w1', improvedFields: { position: 'Engineer' } }],
    }),
    false,
  );
});

/**
 * ⚠️ A section returned `null` must not take the whole job down. The grade runs
 * after the Vertex call, so a TypeError here marks the job failed AFTER the
 * request was paid for, and the user is told "something went wrong" about a
 * response that may have been fine. Before the shape test this could only happen
 * for `basics`; reading the shape widened it to every object section, so the
 * null guard moved with it.
 */
test('a section returned as null is graded, not thrown on', () => {
  assert.equal(gradeCv({ coverLetter: null }), false);
  assert.equal(
    gradeCv({ coverLetter: null, basics: { improvedFields: { summary: 'Rewritten.' } } }),
    true,
  );
});

/**
 * A custom section is graded against its `{ id, title, items }` source — on a
 * `section:` run by token, on a whole-CV run by `id`. Both directions,
 * for the reason the header gives.
 */
const CUSTOM = {
  id: 'c-1',
  title: 'Hackathons',
  items: [{ _vId: 'h1', name: 'HackZurich', summary: 'Built a tracker.' }],
};

const gradeCustomSection = (improved) =>
  hasActualChanges({
    granularity: 'section',
    source: CUSTOM,
    improved,
    allowReorg: false,
    id: 'custom:c-1',
  });

test('a custom section run counts a rewritten entry or heading, and not an echo', () => {
  const echo = { items: [{ _vId: 'h1', improvedFields: { ...CUSTOM.items[0] } }] };
  assert.equal(gradeCustomSection(echo), false);
  assert.equal(gradeCustomSection({ ...echo, title: 'Hackathons' }), false);
  assert.equal(gradeCustomSection({ ...echo, title: 'Hackathon-Teilnahmen' }), true);
  assert.equal(
    gradeCustomSection({
      items: [{ _vId: 'h1', improvedFields: { summary: 'Built a carbon tracker.' } }],
    }),
    true,
  );
});

test('a whole-CV run grades each custom section by id', () => {
  const grade = (customSections) =>
    hasActualChanges({
      granularity: 'cv',
      source: { customSections: [CUSTOM] },
      improved: { customSections },
      allowReorg: false,
      id: undefined,
    });
  const echo = { id: 'c-1', items: [{ _vId: 'h1', improvedFields: { ...CUSTOM.items[0] } }] };
  assert.equal(grade([echo]), false);
  assert.equal(grade([{ ...echo, title: 'Hackathons (DE)' }]), true);
  // A section the source does not have grades as nothing, never as a change.
  assert.equal(grade([{ ...echo, id: 'other', title: 'New' }]), false);
});

/**
 * The client writes nothing for a paragraph that moved only by
 * whitespace, so the run must not be billed as a change.
 */
test('a paragraph list that differs only by whitespace is a no-op, as the client sees it', () => {
  assert.equal(
    gradeCv({
      coverLetter: {
        improvedFields: { paragraphs: ['Dear Hiring Team, ', '  I have worked on payments.\n'] },
      },
    }),
    false,
  );
});

/**
 * An empty reorganisation is no change. The schema allows `skills: []`;
 * graded by the section NAME it counted as a change and was billed, while
 * `mergeImprovedIntoCv` kept every skill for the letter. Reorg is now read off
 * the shape — items carrying `_sourceVIds` — by both.
 */
const REORG_SOURCE = {
  skills: [
    { _vId: 's1', name: 'Frontend', keywords: ['React'] },
    { _vId: 's2', name: 'Backend', keywords: ['Node'] },
  ],
  work: [{ _vId: 'w1', position: 'Engineer' }],
};

const gradeReorgCv = (improved) =>
  hasActualChanges({
    granularity: 'cv',
    source: REORG_SOURCE,
    improved,
    allowReorg: true,
    id: undefined,
  });

const gradeReorgSection = (items) =>
  hasActualChanges({
    granularity: 'section',
    source: REORG_SOURCE.skills,
    improved: { items },
    allowReorg: true,
    id: 'skills',
  });

test('an empty reorganised skills list is not a change, at either granularity', () => {
  assert.equal(gradeReorgCv({ skills: [] }), false);
  assert.equal(
    gradeReorgCv({ skills: [], work: [{ _vId: 'w1', improvedFields: { position: 'Engineer' } }] }),
    false,
  );
  assert.equal(gradeReorgSection([]), false);
});

test('a real reorganisation still grades as a change, and an echo still does not', () => {
  const merged = [{ name: 'Engineering', keywords: ['React', 'Node'], _sourceVIds: ['s1', 's2'] }];
  assert.equal(gradeReorgCv({ skills: merged }), true);
  assert.equal(gradeReorgSection(merged), true);

  const echo = [
    { name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] },
    { name: 'Backend', keywords: ['Node'], _sourceVIds: ['s2'] },
  ];
  assert.equal(gradeReorgCv({ skills: echo }), false);
  assert.equal(gradeReorgSection(echo), false);
});

// A reorder is a change: the user sees the order differ (owner, 2026-10-24, #32).
test('a restructure that only reorders is a change, at either granularity', () => {
  const reordered = [
    { name: 'Backend', keywords: ['Node'], _sourceVIds: ['s2'] },
    { name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] },
  ];
  assert.equal(gradeReorgCv({ skills: reordered }), true);
  assert.equal(gradeReorgSection(reordered), true);
});

test('one entry claimed twice while another is dropped is a change', () => {
  const twice = [
    { name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] },
    { name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] },
  ];
  assert.equal(gradeReorgSection(twice), true);
});

test('an unchanged whole-CV restructure leaves the answer, so the client never offers it', () => {
  const echo = [
    { name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] },
    { name: 'Backend', keywords: ['Node'], _sourceVIds: ['s2'] },
  ];
  const work = [{ _vId: 'w1', improvedFields: { position: 'Staff Engineer' } }];
  const dropped = dropUnchangedSkillsReorg({
    granularity: 'cv',
    source: REORG_SOURCE,
    improved: { skills: echo, work },
    isReorg: true,
  });
  assert.deepEqual(dropped, { improved: { work }, isReorg: false });

  const reordered = [echo[1], echo[0]];
  const kept = dropUnchangedSkillsReorg({
    granularity: 'cv',
    source: REORG_SOURCE,
    improved: { skills: reordered, work },
    isReorg: true,
  });
  assert.equal(kept.isReorg, true);
  assert.deepEqual(kept.improved.skills, reordered);
});

test('the letter merge keeps every skill for an empty reorganisation', () => {
  assert.deepEqual(mergeImprovedIntoCv(REORG_SOURCE, { skills: [] }).skills, REORG_SOURCE.skills);
});

/**
 * The job result's `isReorg` is `isReorgResult`, read off the response's
 * shape. It was the REQUEST's `allowReorg`, so an item-shaped skills answer to a
 * reorg request was graded and merged as items here while the client replaced
 * the section with `{ _vId, improvedFields }` stubs.
 */
test('an item-shaped skills answer to a reorg request is not a reorg, and merges as items', () => {
  const itemShaped = [
    { _vId: 's1', improvedFields: { name: 'Frontend Engineering' } },
    { _vId: 's2', improvedFields: { name: 'Backend' } },
  ];
  const improved = { skills: itemShaped };

  assert.equal(
    isReorgResult({ granularity: 'cv', id: undefined, improved, allowReorg: true }),
    false,
  );
  assert.equal(
    isReorgResult({
      granularity: 'section',
      id: 'skills',
      improved: { items: itemShaped },
      allowReorg: true,
    }),
    false,
  );
  assert.deepEqual(mergeImprovedIntoCv(REORG_SOURCE, improved).skills, [
    { _vId: 's1', name: 'Frontend Engineering', keywords: ['React'] },
    { _vId: 's2', name: 'Backend', keywords: ['Node'] },
  ]);
});

test('isReorgResult: a reorg needs the request to allow one AND the response to carry one', () => {
  const merged = [{ name: 'Engineering', keywords: ['React', 'Node'], _sourceVIds: ['s1', 's2'] }];
  const grade = (overrides) =>
    isReorgResult({
      granularity: 'cv',
      id: undefined,
      improved: { skills: merged },
      allowReorg: true,
      ...overrides,
    });

  assert.equal(grade({}), true);
  assert.equal(grade({ allowReorg: false }), false);
  assert.equal(grade({ improved: { skills: [] } }), false);
  assert.equal(grade({ improved: null }), false);
  assert.equal(grade({ granularity: 'section', id: 'skills', improved: { items: merged } }), true);
  // Only skills reorganise; the same shape on another section is not one.
  assert.equal(grade({ granularity: 'section', id: 'work', improved: { items: merged } }), false);
});
