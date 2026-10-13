/**
 * The letter call's own logic: what reaches it, and what it refuses.
 *
 * Every failure class here was either measured against Vertex on 2026-09-05 or
 * is a class the endpoint's own contract makes reachable — `MAX_TOKENS`,
 * `SAFETY`, a truncated body, `paragraphs: []`, and the one fabricated fact
 * seen in ~90 runs. None of them is an error: each is a notice on a run that
 * still tailored the CV, which is what the billing test beside this one pins.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { COVER_LETTER_STYLE_MAX } from '../../netlify/functions/lib/ai/constants.js';
import {
  COVER_LETTER_FAILURES,
  findInventedYears,
  generateCoverLetter,
  isCoverLetterRetryable,
  normalizeCoverLetterRequest,
  validateCoverLetter,
} from '../../netlify/functions/lib/ai/coverLetter.js';
import { mergeImprovedIntoCv } from '../../netlify/functions/lib/ai/utils.js';

const PROJECTION = {
  basics: { name: 'Jane Doe', label: 'Engineer' },
  work: [
    { position: 'Engineer', name: 'Beispiel AG', startDate: '2019-01-01', endDate: '2022-03-31' },
  ],
};

const AD = 'Senior Engineer, Berlin. Reference 2024-77.';

const letter = (paragraphs, subject = 'Application for Senior Engineer') =>
  JSON.stringify({ subject, paragraphs });

const validate = (improvedContent, overrides = {}) =>
  validateCoverLetter({
    improvedContent,
    finishReason: 'STOP',
    projection: PROJECTION,
    jobDescription: AD,
    ...overrides,
  });

// ---------------------------------------------------------------------------
// The request block
// ---------------------------------------------------------------------------

test('the writing sample is capped server-side, where nothing else caps it', () => {
  const request = normalizeCoverLetterRequest({
    jobDescription: AD,
    targetLang: 'en',
    wordTarget: 300,
    styleSample: 'x'.repeat(COVER_LETTER_STYLE_MAX + 5000),
  });

  assert.equal(request.styleSample.length, COVER_LETTER_STYLE_MAX);
});

test('no cover-letter block means no letter was asked for', () => {
  assert.equal(normalizeCoverLetterRequest(undefined), null);
  assert.equal(normalizeCoverLetterRequest('a string'), null);
  assert.equal(normalizeCoverLetterRequest([]), null);
});

/**
 * ⚠️ The trap this would otherwise walk into. A control that builds the block
 * from its own settings and sends it whenever the panel is mounted would report
 * a failed letter on every ordinary tailoring run — the user is told the letter
 * did not come through on a run where they never asked for one.
 */
test('a block with no job description is no request at all, not a failed one', () => {
  assert.equal(normalizeCoverLetterRequest({}), null);
  assert.equal(normalizeCoverLetterRequest({ targetLang: 'en', wordTarget: 300 }), null);
  assert.equal(normalizeCoverLetterRequest({ jobDescription: '   ' }), null);
  assert.ok(normalizeCoverLetterRequest({ jobDescription: AD }), 'an ad IS the request');
});

test('a retry is offered for what a retry can clear, and not for the rest', () => {
  for (const code of [
    COVER_LETTER_FAILURES.CALL_FAILED,
    COVER_LETTER_FAILURES.TRUNCATED,
    COVER_LETTER_FAILURES.FILTERED,
    COVER_LETTER_FAILURES.UNPARSEABLE,
    COVER_LETTER_FAILURES.EMPTY,
    COVER_LETTER_FAILURES.INVENTED_YEAR,
  ]) {
    assert.equal(isCoverLetterRetryable(code), true, code);
  }
  // The shipped copy promises "you can try the letter again". For these two
  // that promise is false: the day is spent, and the same request fails again.
  assert.equal(isCoverLetterRetryable(COVER_LETTER_FAILURES.ALLOWANCE_SPENT), false);
  assert.equal(isCoverLetterRetryable(COVER_LETTER_FAILURES.BAD_REQUEST), false);
});

// ---------------------------------------------------------------------------
// The CV call 2 reads
// ---------------------------------------------------------------------------

/**
 * ⚠️ Both directions. A merge that returned its input unchanged would satisfy
 * every "the letter still has the CV" assertion on its own, and the letter
 * would quietly echo the wording the user sent rather than the wording they are
 * about to see — the entire reason the calls are sequential.
 */
test('call 1 improvedFields are written back before the letter reads the CV', () => {
  const source = {
    basics: { label: 'Engineer', summary: 'Old summary.' },
    work: [
      { _vId: 'w1', position: 'Engineer', summary: 'Old work.' },
      { _vId: 'w2', position: 'Intern', summary: 'Kept.' },
    ],
  };
  const improved = {
    basics: { improvedFields: { summary: 'New summary.' } },
    work: [{ _vId: 'w1', improvedFields: { summary: 'New work.' } }],
  };

  const merged = mergeImprovedIntoCv(source, improved);

  assert.equal(merged.basics.summary, 'New summary.');
  assert.equal(merged.basics.label, 'Engineer', 'a field call 1 did not touch survives');
  assert.equal(merged.work[0].summary, 'New work.');
  assert.equal(merged.work[1].summary, 'Kept.', 'an item call 1 did not answer for survives');
  assert.equal(source.basics.summary, 'Old summary.', 'the source is not mutated');
});

test('a reorganized section is replaced, not merged item by item', () => {
  const source = { skills: [{ _vId: 's1', name: 'Frontend', keywords: ['React'] }] };
  const improved = {
    skills: [
      { name: 'Web', keywords: ['React', 'CSS'], _sourceVIds: ['s1'] },
      { name: 'Cloud', keywords: ['AWS'], _sourceVIds: [] },
    ],
  };

  const merged = mergeImprovedIntoCv(source, improved);

  assert.equal(merged.skills.length, 2);
  assert.deepEqual(merged.skills[1], { name: 'Cloud', keywords: ['AWS'], _sourceVIds: [] });
});

/**
 * ⚠️ The half of the merge with no `_vId` to match on. `applyCvSuggestion` falls
 * back to position for an item the model answered without echoing its id, and a
 * merge that did not would silently drop that item's rewrite from the CV the
 * letter reads.
 */
test('an item answered without its _vId is matched by position', () => {
  const source = {
    work: [
      { _vId: 'w1', position: 'Engineer', summary: 'First.' },
      { _vId: 'w2', position: 'Intern', summary: 'Second.' },
    ],
  };
  const improved = {
    work: [{ improvedFields: { summary: 'Rewritten first.' } }, { improvedFields: {} }],
  };

  const merged = mergeImprovedIntoCv(source, improved);

  assert.equal(merged.work[0].summary, 'Rewritten first.');
  assert.equal(merged.work[1].summary, 'Second.');
});

test("an item the response skipped never takes a sibling's rewrite by position", () => {
  const source = {
    skills: [
      { _vId: 's1', name: 'Payments', keywords: ['SEPA'] },
      { _vId: 's2', name: 'Go', keywords: [] },
    ],
    projects: [{ _vId: 'p1', description: 'Kept.' }],
  };
  const improved = {
    skills: [{ _vId: 's2', improvedFields: { keywords: ['Concurrency'] } }],
    projects: [{ _vId: 'unknown', improvedFields: { description: 'Invented.' } }],
  };

  const merged = mergeImprovedIntoCv(source, improved);

  assert.deepEqual(
    merged.skills.map((item) => item.keywords),
    [['SEPA'], ['Concurrency']],
  );
  assert.equal(merged.projects[0].description, 'Kept.', 'an id naming nothing is not positional');
});

/**
 * ⚠️ Reorg is recognised by `_sourceVIds`, never by the absence of
 * `improvedFields`. Read the other way round, this response would replace the
 * work history with the model's stubs and the letter would be drafted from a CV
 * with no jobs in it — silently, since the projection drops empty items.
 */
test('an item-shaped response missing its wrapper does not wipe the section', () => {
  const source = { work: [{ _vId: 'w1', position: 'Engineer', summary: 'Kept.' }] };

  const merged = mergeImprovedIntoCv(source, { work: [{ _vId: 'w1' }] });

  assert.equal(merged.work.length, 1);
  assert.equal(merged.work[0].summary, 'Kept.');
  assert.equal(merged.work[0].position, 'Engineer');
});

test('a response key the CV has no section for is ignored, not written', () => {
  const merged = mergeImprovedIntoCv(
    { basics: { label: 'Engineer' } },
    { ghost: { improvedFields: { x: 1 } } },
  );
  assert.deepEqual(Object.keys(merged), ['basics']);
});

// ---------------------------------------------------------------------------
// What makes a letter a failed letter
// ---------------------------------------------------------------------------

test('a good letter comes back as the two fields Improve returns', () => {
  const { letter: result, error } = validate(
    letter([
      'Dear Hiring Manager,',
      'I led reconciliation work from 2019 to 2022.',
      'Kind regards,',
    ]),
  );

  assert.equal(error, undefined);
  assert.deepEqual(Object.keys(result).sort(), ['paragraphs', 'subject']);
  assert.equal(result.paragraphs.length, 3);
});

test('MAX_TOKENS and SAFETY are named rather than read as a parse failure', () => {
  assert.equal(
    validate(letter(['Dear Hiring Manager,']), { finishReason: 'MAX_TOKENS' }).error,
    COVER_LETTER_FAILURES.TRUNCATED,
  );
  assert.equal(
    validate(letter(['Dear Hiring Manager,']), { finishReason: 'SAFETY' }).error,
    COVER_LETTER_FAILURES.FILTERED,
  );
});

test('a body that truncated mid-string is a failure, not an exception', () => {
  const truncated = '{"subject":"Application","paragraphs":["Dear Hiring Man';
  assert.equal(validate(truncated).error, COVER_LETTER_FAILURES.UNPARSEABLE);
});

/**
 * `paragraphs: []` satisfies `getCoverLetterSchema()` — the schema constrains
 * the type and cannot constrain the content — so without this check a letter
 * that says nothing is billed and rendered as an empty section.
 */
test('a schema-valid empty letter is a failed letter', () => {
  assert.equal(validate(letter([])).error, COVER_LETTER_FAILURES.EMPTY);
  assert.equal(validate(letter(['', '   '])).error, COVER_LETTER_FAILURES.EMPTY);
  assert.equal(validate('{"subject":"Application"}').error, COVER_LETTER_FAILURES.EMPTY);
});

test('a blank paragraph between real ones is dropped rather than rendered', () => {
  const { letter: result } = validate(letter(['Dear Hiring Manager,', '  ', 'Kind regards,']));
  assert.deepEqual(result.paragraphs, ['Dear Hiring Manager,', 'Kind regards,']);
});

/**
 * The measured case, verbatim: one run in ~90 wrote a job's end as "March 2031"
 * where the CV says `2022-03-31`. It is the only fabricated fact the whole
 * measurement produced, and no prompt line prevents a transcription error.
 */
test('a year the CV and the ad do not contain fails the letter', () => {
  const outcome = validate(
    letter(['Dear Hiring Manager,', 'I held that role until March 2031.', 'Kind regards,']),
  );

  assert.equal(outcome.error, COVER_LETTER_FAILURES.INVENTED_YEAR);
  assert.equal(outcome.detail, '2031');
  assert.equal(outcome.letter, undefined, 'a letter with an invented year is never returned');
});

/**
 * ⚠️ The direction that would break real letters. A check that failed anything
 * with a year in it would reject almost every letter, and it would pass the
 * test above while doing so.
 */
test('the years the CV and the ad do carry are accepted', () => {
  const fromCv = validate(
    letter([
      'Dear Hiring Manager,',
      'Between 2019 and 2022 I ran reconciliation.',
      'Kind regards,',
    ]),
  );
  assert.equal(fromCv.error, undefined, 'a year the projection states must pass');

  const fromAd = validate(
    letter(['Dear Hiring Manager,', 'I am writing about reference 2024-77.', 'Kind regards,']),
  );
  assert.equal(fromAd.error, undefined, 'a year the job description states must pass');
});

test('the check is years, not every four-digit number', () => {
  assert.deepEqual(findInventedYears(['A platform serving 5000 people.'], ''), []);
  assert.deepEqual(findInventedYears(['I finished in 2031 and 2032.'], '2031'), ['2032']);
});

/**
 * ⚠️ An ongoing role carries `endDate: ''`, so the projection contains no year
 * for the end of it. "From 2019 to <this year>" is then the correct sentence
 * and would have failed a good letter — the false positive that would have hit
 * every CV with a current job.
 */
test('the year a letter is written in is not an invented one', () => {
  const thisYear = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
  }).format(new Date());

  assert.deepEqual(
    findInventedYears([`From 2019 to ${thisYear} I ran reconciliation.`], '2019'),
    [],
  );
});

// ---------------------------------------------------------------------------
// The call itself
// ---------------------------------------------------------------------------

const REQUEST = { jobDescription: AD, targetLang: 'en', wordTarget: 300, tone: 'professional' };

const respond =
  (payload, extra = {}) =>
  async () => ({
    improvedContent: JSON.stringify(payload),
    data: { usageMetadata: { promptTokenCount: 11, candidatesTokenCount: 22 } },
    latency: 5,
    candidate: { finishReason: 'STOP', safetyRatings: [] },
    ...extra,
  });

test('the call reads the projection of the CV it is handed, not the whole CV', async () => {
  let seen = null;
  await generateCoverLetter({
    getAIResponse: async (params) => {
      seen = params;
      return respond({ subject: 'S', paragraphs: ['Dear Hiring Manager,', 'Kind regards,'] })();
    },
    tailoredCv: {
      basics: { name: 'Jane Doe', label: 'Engineer', email: 'jane@example.com' },
      references: [{ name: 'A referee' }],
    },
    request: REQUEST,
  });

  const sent = JSON.stringify(seen.sanitizedResumeData);
  assert.match(sent, /Jane Doe/);
  assert.doesNotMatch(sent, /jane@example.com/, 'the sanitizer runs again before the projection');
  assert.doesNotMatch(sent, /referee/, 'COVER_LETTER_COMPOSITION bounds the request');
  assert.equal(typeof seen.systemPrompt, 'string');
  assert.equal(typeof seen.userPrompt, 'string');
  assert.ok(seen.maxOutputTokens > 0, 'the letter is the one call that carries a budget');
});

/**
 * `vertex.js` throws on any non-OK response and has no retry, so a 429 or a 503
 * arrives as an exception. It must not escape: the tailored CV upstream is
 * already paid for.
 */
test('a 503 from Vertex is a notice, never a throw', async () => {
  const outcome = await generateCoverLetter({
    getAIResponse: async () => {
      throw new Error('Vertex AI request failed: 503');
    },
    tailoredCv: PROJECTION,
    request: REQUEST,
  });

  assert.equal(outcome.error, COVER_LETTER_FAILURES.CALL_FAILED);
  assert.equal(outcome.letter, undefined);
});

test('a language the prompt cannot write is refused before the call is made', async () => {
  let called = false;
  const outcome = await generateCoverLetter({
    getAIResponse: async () => {
      called = true;
      return respond({ subject: 'S', paragraphs: ['x'] })();
    },
    tailoredCv: PROJECTION,
    request: { ...REQUEST, targetLang: 'kl' },
  });

  assert.equal(outcome.error, COVER_LETTER_FAILURES.BAD_REQUEST);
  assert.equal(called, false, 'a request that cannot be built must not be sent');
});

test('the usage the caller bills is the letter call own, not call 1 own', async () => {
  const outcome = await generateCoverLetter({
    getAIResponse: respond({
      subject: 'Application',
      paragraphs: ['Dear Hiring Manager,', 'Kind regards,'],
    }),
    tailoredCv: PROJECTION,
    request: REQUEST,
  });

  assert.deepEqual(outcome.usage, { tokens_input: 11, tokens_output: 22 });
  assert.equal(outcome.finishReason, 'STOP');
});
