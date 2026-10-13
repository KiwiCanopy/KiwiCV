/**
 * What the improve and import workers check on a response Vertex did return,
 * before it is graded or billed: truncation, translation completeness, the
 * facts tailoring may not change, and the skill keywords it may not drop.
 * The pure checks first, then each through the real worker with Vertex stubbed
 * at `fetch`, so the call site is pinned as well as the callee.
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { test } from 'node:test';

import { SECTION_COMPOSITION } from '../../netlify/functions/lib/ai/definitions.js';
import {
  TAILORING_FACT_FIELDS,
  assertNotTruncated,
  assertTranslationComplete,
  dropTailoringFactChanges,
  isTruncated,
  restoreDroppedSkillKeywords,
  translationCoverage,
} from '../../netlify/functions/lib/ai/responseChecks.js';

const quiet = (context) => context.mock.method(console, 'warn', () => {});

// ---------------------------------------------------------------------------
// Truncation
// ---------------------------------------------------------------------------

test('a MAX_TOKENS candidate is AI_RESPONSE_TRUNCATED', () => {
  assert.throws(() => assertNotTruncated({ finishReason: 'MAX_TOKENS' }), {
    message: 'AI_RESPONSE_TRUNCATED',
  });
});

test('isTruncated reads the output cap and nothing else', () => {
  assert.deepEqual(
    ['MAX_TOKENS', 'STOP', 'SAFETY', undefined].map((finishReason) =>
      isTruncated({ finishReason }),
    ),
    [true, false, false, false],
  );
});

test('a STOP candidate, or none, passes', () => {
  assert.doesNotThrow(() => assertNotTruncated({ finishReason: 'STOP' }));
  assert.doesNotThrow(() => assertNotTruncated(undefined));
});

// ---------------------------------------------------------------------------
// Translation completeness
// ---------------------------------------------------------------------------

const SOURCE = {
  basics: { label: 'Engineer', summary: 'Builds things.' },
  work: [
    { _vId: 'w1', position: 'Engineer' },
    { _vId: 'w2', position: 'Developer' },
  ],
  awards: [],
  skills: [
    { _vId: 's1', name: 'Go', keywords: [] },
    { _vId: 's2', name: 'Payments', keywords: ['SEPA'] },
  ],
  customSections: [{ id: 'c1', title: 'Talks', items: [{ _vId: 't1', name: 'GoConf' }] }],
};

const answered = (items) => items.map(({ _vId }) => ({ _vId, improvedFields: {} }));

const FULL = {
  basics: { improvedFields: { label: 'Ingenieur', summary: 'Baut Dinge.' } },
  work: answered(SOURCE.work),
  skills: answered(SOURCE.skills),
  customSections: [
    { id: 'c1', title: 'Vorträge', items: answered(SOURCE.customSections[0].items) },
  ],
};

const coverageOf = (improved, allowReorg = false) =>
  Object.fromEntries(
    translationCoverage({ source: SOURCE, improved, allowReorg }).map(
      ({ section, matched, total }) => [section, `${matched}/${total}`],
    ),
  );

test('a full translation covers every section it was sent, empty lists excluded', () => {
  assert.deepEqual(coverageOf(FULL), {
    basics: '1/1',
    work: '2/2',
    skills: '2/2',
    customSections: '2/2',
  });
  assert.doesNotThrow(() =>
    assertTranslationComplete({ source: SOURCE, improved: FULL, allowReorg: false }),
  );
});

test('a list section answered short is TRANSLATION_INCOMPLETE, logged as counts only', (context) => {
  const warn = quiet(context);
  const improved = { ...FULL, work: answered(SOURCE.work.slice(0, 1)) };
  assert.throws(() => assertTranslationComplete({ source: SOURCE, improved, allowReorg: false }), {
    message: 'TRANSLATION_INCOMPLETE',
  });
  assert.equal(warn.mock.calls[0].arguments[0], '[Translation] incomplete: work 1/2');
});

test('an entry naming an id the source lacks does not count', () => {
  const improved = {
    ...FULL,
    work: [...answered([SOURCE.work[0]]), { _vId: 'x', improvedFields: {} }],
  };
  assert.equal(coverageOf(improved).work, '1/2');
});

test('id-less entries count by position, the rule the merge applies', () => {
  const improved = { ...FULL, work: [{ improvedFields: {} }, { improvedFields: {} }] };
  assert.equal(coverageOf(improved).work, '2/2');
});

test('a shorter id-less list counts nothing, so a partial answer is never complete', () => {
  const improved = { ...FULL, work: [{ improvedFields: {} }] };
  assert.equal(coverageOf(improved).work, '0/2');
});

test('a missing singleton section is incomplete', () => {
  const { basics: _basics, ...improved } = FULL;
  assert.equal(coverageOf(improved).basics, '0/1');
});

test('a custom section missing, or short of entries, is incomplete', () => {
  assert.equal(coverageOf({ ...FULL, customSections: [] }).customSections, '0/2');
  assert.equal(
    coverageOf({ ...FULL, customSections: [{ id: 'c1', title: 'Vorträge', items: [] }] })
      .customSections,
    '1/2',
  );
});

test('a reorganised skills list covers a source skill through _sourceVIds', () => {
  const both = [{ name: 'Alles', keywords: [], _sourceVIds: ['s1', 's2'] }];
  assert.equal(coverageOf({ ...FULL, skills: both }, true).skills, '2/2');
  const one = [{ name: 'Go', keywords: [], _sourceVIds: ['s1'] }];
  assert.equal(coverageOf({ ...FULL, skills: one }, true).skills, '1/2');
});

// ---------------------------------------------------------------------------
// Tailoring facts
// ---------------------------------------------------------------------------

const TAILOR_SOURCE = {
  basics: { label: 'Software Architect', summary: 'Designs systems.' },
  work: [
    { _vId: 'w1', name: 'Northwind', position: 'Architect', startDate: '2020-01', endDate: '' },
  ],
};

test('a retitled label, position, employer or date is dropped; other fields survive', () => {
  const improved = {
    basics: { improvedFields: { label: 'ML Engineer', summary: 'Designs ML systems.' } },
    work: [
      {
        _vId: 'w1',
        improvedFields: {
          name: 'Contoso',
          position: 'ML Engineer',
          startDate: '2019-01',
          endDate: '2024-01',
          summary: 'Built pipelines.',
        },
      },
    ],
  };
  assert.equal(dropTailoringFactChanges({ source: TAILOR_SOURCE, improved }), 5);
  assert.deepEqual(improved, {
    basics: { improvedFields: { summary: 'Designs ML systems.' } },
    work: [{ _vId: 'w1', improvedFields: { summary: 'Built pipelines.' } }],
  });
});

test('an unchanged fact is not counted as a dropped change', () => {
  const improved = { basics: { improvedFields: { label: 'Software Architect' } } };
  assert.equal(dropTailoringFactChanges({ source: TAILOR_SOURCE, improved }), 0);
});

// ---------------------------------------------------------------------------
// Skill keywords
// ---------------------------------------------------------------------------

const SKILLS = [
  { _vId: 's1', name: 'Data', keywords: ['Postgres', 'k8s', 'Photo Editing', 'Next.js'] },
  { _vId: 's2', name: 'Cloud', keywords: ['Cloud Governance'] },
];

test('a dropped keyword is re-appended to its own entry, at the end', () => {
  const improved = {
    items: [
      { _vId: 's1', improvedFields: { keywords: ['PostgreSQL', 'Kubernetes', 'next.js'] } },
      { _vId: 's2', improvedFields: { keywords: [] } },
    ],
  };
  const restored = restoreDroppedSkillKeywords({
    granularity: 'section',
    sectionKey: 'skills',
    source: SKILLS,
    improved,
    allowReorg: false,
  });
  assert.equal(restored, 4);
  // `next.js` is kept once, case-insensitively; a rename with no alias comes back beside it.
  assert.deepEqual(
    improved.items.map((item) => item.improvedFields.keywords),
    [
      ['PostgreSQL', 'Kubernetes', 'next.js', 'Postgres', 'k8s', 'Photo Editing'],
      ['Cloud Governance'],
    ],
  );
});

test('an item run restores into its own fields, whatever _vId it echoed', () => {
  const improved = { _vId: 'mangled', improvedFields: { keywords: ['PostgreSQL'] } };
  restoreDroppedSkillKeywords({
    granularity: 'item',
    sectionKey: 'skills',
    source: SKILLS[0],
    improved,
    allowReorg: false,
  });
  assert.deepEqual(improved.improvedFields.keywords, [
    'PostgreSQL',
    'Postgres',
    'k8s',
    'Photo Editing',
    'Next.js',
  ]);
});

test('every tailoring fact is a field its section composes', () => {
  const stray = Object.entries(TAILORING_FACT_FIELDS).flatMap(([section, fields]) =>
    fields
      .filter((field) => !(SECTION_COMPOSITION[section] || []).includes(field))
      .map((field) => `${section}.${field}`),
  );
  assert.ok(Object.keys(TAILORING_FACT_FIELDS).length > 0);
  assert.deepEqual(stray, []);
});

test('a response that keeps every keyword is left as it is', () => {
  const keywords = ['Postgres', 'K8S', 'photo editing', 'Next.js', 'Docker'];
  const improved = { improvedFields: { keywords: [...keywords] } };
  assert.equal(
    restoreDroppedSkillKeywords({
      granularity: 'item',
      sectionKey: 'skills',
      source: SKILLS[0],
      improved,
      allowReorg: false,
    }),
    0,
  );
  assert.deepEqual(improved.improvedFields.keywords, keywords);
});

test('a whole-CV run restores keywords in skills and touches no other section', () => {
  const improved = {
    skills: [{ _vId: 's2', improvedFields: { keywords: ['Governance'] } }],
    interests: [{ _vId: 'i1', improvedFields: { keywords: [] } }],
  };
  restoreDroppedSkillKeywords({
    granularity: 'cv',
    sectionKey: '',
    source: { skills: SKILLS, interests: [{ _vId: 'i1', keywords: ['Chess'] }] },
    improved,
    allowReorg: false,
  });
  assert.deepEqual(improved.skills[0].improvedFields.keywords, ['Governance', 'Cloud Governance']);
  assert.deepEqual(improved.interests[0].improvedFields.keywords, []);
});

test('a section run on another section is untouched', () => {
  const improved = { items: [{ _vId: 's1', improvedFields: { keywords: [] } }] };
  restoreDroppedSkillKeywords({
    granularity: 'section',
    sectionKey: 'interests',
    source: SKILLS,
    improved,
    allowReorg: false,
  });
  assert.deepEqual(improved.items[0].improvedFields.keywords, []);
});

test('under reorg a keyword kept in any group counts; a missing one rejoins its source group', () => {
  const improved = {
    items: [
      { name: 'Databases', keywords: ['PostgreSQL', 'next.js'], _sourceVIds: ['s1'] },
      {
        name: 'Platform',
        keywords: ['Kubernetes', 'Cloud Governance', 'k8s'],
        _sourceVIds: ['s2'],
      },
    ],
  };
  restoreDroppedSkillKeywords({
    granularity: 'section',
    sectionKey: 'skills',
    source: SKILLS,
    improved,
    allowReorg: true,
  });
  assert.deepEqual(
    improved.items.map((item) => item.keywords),
    [
      ['PostgreSQL', 'next.js', 'Postgres', 'Photo Editing'],
      ['Kubernetes', 'Cloud Governance', 'k8s'],
    ],
  );
});

test('under reorg a source group no item names comes back as its own group', () => {
  const improved = {
    skills: [{ name: 'Data', keywords: SKILLS[0].keywords, _sourceVIds: ['s1'] }],
  };
  restoreDroppedSkillKeywords({
    granularity: 'cv',
    sectionKey: '',
    source: { skills: SKILLS },
    improved,
    allowReorg: true,
  });
  assert.deepEqual(improved.skills[1], {
    name: 'Cloud',
    keywords: ['Cloud Governance'],
    _sourceVIds: ['s2'],
  });
});

test('under reorg a group whose keywords all moved elsewhere is not resurrected', () => {
  const improved = {
    skills: [
      {
        name: 'Everything',
        keywords: [...SKILLS[0].keywords, 'Cloud Governance'],
        _sourceVIds: ['s1'],
      },
    ],
  };
  restoreDroppedSkillKeywords({
    granularity: 'cv',
    sectionKey: '',
    source: { skills: SKILLS },
    improved,
    allowReorg: true,
  });
  assert.equal(improved.skills.length, 1);
});

// ---------------------------------------------------------------------------
// Through the workers, with Vertex stubbed at fetch
// ---------------------------------------------------------------------------

process.env.VITE_SUPABASE_URL = 'https://project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({
  client_email: 'worker@test.iam.gserviceaccount.com',
  project_id: 'test-project',
  private_key: generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({
    type: 'pkcs8',
    format: 'pem',
  }),
});

const { handler: improveHandler } =
  await import('../../netlify/functions/improve-cv-background.mjs');
const { handler: parseHandler } = await import('../../netlify/functions/parse-cv-background.mjs');
const { usageLedger } = await import('./usage-ledger.mjs');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';

const json = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  headers: new Headers({ 'content-type': 'application/json' }),
  text: async () => JSON.stringify(payload),
  json: async () => payload,
});

/** Supabase and Vertex at `fetch`: Vertex answers `response` with `finishReason`. */
const stubFetch = (context, { response, finishReason = 'STOP', jobPayload = null }) => {
  const ledger = usageLedger();
  const state = {
    get usageRows() {
      return ledger.billed();
    },
    jobUpdates: [],
    vertexCalls: 0,
  };
  context.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || 'GET';
    const body =
      typeof init.body === 'string' && init.body.startsWith('{') ? JSON.parse(init.body) : null;
    if (url.startsWith('https://oauth2.googleapis.com/token')) {
      return json(200, { access_token: 'vertex-token' });
    }
    if (url.includes('aiplatform')) {
      state.vertexCalls += 1;
      return json(200, {
        candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(response) }] } }],
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200 },
      });
    }
    if (url.includes('/auth/v1/user')) return json(200, { id: USER_ID, aud: 'authenticated' });
    if (url.includes('/rest/v1/profiles')) {
      return json(200, {
        id: USER_ID,
        premium_until: new Date(Date.now() + 86400000).toISOString(),
      });
    }
    const usageAnswer = ledger.respond(url, method, body);
    if (usageAnswer) return json(...usageAnswer);
    if (url.includes('/rest/v1/ai_jobs') && method === 'PATCH') {
      state.jobUpdates.push(body);
      return json(200, null);
    }
    if (url.includes('/rest/v1/ai_jobs')) return json(200, { payload: jobPayload });
    return json(200, {});
  });
  return state;
};

const improve = async (context, { response, finishReason, ...body }) => {
  const state = stubFetch(context, { response, finishReason });
  context.mock.method(console, 'warn', () => {});
  await improveHandler({
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({
      jobId: JOB_ID,
      activeTarget: 'cv',
      mode: 'job_description',
      instructions: 'Adjust to match this job description: ML Engineer.',
      currentLang: 'en',
      ...body,
    }),
  });
  const last = state.jobUpdates.at(-1) || {};
  return { ...state, status: last.status, result: last.result, error: last.error };
};

test('worker: a truncated improve response fails the job and bills nothing', async (context) => {
  const run = await improve(context, {
    resumeData: TAILOR_SOURCE,
    response: { basics: { improvedFields: { summary: 'Cut' } } },
    finishReason: 'MAX_TOKENS',
  });
  assert.equal(run.vertexCalls, 1);
  assert.equal(run.status, 'failed');
  assert.equal(run.error, 'AI_RESPONSE_TRUNCATED');
  assert.equal(run.usageRows.length, 0);
});

test('worker: a short translation fails the job and bills nothing', async (context) => {
  const run = await improve(context, {
    mode: 'professional',
    targetLang: 'de',
    resumeData: SOURCE,
    response: { ...FULL, work: answered(SOURCE.work.slice(1)) },
  });
  assert.equal(run.status, 'failed');
  assert.equal(run.error, 'TRANSLATION_INCOMPLETE');
  assert.equal(run.usageRows.length, 0);
});

test('worker: a complete translation completes, translated title and all', async (context) => {
  const run = await improve(context, {
    targetLang: 'de',
    resumeData: SOURCE,
    response: FULL,
  });
  assert.equal(run.status, 'completed');
  assert.equal(run.usageRows.length, 1);
  // A translating tailoring run keeps its translated label: the facts guard skips it.
  assert.equal(run.result.basics.improvedFields.label, 'Ingenieur');
});

test('worker: tailoring drops a retitled label and keeps the rewritten summary', async (context) => {
  const run = await improve(context, {
    resumeData: TAILOR_SOURCE,
    response: {
      basics: { improvedFields: { label: 'ML Engineer', summary: 'Designs ML systems.' } },
      work: [{ _vId: 'w1', improvedFields: { position: 'ML Engineer', summary: 'Built ML.' } }],
    },
  });
  assert.equal(run.status, 'completed');
  assert.deepEqual(run.result.basics, { improvedFields: { summary: 'Designs ML systems.' } });
  assert.deepEqual(run.result.work, [{ _vId: 'w1', improvedFields: { summary: 'Built ML.' } }]);
});

test('worker: a label-only retitle grades as no change once dropped', async (context) => {
  const run = await improve(context, {
    resumeData: TAILOR_SOURCE,
    response: { basics: { improvedFields: { label: 'ML Engineer' } } },
  });
  assert.equal(run.result.isNoOp, true);
});

test('worker: a professional run is not held to the tailoring facts', async (context) => {
  const run = await improve(context, {
    mode: 'professional',
    resumeData: TAILOR_SOURCE,
    response: { basics: { improvedFields: { label: 'Principal Architect' } } },
  });
  assert.equal(run.result.basics.improvedFields.label, 'Principal Architect');
});

test('worker: tailoring a skills section puts dropped keywords back', async (context) => {
  const run = await improve(context, {
    activeTarget: 'section:skills',
    resumeData: SKILLS,
    response: {
      items: [
        { _vId: 's1', improvedFields: { keywords: ['PostgreSQL', 'Kubernetes'] } },
        { _vId: 's2', improvedFields: { keywords: ['Cloud Governance'] } },
      ],
    },
  });
  assert.deepEqual(run.result.items[0].improvedFields.keywords, [
    'PostgreSQL',
    'Kubernetes',
    'Postgres',
    'k8s',
    'Photo Editing',
    'Next.js',
  ]);
});

test('worker: a translating skills run is not merged back', async (context) => {
  const run = await improve(context, {
    targetLang: 'de',
    resumeData: { skills: SKILLS },
    response: {
      skills: [
        { _vId: 's1', improvedFields: { keywords: ['Bildbearbeitung'] } },
        { _vId: 's2', improvedFields: { keywords: ['Cloud-Governance'] } },
      ],
    },
  });
  assert.equal(run.status, 'completed');
  assert.deepEqual(run.result.skills[0].improvedFields.keywords, ['Bildbearbeitung']);
});

test('worker: a truncated import fails the job and bills nothing', async (context) => {
  const state = stubFetch(context, {
    response: { basics: { name: 'Cut' } },
    finishReason: 'MAX_TOKENS',
    jobPayload: { text: 'Jane Doe, Engineer.', mode: 'parse_import', currentLang: 'en' },
  });
  context.mock.method(console, 'warn', () => {});
  await parseHandler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ jobId: JOB_ID }),
  });
  assert.equal(state.vertexCalls, 1);
  assert.equal(state.jobUpdates.at(-1).status, 'failed');
  assert.equal(state.jobUpdates.at(-1).error, 'AI_RESPONSE_TRUNCATED');
  assert.equal(state.usageRows.length, 0);
});
