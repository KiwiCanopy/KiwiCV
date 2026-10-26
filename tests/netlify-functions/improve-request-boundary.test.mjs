/**
 * The improve worker's request boundary, driven through the real handler on the
 * real Vertex path: `mock` is off, a throwaway service-account key signs the
 * JWT, and one stubbed `fetch` answers Supabase, the Google token exchange and
 * Vertex alike. So the tests see every request the worker would make — the
 * allowance read, the usage row, and the exact body Vertex would be sent.
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

process.env.VITE_SUPABASE_URL = 'https://project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({
  client_email: 'test@test-project.iam.gserviceaccount.com',
  project_id: 'test-project',
  private_key: generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  }).privateKey,
});
delete process.env.GOOGLE_PROJECT_ID;

const { handler } = await import('../../netlify/functions/improve-cv-background.mjs');
const { REFUSED_TARGETS } = await import('./ai-target-tables.mjs');
const { WHOLE_CV_SECTIONS } = await import('../../netlify/functions/lib/ai/definitions.js');
const { usageLedger } = await import('./usage-ledger.mjs');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: new Headers({ 'content-type': 'application/json' }),
    text: async () => JSON.stringify(payload),
    json: async () => payload,
  };
}

/** Every outbound request, and a canned answer for each the worker makes. */
function network(vertexAnswer) {
  const ledger = usageLedger();
  const state = {
    calls: [],
    get usageRows() {
      return ledger.billed();
    },
    jobUpdates: [],
    jobUpdateUrls: [],
    vertexBodies: [],
  };

  state.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || (typeof input === 'string' ? 'GET' : input.method) || 'GET';
    state.calls.push(`${method} ${new URL(url).host}${new URL(url).pathname}`);

    if (url.includes('oauth2.googleapis.com/token')) {
      return jsonResponse(200, { access_token: 'access-token' });
    }
    if (url.includes('aiplatform')) {
      state.vertexBodies.push(JSON.parse(init.body));
      return jsonResponse(200, {
        candidates: [
          {
            content: { parts: [{ text: JSON.stringify(vertexAnswer) }] },
            finishReason: 'STOP',
            safetyRatings: [],
          },
        ],
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20 },
      });
    }

    const body = init.body ? JSON.parse(init.body) : null;
    if (url.includes('/auth/v1/user')) {
      return jsonResponse(200, { id: USER_ID, aud: 'authenticated' });
    }
    if (url.includes('/rest/v1/profiles')) {
      return jsonResponse(200, {
        id: USER_ID,
        account_tier: 'pro',
        premium_until: new Date(Date.now() + 86400000).toISOString(),
      });
    }
    const usageAnswer = ledger.respond(url, method, body);
    if (usageAnswer) return jsonResponse(...usageAnswer);
    if (url.includes('/rest/v1/ai_jobs') && method === 'PATCH') {
      state.jobUpdateUrls.push(url);
      state.jobUpdates.push(body);
      return jsonResponse(200, null);
    }
    return jsonResponse(200, {});
  };

  return state;
}

const run = async (
  context,
  request,
  vertexAnswer = {},
  headers = { authorization: 'Bearer token' },
) => {
  const net = network(vertexAnswer);
  context.mock.method(globalThis, 'fetch', net.fetch);
  const errors = context.mock.method(console, 'error', () => {});
  const warnings = context.mock.method(console, 'warn', () => {});

  await handler({
    headers,
    body: JSON.stringify({ jobId: JOB_ID, mode: 'improve', currentLang: 'en', ...request }),
  });

  const last = net.jobUpdates.at(-1) || {};
  const firstArgs = (spy) => spy.mock.calls.map((call) => String(call.arguments[0]));
  return {
    ...net,
    status: last.status,
    jobError: last.error,
    errorLogs: firstArgs(errors),
    warnLogs: firstArgs(warnings),
  };
};

// ---------------------------------------------------------------------------
// A target no composition serves is refused at the boundary
// ---------------------------------------------------------------------------

const WORK_ENTRY = { _vId: 'w1', position: 'Engineer', summary: 'Ran reconciliation.' };

/**
 * Non-vacuity for every refusal below: the same harness, on a real list entry,
 * does reach Vertex and does bill — so "no Vertex call" is an observation.
 */
test('an item run on a list entry reaches Vertex and is billed', async (context) => {
  const net = await run(
    context,
    { activeTarget: 'item:work:w1', resumeData: WORK_ENTRY },
    {
      _vId: 'w1',
      improvedFields: { summary: 'Ran daily reconciliation across four ledgers.' },
    },
  );

  assert.equal(net.status, 'completed');
  assert.ok(net.calls.some((call) => call.includes('aiplatform')));
  assert.equal(net.usageRows.length, 1);
  assert.equal(net.usageRows[0].request_type, 'cv_item_optimize');
});

test('the legacy job_id spelling still names the job', async (context) => {
  const net = await run(
    context,
    { jobId: undefined, job_id: JOB_ID, activeTarget: 'item:work:w1', resumeData: WORK_ENTRY },
    { _vId: 'w1', improvedFields: { summary: 'Ran daily reconciliation.' } },
  );

  assert.equal(net.status, 'completed');
  assert.equal(net.usageRows.length, 1);
});

test('an item run on a custom section entry is a list entry too', async (context) => {
  const net = await run(
    context,
    { activeTarget: 'item:custom:3f2b8c1e-0000-4000-8000-000000000001:c1', resumeData: WORK_ENTRY },
    { _vId: 'c1', improvedFields: { summary: 'Ran daily reconciliation.' } },
  );

  assert.equal(net.status, 'completed');
  assert.equal(net.usageRows.length, 1);
});

// An imported id can be free text; the usage row records the aggregate.
for (const [activeTarget, recorded] of [
  ['item:work:Acme Corp', 'item:work'],
  ['item:custom:Jane Doe:Acme Corp', 'item:custom'],
]) {
  test(`${activeTarget} is billed as ${recorded}, without its ids`, async (context) => {
    const net = await run(
      context,
      { activeTarget, resumeData: { ...WORK_ENTRY, _vId: 'Acme Corp' } },
      { _vId: 'Acme Corp', improvedFields: { summary: 'Ran daily reconciliation.' } },
    );

    assert.equal(net.status, 'completed');
    assert.equal(net.usageRows.length, 1);
    assert.equal(net.usageRows[0].details.context.activeTarget, recorded);
    const row = JSON.stringify(net.usageRows[0]);
    assert.ok(!row.includes('Acme') && !row.includes('Jane'), row);
  });
}

// The mode is caller text too: a free-text mode still runs, on the `professional`
// fallback, and is billed as unknown.
const FREE_TEXT_MODE = `Jane Doe, Acme Corp ${'x'.repeat(10_000)}`;
for (const [mode, recorded] of [
  [FREE_TEXT_MODE, 'unknown'],
  ['professional', 'professional'],
  ['job_description', 'job_description'],
  ['custom', 'custom'],
  ['translate_close', 'translate_close'],
]) {
  test(`a run in mode ${recorded === 'unknown' ? 'free text' : mode} is billed as ${recorded}`, async (context) => {
    const net = await run(
      context,
      { mode, activeTarget: 'item:work:w1', resumeData: WORK_ENTRY },
      { _vId: 'w1', improvedFields: { summary: 'Ran daily reconciliation.' } },
    );

    assert.equal(net.status, 'completed');
    assert.equal(net.usageRows.length, 1);
    assert.equal(net.usageRows[0].details.context.mode, recorded);
    const row = JSON.stringify(net.usageRows[0]);
    assert.ok(!row.includes('Jane') && !row.includes('Acme'), row.slice(0, 200));
    assert.ok(row.length < 2000, `usage row is ${row.length} chars`);
  });
}

/** The whole outbound traffic of a refused run: the token check, then the failed job row. */
const REFUSAL_CALLS = [
  'GET project.supabase.co/auth/v1/user',
  'PATCH project.supabase.co/rest/v1/ai_jobs',
];

for (const activeTarget of REFUSED_TARGETS) {
  test(`${activeTarget} is refused before quota, usage or Vertex`, async (context) => {
    const net = await run(context, { activeTarget, resumeData: { label: 'Engineer' } });

    assert.equal(net.status, 'failed');
    assert.equal(net.jobError, 'INVALID_TARGET');
    assert.deepEqual(net.calls, REFUSAL_CALLS);
    // Warned as a rejection, not logged again as a fault with its stack.
    assert.ok(!net.errorLogs.includes('Improve CV Error:'), net.errorLogs.join(' | '));
    assert.ok(net.warnLogs.some((line) => line.startsWith('[AI-REJECTION] INVALID_TARGET')));
  });
}

test('a letter-only run on a section is refused before quota, usage or Vertex', async (context) => {
  const net = await run(context, {
    activeTarget: 'section:work',
    resumeData: [WORK_ENTRY],
    coverLetterOnly: true,
    coverLetter: {
      jobDescription: 'Senior Engineer, Berlin.',
      targetLang: 'en',
      wordTarget: 300,
      tone: 'professional',
    },
  });

  assert.equal(net.jobError, 'MISSING_PARAMS');
  assert.deepEqual(net.calls, REFUSAL_CALLS);
});

// ---------------------------------------------------------------------------
// What Vertex is sent carries none of the stripped keys
// ---------------------------------------------------------------------------

/** `keysToStrip` read out of the sanitizer as text, as `aiSanitizerParity.test.ts` does. */
const strippedKeys = (() => {
  const text = readFileSync(
    new URL('../../netlify/functions/lib/ai/utils.js', import.meta.url),
    'utf8',
  );
  const start = text.indexOf('const keysToStrip = [');
  assert.notEqual(start, -1, 'no `const keysToStrip = [` in lib/ai/utils.js');
  return [...text.slice(start, text.indexOf('];', start)).matchAll(/'([^']+)'/g)].map((m) => m[1]);
})();

/**
 * Every stripped value carries a `STRIPPED-<key>` marker, so one substring search
 * over the request body finds a leak anywhere in it. `location` and `keywords`
 * appear twice: the kept shapes (an entry's city, a skill's keywords) are the
 * non-vacuity check that the CV itself was sent.
 */
const LEAKY_CV = {
  basics: {
    name: 'Alex Rivera',
    label: 'Payments Engineer',
    summary: 'Builds payment systems.',
    image: 'data:image/png;base64,STRIPPED-image',
    imageVisible: 'STRIPPED-imageVisible',
    _imageVId: 'STRIPPED-_imageVId',
    email: 'STRIPPED-email@example.com',
    phone: 'STRIPPED-phone',
    url: 'https://example.com/STRIPPED-url',
    location: { address: 'STRIPPED-location', postalCode: '10115', city: 'Berlin' },
    profiles: [{ network: 'GitHub', url: 'STRIPPED-profiles' }],
  },
  work: [
    {
      _vId: 'w1',
      name: 'Northwind',
      position: 'Engineer',
      location: 'Kept-entry-city',
      summary: 'Ran reconciliation.',
      url: 'https://northwind.example/STRIPPED-url',
      visible: 'STRIPPED-visible',
      _isNew: 'STRIPPED-_isNew',
    },
  ],
  references: [{ _vId: 'r1', name: 'STRIPPED-references' }],
  skills: [{ _vId: 's1', name: 'Payments', keywords: ['Kept-skill-keyword'] }],
  projects: [
    {
      _vId: 'p1',
      name: 'Ledger',
      description: 'Double-entry ledger.',
      roles: ['STRIPPED-roles'],
      keywords: ['STRIPPED-keywords'],
    },
  ],
  coverLetter: {
    subject: 'Application',
    paragraphs: ['Dear Hiring Team,'],
    recipient: { name: 'STRIPPED-recipient', company: 'Northwind' },
    draftedFor: 'STRIPPED-draftedFor',
    outdated: 'STRIPPED-outdated',
  },
  passthrough: { kiwitalents: { salaryExpectation: 'STRIPPED-passthrough' } },
  meta: { template: 'STRIPPED-meta' },
};

test('the leak fixture carries every key the sanitizer strips', () => {
  assert.ok(strippedKeys.length > 10, `parsed only ${strippedKeys.length} stripped keys`);
  const text = JSON.stringify(LEAKY_CV);
  assert.deepEqual(
    strippedKeys.filter((key) => !text.includes(`STRIPPED-${key}`)),
    [],
  );
});

const LETTER_BLOCK = {
  jobDescription: 'Senior Engineer, Berlin.',
  targetLang: 'en',
  wordTarget: 300,
  tone: 'professional',
};

/** `[label, request, Vertex calls it makes, facts the first call must carry]` */
const LEAK_RUNS = [
  [
    'a whole-CV run, and its cover-letter call',
    { activeTarget: 'cv', resumeData: LEAKY_CV, coverLetter: LETTER_BLOCK },
    2,
    ['Builds payment systems.', 'Kept-entry-city', 'Kept-skill-keyword'],
  ],
  [
    'a whole-CV translation run',
    { activeTarget: 'cv', resumeData: LEAKY_CV, targetLang: 'de' },
    1,
    ['Builds payment systems.', 'Kept-entry-city', 'Kept-skill-keyword'],
  ],
  [
    'a letter-only run',
    { activeTarget: 'cv', resumeData: LEAKY_CV, coverLetter: LETTER_BLOCK, coverLetterOnly: true },
    1,
    ['Builds payment systems.', 'Kept-skill-keyword'],
  ],
  [
    'a section run on basics',
    { activeTarget: 'section:basics', resumeData: LEAKY_CV.basics },
    1,
    ['Builds payment systems.'],
  ],
  [
    'an item run on a work entry',
    { activeTarget: 'item:work:w1', resumeData: LEAKY_CV.work[0] },
    1,
    ['Kept-entry-city'],
  ],
];

for (const [label, request, calls, kept] of LEAK_RUNS) {
  test(`${label} sends Vertex no stripped value`, async (context) => {
    const net = await run(context, request);

    const sent = net.vertexBodies.map((body) => JSON.stringify(body));
    assert.equal(sent.length, calls);
    for (const fact of kept) assert.ok(sent[0].includes(fact), `the CV was not sent: ${fact}`);
    for (const body of sent) assert.deepEqual(body.match(/STRIPPED-\w+/g), null);
  });
}

/**
 * The whole-CV schema's `required` list is read off the SANITIZED CV, which
 * names the same sections only while no section key is itself stripped.
 */
test('no section a whole-CV run requires is a stripped key', () => {
  assert.deepEqual(
    WHOLE_CV_SECTIONS.filter((section) => strippedKeys.includes(section)),
    [],
  );
});

/**
 * The input turn honours whole-CV membership: call 1 does not bill the letter's
 * prose as input it cannot return (−345 prompt tokens measured, AI_LOGIC.md
 * § Three response shapes). The letter-only run above still drafts from the full CV.
 */
test('a whole-CV call sends no letter', async (context) => {
  const cv = await run(context, { activeTarget: 'cv', resumeData: LEAKY_CV });
  assert.equal(cv.vertexBodies.length, 1);
  const sent = JSON.stringify(cv.vertexBodies[0].contents);
  assert.ok(sent.includes('Builds payment systems.'), 'the CV was not sent');
  assert.ok(!sent.includes('Dear Hiring Team,'), 'the letter prose reached call 1');
  assert.ok(!sent.includes('coverLetter'), 'the letter key reached call 1');
});

// ---------------------------------------------------------------------------
// The worker touches only its caller's job
// ---------------------------------------------------------------------------

test('every ai_jobs write is scoped to the authenticated caller', async (context) => {
  const ok = await run(
    context,
    { activeTarget: 'item:work:w1', resumeData: WORK_ENTRY },
    { _vId: 'w1', improvedFields: { summary: 'Ran daily reconciliation across four ledgers.' } },
  );
  const refused = await run(context, { activeTarget: 'item:basics', resumeData: {} });
  const urls = [...ok.jobUpdateUrls, ...refused.jobUpdateUrls];
  assert.ok(urls.length >= 2, 'both runs update their job');
  for (const url of urls) {
    const params = new URL(url).searchParams;
    assert.equal(params.get('id'), `eq.${JOB_ID}`);
    assert.equal(params.get('user_id'), `eq.${USER_ID}`, `unscoped write: ${url}`);
  }
});

test('an unauthenticated request writes no job at all', async (context) => {
  const net = await run(context, { activeTarget: 'cv', resumeData: {} }, {}, {});
  assert.deepEqual(net.jobUpdateUrls, []);
  assert.ok(!net.calls.some((call) => call.includes('/rest/v1/')), net.calls.join(', '));
});

test('a request body cannot switch on the mock outside dev', async (context) => {
  assert.notEqual(process.env.AI_ALLOW_MOCK, 'true');
  assert.notEqual(process.env.NETLIFY_DEV, 'true');
  const net = await run(
    context,
    { activeTarget: 'item:work:w1', resumeData: WORK_ENTRY, mock: true },
    { _vId: 'w1', improvedFields: { summary: 'Ran daily reconciliation across four ledgers.' } },
  );
  assert.equal(net.vertexBodies.length, 1, 'the real model ran, not the mock');
  assert.equal(net.usageRows[0]?.details?.is_mock, false);
});
