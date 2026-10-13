/**
 * The improve worker's request guards, as the pure function they are:
 * no Supabase stub, no handler. The assertions name the code, never just "it
 * throws": the code is what `ai_jobs.error` carries and the worker's log
 * classification reads.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  AI_MAX_CHAR_LIMIT,
  AI_MAX_PAYLOAD_CHARS,
} from '../../netlify/functions/lib/ai/constants.js';
import { validateImproveRequest } from '../../netlify/functions/lib/ai/request.js';
import { REFUSED_TARGETS, SERVED_TARGETS } from './ai-target-tables.mjs';

/** The handler resolves the job id (either spelling) and passes it in. */
const check = (body) => validateImproveRequest(body, body.jobId);

const FREE_TEXT_CAP = AI_MAX_CHAR_LIMIT + 500;

const LETTER_BLOCK = {
  jobDescription: 'Senior Engineer, Berlin.',
  targetLang: 'en',
  wordTarget: 300,
  tone: 'professional',
};

const valid = (overrides = {}) => ({
  jobId: 'job-1',
  activeTarget: 'cv',
  mode: 'improve',
  resumeData: { basics: { label: 'Engineer' } },
  ...overrides,
});

const quiet = (context) => context.mock.method(console, 'error', () => {});

const rejects = (body, code) => assert.throws(() => check(body), { message: code });

test('a valid request passes and names no letter', () => {
  assert.deepEqual(check(valid()), {
    target: { type: 'cv', sectionKey: '', vId: undefined },
    letterRequest: null,
    isLetterOnly: false,
    translatesWholeCv: false,
  });
});

test('a target no composition serves is INVALID_TARGET', (context) => {
  quiet(context);
  for (const activeTarget of REFUSED_TARGETS) {
    assert.throws(
      () => check(valid({ activeTarget })),
      { message: 'INVALID_TARGET' },
      activeTarget,
    );
  }
});

test('every target the app sends passes the target check', () => {
  for (const activeTarget of SERVED_TARGETS) {
    const { target } = check(valid({ activeTarget }));
    assert.equal(target.type, activeTarget.split(':')[0], activeTarget);
  }
});

test('each missing required field is MISSING_PARAMS', () => {
  for (const field of ['jobId', 'activeTarget', 'mode', 'resumeData']) {
    rejects(valid({ [field]: undefined }), 'MISSING_PARAMS');
  }
});

test('free text is capped at the limit plus slack, inclusive', (context) => {
  quiet(context);
  assert.doesNotThrow(() => check(valid({ instructions: 'x'.repeat(FREE_TEXT_CAP) })));
  rejects(valid({ instructions: 'x'.repeat(FREE_TEXT_CAP + 1) }), 'INSTRUCTIONS_TOO_LONG');
});

test('the job description carries the same cap as the free text', (context) => {
  quiet(context);
  const atCap = { ...LETTER_BLOCK, jobDescription: 'x'.repeat(FREE_TEXT_CAP) };
  assert.equal(
    check(valid({ coverLetter: atCap })).letterRequest.jobDescription.length,
    FREE_TEXT_CAP,
  );
  rejects(
    valid({ coverLetter: { ...LETTER_BLOCK, jobDescription: 'x'.repeat(FREE_TEXT_CAP + 1) } }),
    'INSTRUCTIONS_TOO_LONG',
  );
});

test('a letter-only run needs a letter block', () => {
  rejects(valid({ coverLetterOnly: true }), 'MISSING_PARAMS');
  const { letterRequest, isLetterOnly } = check(
    valid({ coverLetterOnly: true, coverLetter: LETTER_BLOCK }),
  );
  assert.equal(isLetterOnly, true);
  assert.equal(letterRequest.jobDescription, LETTER_BLOCK.jobDescription);
});

test('a letter-only run needs the whole CV', () => {
  for (const activeTarget of ['section:work', 'section:coverLetter', 'item:work:w1']) {
    rejects(
      valid({ activeTarget, coverLetterOnly: true, coverLetter: LETTER_BLOCK }),
      'MISSING_PARAMS',
    );
  }
});

test('the CV payload is capped by its serialised length, inclusive', (context) => {
  quiet(context);
  // `{"s":"…"}` is the string plus eight characters of JSON.
  const cvOfLength = (chars) => ({ s: 'x'.repeat(chars - 8) });
  assert.equal(JSON.stringify(cvOfLength(AI_MAX_PAYLOAD_CHARS)).length, AI_MAX_PAYLOAD_CHARS);

  assert.doesNotThrow(() => check(valid({ resumeData: cvOfLength(AI_MAX_PAYLOAD_CHARS) })));
  rejects(valid({ resumeData: cvOfLength(AI_MAX_PAYLOAD_CHARS + 1) }), 'PAYLOAD_TOO_LARGE');
});

test('a missing field outranks an oversized one', (context) => {
  quiet(context);
  rejects(
    valid({ jobId: undefined, instructions: 'x'.repeat(FREE_TEXT_CAP + 1) }),
    'MISSING_PARAMS',
  );
});

// ---------------------------------------------------------------------------
// The whole-CV translation cap
// ---------------------------------------------------------------------------

const { AI_TRANSLATION_MAX_CHARS } = await import('../../netlify/functions/lib/ai/constants.js');
const { wholeCvProjectedChars } = await import('../../netlify/functions/lib/ai/request.js');

/** A CV whose projection is `projected` characters long, plus `metaChars` of `meta`. */
const cvOf = (projected, metaChars = 0) => {
  const base = { work: [{ _vId: 'w1', summary: '' }] };
  const summary = 'x'.repeat(projected - wholeCvProjectedChars(base));
  const cv = { work: [{ _vId: 'w1', summary }], meta: { notes: 'm'.repeat(metaChars) } };
  assert.equal(wholeCvProjectedChars(cv), projected);
  return cv;
};

const translating = { currentLang: 'en', targetLang: 'de' };

test('a whole-CV translation one character past the cap is PAYLOAD_TOO_LARGE', (context) => {
  context.mock.method(console, 'warn', () => {});
  rejects(
    valid({ ...translating, resumeData: cvOf(AI_TRANSLATION_MAX_CHARS + 1) }),
    'PAYLOAD_TOO_LARGE',
  );
});

test('a whole-CV translation at the cap runs', () => {
  assert.doesNotThrow(() =>
    check(valid({ ...translating, resumeData: cvOf(AI_TRANSLATION_MAX_CHARS) })),
  );
});

test('the same CV runs when the run does not translate', () => {
  const resumeData = cvOf(AI_TRANSLATION_MAX_CHARS + 1);
  assert.doesNotThrow(() => check(valid({ resumeData })));
  assert.doesNotThrow(() => check(valid({ resumeData, currentLang: 'de', targetLang: 'de' })));
});

test('the cap measures the projection, so meta does not count', () => {
  assert.doesNotThrow(() =>
    check(valid({ ...translating, resumeData: cvOf(1000, AI_TRANSLATION_MAX_CHARS + 10) })),
  );
});

test('a section run is not a whole-CV translation', () => {
  const { work } = cvOf(AI_TRANSLATION_MAX_CHARS + 1);
  assert.doesNotThrow(() =>
    check(valid({ ...translating, activeTarget: 'section:work', resumeData: work })),
  );
});
