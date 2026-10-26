/**
 * Request-payload tests for the Vertex AI pipeline.
 *
 * These test what is actually SENT to the model — URL, generationConfig,
 * schema invariants, prompt rules — without any network call, via the pure
 * `buildVertexRequest` seam. Every assertion here pins a bug that shipped on
 * 2026-08-02: a parsing schema with no `required` (fields silently omitted),
 * condensing rules leaking into extraction, the invented-metrics prompt
 * contradiction, and prompts that were logged as empty strings.
 *
 * The system prompts and response schemas are snapshot-pinned in __snapshots__/ and
 * coupled to PROMPT_VERSION — see prompt-snapshots below and
 * regen-prompt-snapshots.mjs.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  COVER_LETTER_MAX_OUTPUT_TOKENS,
  COVER_LETTER_MAX_WORDS,
  PROMPT_VERSION,
  VERTEX_CONFIG,
} from '../../netlify/functions/lib/ai/constants.js';
import { buildMockAIResult } from '../../netlify/functions/lib/ai/debug/mock.js';
import {
  CUSTOM_SECTIONS_KEY,
  CUSTOM_SECTION_ITEM_COMPOSITION,
  PARSING_COMPOSITION,
  SECTION_COMPOSITION,
  SINGLETON_SECTIONS,
  WHOLE_CV_SECTIONS,
} from '../../netlify/functions/lib/ai/definitions.js';
import {
  getCoverLetterSchema,
  getParsingSchema,
  getVertexResponseSchema,
  requiredSectionsFor,
} from '../../netlify/functions/lib/ai/generator.js';
import {
  buildCoverLetterUserPrompt,
  getCoverLetterPrompt,
  getSystemPrompt,
} from '../../netlify/functions/lib/ai/prompts.js';
import { buildVertexRequest } from '../../netlify/functions/lib/ai/vertex.js';
import { ALL_SNAPSHOTS } from './prompt-snapshot-configs.mjs';

/** A custom section's token, as the layout and the AI target spell it. */
const CUSTOM_TOKEN = 'custom:11111111-2222-4333-8444-555555555555';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.join(__dirname, '__snapshots__');

const PARSING_SCHEMA = getParsingSchema(Object.keys(PARSING_COMPOSITION));

const parseRequest = (overrides = {}) =>
  buildVertexRequest({
    mode: 'professional',
    activeTarget: 'cv',
    currentLang: 'en',
    granularity: 'cv_parsing',
    fileBase64: 'ZmFrZQ==',
    fileType: 'application/pdf',
    responseSchema: PARSING_SCHEMA,
    projectId: 'test-project',
    ...overrides,
  });

const improveRequest = (overrides = {}) =>
  buildVertexRequest({
    mode: 'professional',
    activeTarget: 'cv',
    currentLang: 'en',
    granularity: 'cv',
    sanitizedResumeData: { work: [{ _vId: 'w1', position: 'Engineer' }] },
    responseSchema: getVertexResponseSchema('cv', ['work'], false, [], false),
    projectId: 'test-project',
    ...overrides,
  });

/**
 * The letter call as `generateCoverLetter` issues it: its own system
 * prompt and user turn, the letter schema, and the only output budget any call
 * carries.
 */
const letterRequest = (overrides = {}) =>
  buildVertexRequest({
    granularity: 'cover_letter',
    systemPrompt: getCoverLetterPrompt({ targetLang: 'en', wordTarget: 300 }),
    userPrompt: buildCoverLetterUserPrompt({
      jobDescription: 'Senior Engineer, Berlin',
      projection: { basics: { name: 'Jane Doe' } },
    }),
    responseSchema: getCoverLetterSchema(),
    maxOutputTokens: COVER_LETTER_MAX_OUTPUT_TOKENS,
    projectId: 'test-project',
    ...overrides,
  });

// ---------------------------------------------------------------------------
// Schema invariants
// ---------------------------------------------------------------------------

test('every object in the parsing schema requires all of its properties, recursively', () => {
  const walk = (node, trail) => {
    if (node.type === 'OBJECT' && node.properties) {
      const keys = Object.keys(node.properties).sort();
      const required = [...(node.required ?? [])].sort();
      assert.deepEqual(
        required,
        keys,
        `schema node "${trail}" must require every property (Gemini omits non-required ones)`,
      );
      for (const [key, child] of Object.entries(node.properties)) walk(child, `${trail}.${key}`);
    } else if (node.type === 'ARRAY' && node.items) {
      walk(node.items, `${trail}[]`);
    }
  };
  walk(PARSING_SCHEMA, '$');
});

/**
 * ⚠️ The assertion the first cover-letter schema shipped without. `buildItemSchema` spreads
 * `{ ...FIELD_DEFS[fieldKey] }`, so a composition naming a field the registry
 * does not define emits `{}` — a node with no `type`. It typechecks and it
 * lints. Measured on 2026-09-05 (gemini-3.5-flash-lite, the EU REP endpoint):
 * Vertex does NOT reject that node — it accepts the request and the model picks
 * the shape, returning a string where an object was wanted. So the failure is
 * silent, which is the stronger reason for this walk. What the endpoint does
 * reject, with INVALID_ARGUMENT, is a `required` entry naming no property and
 * an ARRAY without `items`; both are walked below. Every section, not just the
 * one that broke.
 *
 * ⚠️ **"Typed" was not enough, and the first version of this test checked only
 * that.** Deleting a composition entry outright — say
 * `TRANSLATION_COMPOSITION.coverLetter` — leaves `fields = []`, and the builder
 * then emits `{"type":"OBJECT","properties":{},"required":[]}`: a node that has
 * a type, has no children, and asks the model for an object with nothing in it.
 * The walk terminated on it, satisfied. So an OBJECT must also carry properties
 * and a non-empty `required` — the discipline the parsing schema has had since
 * 2026-08-02 and the improvement schemas never did.
 */
/** `google.cloud.aiplatform.v1.Type` — anything else is INVALID_ARGUMENT. */
const VERTEX_SCHEMA_TYPES = ['OBJECT', 'ARRAY', 'STRING', 'NUMBER', 'INTEGER', 'BOOLEAN'];

test('every schema node is typed, populated and required — improvement, parsing and the letter', () => {
  const walk = (node, trail) => {
    assert.ok(
      node?.type,
      `schema node "${trail}" has no "type" — Vertex lets the model choose its shape`,
    );
    assert.ok(
      VERTEX_SCHEMA_TYPES.includes(node.type),
      `schema node "${trail}" has type "${node.type}", outside Vertex's enum — it rejects that`,
    );

    if (node.type === 'OBJECT') {
      const keys = Object.keys(node.properties ?? {});
      assert.ok(
        keys.length > 0,
        `OBJECT node "${trail}" has no properties — its composition entry is missing, and it asks the model for an empty object`,
      );
      assert.ok(
        Array.isArray(node.required) && node.required.length > 0,
        `OBJECT node "${trail}" requires nothing, so Gemini may omit every field in it`,
      );
      for (const name of node.required) {
        assert.ok(
          keys.includes(name),
          `OBJECT node "${trail}" requires "${name}", which it does not define — Vertex rejects that`,
        );
      }
      for (const [key, child] of Object.entries(node.properties)) walk(child, `${trail}.${key}`);
    }

    if (node.type === 'ARRAY') {
      assert.ok(node.items, `ARRAY node "${trail}" has no "items" — Vertex rejects that`);
      walk(node.items, `${trail}[]`);
    }
  };

  const sections = Object.keys(SECTION_COMPOSITION);
  assert.ok(sections.length > 5, 'the composition table parsed as empty');

  for (const section of sections) {
    for (const isTranslating of [false, true]) {
      walk(
        getVertexResponseSchema('section', [section], false, [], isTranslating),
        `section:${section}${isTranslating ? ' (translating)' : ''}`,
      );
    }
  }
  for (const isTranslating of [false, true]) {
    const suffix = isTranslating ? ' (translating)' : '';
    walk(getVertexResponseSchema('cv', WHOLE_CV_SECTIONS, false, [], isTranslating), `cv${suffix}`);
    walk(
      getVertexResponseSchema('section', [CUSTOM_TOKEN], false, [], isTranslating),
      `section:${CUSTOM_TOKEN}${suffix}`,
    );
    walk(
      getVertexResponseSchema('item', [CUSTOM_TOKEN], false, [], isTranslating),
      `item:${CUSTOM_TOKEN}${suffix}`,
    );
  }
  walk(getVertexResponseSchema('section', ['skills'], true, [], false), 'section:skills (reorg)');
  walk(getCoverLetterSchema(), 'cover letter');
  // The parsing walk above checks `required` equals the keys; this one adds the
  // type, the non-empty OBJECT and the itemless ARRAY it does not look for.
  walk(PARSING_SCHEMA, 'parsing');
});

/**
 * The three response shapes, each pinned where it needs no spawn. The store half
 * of this round trip is
 * `src/store/resume/slices/ai/suggestions/__tests__/coverLetterImprove.test.ts`.
 */
test('a singleton section answers with its fields alone, and no _vId to echo', () => {
  const schema = getVertexResponseSchema('section', ['coverLetter'], false, [], false);

  assert.deepEqual(Object.keys(schema.properties), ['improvedFields']);
  assert.deepEqual(schema.required, ['improvedFields']);
  assert.deepEqual(Object.keys(schema.properties.improvedFields.properties).sort(), [
    'paragraphs',
    'subject',
  ]);
  // A cover letter has no `_vId`, so requiring one asks the model to invent an
  // identifier that then matches nothing on the way back.
  assert.ok(!JSON.stringify(schema).includes('_vId'));

  // `paragraphs` must be a list of strings, or "keep the COUNT and ORDER" has
  // nothing enforcing even its type.
  const paragraphs = schema.properties.improvedFields.properties.paragraphs;
  assert.equal(paragraphs.type, 'ARRAY');
  assert.equal(paragraphs.items.type, 'STRING');
});

/**
 * The guard: `SINGLETON_SECTIONS` is the ONE criterion, and every
 * composition key answers on the section path with the shape it says. Walked
 * per key rather than stated as "the list minus itself", so a name test placed
 * ahead of the list reds here.
 */
test('every section answers on the section path with the shape its inventory says', () => {
  for (const section of Object.keys(SECTION_COMPOSITION)) {
    const schema = getVertexResponseSchema('section', [section], false, [], false);
    if (SINGLETON_SECTIONS.includes(section)) {
      assert.deepEqual(
        schema.required,
        ['improvedFields'],
        `${section} is one object and answers with its fields alone`,
      );
      assert.ok(!JSON.stringify(schema).includes('_vId'), `${section} has no item to identify`);
    } else {
      assert.equal(schema.properties.items?.type, 'ARRAY', `${section} is a list`);
      assert.deepEqual(schema.properties.items.items.required, ['_vId', 'improvedFields']);
    }
  }
  // Pinned, not derived — the walk above is vacuous for an empty list. Measured
  // 2026-09-08, AI_LOGIC.md § Three response shapes.
  assert.deepEqual(SINGLETON_SECTIONS, ['basics', 'coverLetter']);
});

/**
 * ⚠️ A recorded trap, made impossible rather than avoided: a `required` naming a
 * property the schema lacks must never reach the wire. `requiredSectionsFor`
 * reads `WHOLE_CV_SECTIONS`, so a payload's letter is not named, and a name the
 * schema lacks is a throw rather than a silent filter.
 */
test('a whole-CV run requires what the payload has, and never a property it lacks', () => {
  const wanted = requiredSectionsFor({
    basics: { label: 'Engineer' },
    work: [],
    education: [{ _vId: 'e1', institution: 'TU' }],
    coverLetter: { subject: 'Hi', paragraphs: ['a'] },
  });
  assert.deepEqual(wanted, ['basics', 'education']);

  // The caller's list wins over the computed one — an empty `work` is not required.
  const schema = getVertexResponseSchema('cv', WHOLE_CV_SECTIONS, false, wanted, false);
  assert.deepEqual(schema.required, ['basics', 'education']);

  assert.throws(
    () => getVertexResponseSchema('cv', ['basics'], false, ['basics', 'education'], false),
    /UNKNOWN_REQUIRED_SECTION: education/,
  );

  assert.deepEqual(requiredSectionsFor(null), []);
});

/**
 * A custom section is addressed by its token, never by a composition key, and
 * answers in the list shape. Its heading comes back only from a translation:
 * Improve rewrites entries, never the name the user gave the section.
 */
test('a custom section answers in the list shape, with its heading only when translating', () => {
  const improve = getVertexResponseSchema('section', [CUSTOM_TOKEN], false, [], false);
  assert.deepEqual(improve.required, ['items']);
  assert.deepEqual(improve.properties.items.items.required, ['_vId', 'improvedFields']);
  assert.deepEqual(
    Object.keys(improve.properties.items.items.properties.improvedFields.properties),
    CUSTOM_SECTION_ITEM_COMPOSITION,
  );

  const translate = getVertexResponseSchema('section', [CUSTOM_TOKEN], false, [], true);
  assert.deepEqual(translate.required, ['title', 'items']);

  const item = getVertexResponseSchema('item', [CUSTOM_TOKEN], false, [], false);
  assert.deepEqual(item.required, ['_vId', 'improvedFields']);

  const cv = (isTranslating) =>
    getVertexResponseSchema(
      'cv',
      WHOLE_CV_SECTIONS,
      false,
      requiredSectionsFor({ customSections: [{ id: 'a', title: 'T', items: [] }] }),
      isTranslating,
    );
  assert.deepEqual(cv(false).required, [CUSTOM_SECTIONS_KEY]);
  // Matched back by `id`: a section has no `_vId`.
  assert.deepEqual(cv(false).properties.customSections.items.required, ['id', 'items']);
  assert.deepEqual(cv(true).properties.customSections.items.required, ['id', 'title', 'items']);

  assert.deepEqual(requiredSectionsFor({ customSections: [] }), []);
});

/**
 * ⚠️ Stated as what a whole-CV run MUST carry, not as "the targets minus
 * `SINGLETON_SECTIONS`". Both sides of that subtraction derive from the same
 * list, so it would hold while the list deleted any section at all — including
 * `basics`, whose removal drops the professional summary from every full-CV
 * Improve with every suite green.
 */
test('a whole-CV run carries basics and every list section, and not the letter', () => {
  const schema = getVertexResponseSchema('cv', WHOLE_CV_SECTIONS, false, [], false);
  const properties = Object.keys(schema.properties);

  assert.ok(properties.includes('basics'), 'a whole-CV run must still improve the summary');
  for (const section of ['work', 'education', 'skills', 'projects', 'publications']) {
    assert.ok(properties.includes(section), `a whole-CV run must still improve ${section}`);
  }
  // The letter is left out because it gets its own call, after the CV it
  // echoes — and handing it to the cv loop anyway is a programming error.
  assert.ok(!WHOLE_CV_SECTIONS.includes('coverLetter'));
  assert.ok(!properties.includes('coverLetter'));
  assert.throws(
    () => getVertexResponseSchema('cv', [...WHOLE_CV_SECTIONS, 'coverLetter'], false, [], false),
    /NOT_A_WHOLE_CV_SECTION: coverLetter/,
  );
});

/**
 * One shape per object section on every path: the whole-CV slot follows the
 * inventory as the section path does. Measured 2026-10-12 before the move,
 * AI_LOGIC.md § Three response shapes.
 */
test('every whole-CV slot has the shape its inventory says', () => {
  const schema = getVertexResponseSchema('cv', WHOLE_CV_SECTIONS, false, [], false);
  for (const section of WHOLE_CV_SECTIONS) {
    if (section === CUSTOM_SECTIONS_KEY) continue;
    const slot = schema.properties[section];
    if (SINGLETON_SECTIONS.includes(section)) {
      assert.deepEqual(slot.required, ['improvedFields'], `${section} answers with its fields`);
      assert.ok(!JSON.stringify(slot).includes('_vId'), `${section} has no item to identify`);
    } else {
      assert.equal(slot.type, 'ARRAY', `${section} is a list`);
      assert.deepEqual(slot.items.required, ['_vId', 'improvedFields']);
    }
  }
  assert.ok(WHOLE_CV_SECTIONS.includes('basics'), 'the walk above must reach a singleton');
});

test('the mock answers the whole-CV run in the wire shape', () => {
  const schema = getVertexResponseSchema('cv', WHOLE_CV_SECTIONS, false, [], false);
  const mock = buildMockAIResult('cv', {
    basics: { label: 'Engineer', summary: 'Builds payment systems.' },
    work: [{ _vId: 'w1', position: 'Engineer' }],
    coverLetter: { subject: 'Application', paragraphs: ['Dear team,'] },
  });

  assert.ok(Object.keys(mock).length > 0, 'the mock answered nothing');
  for (const [section, value] of Object.entries(mock)) {
    const slot = schema.properties[section];
    assert.ok(slot, `the mock answers "${section}", which the schema does not carry`);
    assert.deepEqual(Object.keys(value), slot.required, `the mock's ${section} is off the wire`);
  }
});

test('the parsing schema covers every PARSING_COMPOSITION section', () => {
  assert.deepEqual(
    Object.keys(PARSING_SCHEMA.properties).sort(),
    Object.keys(PARSING_COMPOSITION).sort(),
  );
});

// ---------------------------------------------------------------------------
// Request shape: parsing
// ---------------------------------------------------------------------------

test('PDF parsing sends the file inline plus an instruction part', () => {
  const { body } = parseRequest();
  const parts = body.contents[0].parts;
  assert.equal(parts.length, 2);
  assert.equal(parts[0].inline_data.mime_type, 'application/pdf');
  assert.match(parts[1].text, /^INSTRUCTIONS: /);
});

test('text parsing sends the raw text and instructions in one part', () => {
  const { body } = parseRequest({ fileBase64: undefined, fileType: undefined, text: 'Jane Doe' });
  const parts = body.contents[0].parts;
  assert.equal(parts.length, 1);
  assert.match(parts[0].text, /RAW TEXT DATA:\nJane Doe/);
});

test('parsing runs near-deterministic and on the parsing model', () => {
  const { body, url, model } = parseRequest();
  assert.equal(body.generationConfig.temperature, 0.1);
  assert.equal(model, VERTEX_CONFIG.PARSING_MODEL);
  assert.ok(url.includes(`/models/${VERTEX_CONFIG.PARSING_MODEL}:generateContent`));
  assert.ok(url.includes(VERTEX_CONFIG.API_HOST));
});

test('parsing prompt mandates completeness and carries no condensing rules', () => {
  const { systemPrompt } = parseRequest();
  assert.match(systemPrompt, /Completeness beats brevity/);
  assert.match(systemPrompt, /NO LENGTH LIMITS/);
  assert.doesNotMatch(systemPrompt, /Max 400 characters/);
  assert.doesNotMatch(systemPrompt, /One-Line/);
});

// ---------------------------------------------------------------------------
// Request shape: improvement
// ---------------------------------------------------------------------------

test('improvement uses the improvement model and default temperature', () => {
  const { body, url, model } = improveRequest();
  assert.equal(model, VERTEX_CONFIG.MODEL);
  assert.ok(url.includes(`/models/${VERTEX_CONFIG.MODEL}:generateContent`));
  assert.equal('temperature' in body.generationConfig, false);
});

test('improvement embeds the sanitized resume data in the user prompt', () => {
  const { userPrompt } = improveRequest();
  assert.match(userPrompt, /DATA TO IMPROVE \(cv\)/);
  assert.match(userPrompt, /"position":"Engineer"/);
});

test('improvement prompts forbid invented metrics', () => {
  for (const target of ['cv', 'item:work', 'section:work']) {
    const prompt = getSystemPrompt('professional', target, 'en', 'en', false, null);
    assert.match(prompt, /never invent a number/i, `target ${target}`);
  }
});

// Tailoring matches the ad's terms and holds only the facts a reader checks (#55).
// An import with the job_description style nests the same clause as OPTIMIZATION STYLE.
test('tailoring matches the ad and names held titles, employers and dates as facts', () => {
  const prompts = [
    ...['cv', 'item:work', 'section:skills'].map((target) => [
      target,
      getSystemPrompt('job_description', target, 'en', 'en', false, null),
    ]),
    ['import', getSystemPrompt('job_description', 'cv', 'en', undefined, false, 'cv_parsing')],
  ];
  for (const [where, prompt] of prompts) {
    const facts = prompt.match(/\*\*Facts are fixed:\*\* ([^.]*)\./)?.[1];
    assert.equal(
      facts,
      'employer names, the job title held in each work entry, dates, certifications, and years of experience',
      where,
    );
    // Naming tools or keywords as facts stopped tailoring from matching the ad at all.
    assert.doesNotMatch(facts, /tools|technologies|skill keywords/, where);
    assert.match(prompt, /headline label is a positioning statement, not a title held/, where);
    assert.match(prompt, /a related tool is not the same tool/, where);
  }
  // Coverage is a whole-CV instruction: the other targets and the import do not reach every entry.
  const rewriteEvery = /Rewrite every work entry the job description bears on/;
  for (const [where, prompt] of prompts) {
    (where === 'cv' ? assert.match : assert.doesNotMatch)(prompt, rewriteEvery, where);
  }
  const imported = prompts.at(-1)[1];
  assert.ok(
    imported.indexOf('### OPTIMIZATION STYLE') < imported.indexOf('Facts are fixed'),
    'import nests the clause under OPTIMIZATION STYLE',
  );
});

test('the request body always carries schema-constrained JSON output', () => {
  for (const { body } of [parseRequest(), improveRequest()]) {
    assert.equal(body.generationConfig.response_mime_type, 'application/json');
    assert.ok(body.generationConfig.response_schema);
    assert.equal(body.systemInstruction.parts[0].text.length > 0, true);
  }
});

// ---------------------------------------------------------------------------
// Language rules
// ---------------------------------------------------------------------------

test('a differing target language turns the prompt into a translation task', () => {
  const { systemPrompt } = improveRequest({ targetLang: 'de' });
  assert.match(systemPrompt, /TRANSLATE ALL provided content into German/);
});

test('a matching target language normalizes instead of translating', () => {
  const { systemPrompt } = improveRequest({ targetLang: 'en' });
  assert.doesNotMatch(systemPrompt, /TRANSLATE ALL/);
  assert.match(systemPrompt, /Rewrite every improved field in English/);
});

// ---------------------------------------------------------------------------
// Prompt and schema snapshots — coupled to PROMPT_VERSION
// ---------------------------------------------------------------------------

for (const { kind, name, file: fileName, build } of ALL_SNAPSHOTS) {
  test(`${kind} snapshot: ${name}`, () => {
    const file = path.join(SNAPSHOT_DIR, fileName);
    let stored;
    try {
      stored = readFileSync(file, 'utf8');
    } catch {
      assert.fail(
        `missing snapshot ${file} — run: node tests/netlify-functions/regen-prompt-snapshots.mjs`,
      );
    }
    const [versionLine, ...rest] = stored.split('\n');
    const snapshotVersion = versionLine.replace('PROMPT_VERSION: ', '');
    const snapshotText = rest.join('\n');

    assert.equal(
      snapshotVersion,
      PROMPT_VERSION,
      'snapshot was taken under a different PROMPT_VERSION — regenerate snapshots',
    );
    assert.equal(
      build(),
      snapshotText,
      `${kind} "${name}" changed. If intended: bump PROMPT_VERSION in ` +
        'netlify/functions/lib/ai/constants.js, then run ' +
        'node tests/netlify-functions/regen-prompt-snapshots.mjs',
    );
  });
}

// ---------------------------------------------------------------------------
// Output budget
// ---------------------------------------------------------------------------

test('no call carries an output budget unless one is passed', () => {
  for (const { body } of [parseRequest(), improveRequest()]) {
    assert.equal('maxOutputTokens' in body.generationConfig, false);
  }
});

test('a passed budget lands in generationConfig verbatim', () => {
  const { body } = improveRequest({ maxOutputTokens: COVER_LETTER_MAX_OUTPUT_TOKENS });
  assert.equal(body.generationConfig.maxOutputTokens, COVER_LETTER_MAX_OUTPUT_TOKENS);
});

test('the letter budget is an integer derived above the word cap', () => {
  assert.ok(Number.isInteger(COVER_LETTER_MAX_OUTPUT_TOKENS));
  // Fewer than two tokens a word cannot hold a German letter at the cap.
  assert.ok(COVER_LETTER_MAX_OUTPUT_TOKENS >= COVER_LETTER_MAX_WORDS * 2);
});

// ---------------------------------------------------------------------------
// Request shape: the cover letter
// ---------------------------------------------------------------------------

/**
 * ⚠️ The letter's role is deliberately NOT in `BASE_ROLE_PROMPTS`, and
 * `getSystemPrompt` does not refuse an unknown mode — it falls back to
 * `professional`. So a letter call that let the request derive its own prompts
 * would ship the resume-writer role, with `GLOBAL_FORMATTING_RULES` rule 2
 * forbidding the new prose a letter is, and nothing would fail. The seam is
 * what prevents that; this asserts the seam is used.
 */
test('the letter call sends the prompts it was handed, not derived ones', () => {
  const { body, systemPrompt, userPrompt } = letterRequest();

  assert.equal(body.systemInstruction.parts[0].text, systemPrompt);
  assert.match(systemPrompt, /expert Cover Letter Writer/);
  assert.doesNotMatch(systemPrompt, /expert Resume Writer/);

  assert.equal(body.contents[0].parts.length, 1);
  assert.equal(body.contents[0].parts[0].text, userPrompt);
  assert.match(userPrompt, /^JOB DESCRIPTION:/);
  // The DATA TO IMPROVE turn is the derived one, and it would carry the whole
  // CV rather than `projectForCoverLetter`'s reduction.
  assert.doesNotMatch(userPrompt, /DATA TO IMPROVE/);
  assert.match(userPrompt, /CV DATA \(the only source of facts\)/);
});

test('the letter call carries the letter schema and the letter budget', () => {
  const { body, model } = letterRequest();

  assert.deepEqual(body.generationConfig.response_schema, getCoverLetterSchema());
  assert.equal(body.generationConfig.response_mime_type, 'application/json');
  assert.equal(body.generationConfig.maxOutputTokens, COVER_LETTER_MAX_OUTPUT_TOKENS);
  // The improvement model, not the parsing one, and no temperature: the default
  // is what every letter measured on 2026-09-05 was written at.
  assert.equal(model, VERTEX_CONFIG.MODEL);
  assert.equal('temperature' in body.generationConfig, false);
});

/**
 * Half a pair is the dangerous half. A caller-supplied system prompt with a
 * derived user turn sends `DATA TO IMPROVE (cover_letter): undefined` to a role
 * that never asked for it — a well-formed request, a plausible answer, and no
 * failure anywhere.
 */
test('a system prompt without a user turn is refused, and the reverse too', () => {
  assert.throws(() => letterRequest({ userPrompt: undefined }), /INCOMPLETE_PROMPT_PAIR/);
  assert.throws(() => letterRequest({ systemPrompt: undefined }), /INCOMPLETE_PROMPT_PAIR/);
});

test('a call that supplies no prompts still derives both', () => {
  const { systemPrompt, userPrompt } = improveRequest();
  assert.match(systemPrompt, /expert Resume Writer/);
  assert.match(userPrompt, /DATA TO IMPROVE/);
});
