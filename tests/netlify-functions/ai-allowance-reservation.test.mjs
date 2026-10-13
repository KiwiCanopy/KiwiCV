/**
 * The daily allowance holds however many jobs run at once: each billed call
 * reserves its slot before Vertex is reached, settles it after success, and
 * gives it back on failure. Both workers, Vertex stubbed at `fetch`, the
 * `usage_logs` table played by `usage-ledger.mjs`.
 *
 * The ledger answers one request at a time, which is the atomicity the
 * advisory lock in `reserve_ai_usage` gives the real function; what these
 * tests pin is the worker's side of it — no call before a slot, and no slot
 * kept by a call that failed.
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { test } from 'node:test';

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
const { AI_PAYWALL_CODES, AI_PRO_DAILY_LIMIT, PROMPT_VERSION, VERTEX_CONFIG } =
  await import('../../netlify/functions/lib/ai/constants.js');
const { COVER_LETTER_FAILURES } = await import('../../netlify/functions/lib/ai/coverLetter.js');
const { usageLedger } = await import('./usage-ledger.mjs');
const { createUsageHold } = await import('../../netlify/functions/lib/ai/usage.js');
const { createClient } = await import('@supabase/supabase-js');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const LAST_SLOT = AI_PRO_DAILY_LIMIT - 1;

const CV = {
  basics: { label: 'Software Architect', summary: 'Designs systems.' },
  work: [{ _vId: 'w1', name: 'Northwind', position: 'Architect', startDate: '2020-01' }],
};
const IMPROVED = { basics: { improvedFields: { summary: 'Designs resilient systems.' } } };
const LETTER_BLOCK = {
  jobDescription: 'Senior Engineer, Berlin.',
  targetLang: 'en',
  wordTarget: 300,
  tone: 'professional',
};

const json = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  headers: new Headers({ 'content-type': 'application/json' }),
  text: async () => JSON.stringify(payload),
  json: async () => payload,
});

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

/**
 * Supabase and Vertex at `fetch`. `vertex` answers the n-th Vertex call
 * (0-based) with `[status, body]`; `failReserveCall` makes the n-th
 * reservation RPC answer 500.
 */
const stubNetwork = (
  context,
  { requestsToday = 0, vertex, failReserveCall = -1, loseSettleFor = null, releaseFails = null },
) => {
  const ledger = usageLedger({ requestsToday, loseSettleFor });
  const state = { ledger, vertexCalls: 0, reserveCalls: [], jobs: new Map() };

  context.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || 'GET';
    if (url.startsWith('https://oauth2.googleapis.com/token')) {
      return json(200, { access_token: 'vertex-token' });
    }
    if (url.includes('aiplatform')) {
      const call = state.vertexCalls;
      state.vertexCalls += 1;
      // Yields, so parallel jobs all reach the network before any finishes.
      await tick();
      return json(...vertex(call));
    }
    const body =
      typeof init.body === 'string' && init.body.startsWith('{') ? JSON.parse(init.body) : null;
    if (url.includes('/rest/v1/rpc/reserve_ai_usage')) {
      state.reserveCalls.push(body);
      if (state.reserveCalls.length - 1 === failReserveCall) {
        return json(500, { message: 'connection reset' });
      }
    }
    if (releaseFails && method === 'DELETE' && url.includes('/rest/v1/usage_logs')) {
      if (releaseFails === 'reject') throw new TypeError('fetch failed');
      return json(500, { message: 'internal error' });
    }
    const usageAnswer = ledger.respond(url, method, body);
    if (usageAnswer) return json(...usageAnswer);
    if (url.includes('/auth/v1/user')) return json(200, { id: USER_ID, aud: 'authenticated' });
    if (url.includes('/rest/v1/profiles')) {
      return json(200, {
        id: USER_ID,
        premium_until: new Date(Date.now() + 86400000).toISOString(),
      });
    }
    if (url.includes('/rest/v1/ai_jobs')) {
      const jobId = new URL(url).searchParams.get('id').replace(/^eq\./, '');
      if (method === 'PATCH') {
        state.jobs.set(jobId, { ...state.jobs.get(jobId), ...body });
        return json(200, null);
      }
      return json(200, { payload: { text: 'Jane Doe, Engineer.', mode: 'parse_import' } });
    }
    return json(200, {});
  });
  context.mock.method(console, 'warn', () => {});
  context.mock.method(console, 'error', () => {});
  return state;
};

const vertexAnswer = (payload) => [
  200,
  {
    candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(payload) }] } }],
    usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20 },
  },
];
const VERTEX_DOWN = [503, { error: { code: 503, status: 'UNAVAILABLE' } }];

let jobSeq = 0;
const nextJobId = () => `22222222-2222-4222-8222-${String(++jobSeq).padStart(12, '0')}`;

const improve = async (state, request = {}) => {
  const jobId = nextJobId();
  await improveHandler({
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({
      jobId,
      activeTarget: 'cv',
      mode: 'professional',
      resumeData: CV,
      currentLang: 'en',
      ...request,
    }),
  });
  return state.jobs.get(jobId);
};

const parse = async (state) => {
  const jobId = nextJobId();
  await parseHandler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ jobId }),
  });
  return state.jobs.get(jobId);
};

// ---------------------------------------------------------------------------
// (a) Over the limit, refused before Vertex
// ---------------------------------------------------------------------------

test('improve at the limit is refused before Vertex is called', async (context) => {
  const state = stubNetwork(context, {
    requestsToday: AI_PRO_DAILY_LIMIT,
    vertex: () => vertexAnswer(IMPROVED),
  });
  const job = await improve(state);

  assert.equal(job.status, 'failed');
  assert.equal(job.error, AI_PAYWALL_CODES.LIMIT_REACHED);
  assert.equal(state.vertexCalls, 0);
  assert.equal(state.ledger.rows.length, 0);
});

test('an import at the limit is refused before Vertex is called', async (context) => {
  const state = stubNetwork(context, {
    requestsToday: AI_PRO_DAILY_LIMIT,
    vertex: () => vertexAnswer({ basics: { name: 'Jane Doe' } }),
  });
  const job = await parse(state);

  assert.equal(job.status, 'failed');
  assert.equal(job.error, AI_PAYWALL_CODES.LIMIT_REACHED);
  assert.equal(state.vertexCalls, 0);
  assert.equal(state.ledger.rows.length, 0);
});

/** The race this exists for: every job used to pass a count none had added to. */
test('parallel jobs on the last slot: one runs, the rest are refused', async (context) => {
  const state = stubNetwork(context, {
    requestsToday: LAST_SLOT,
    vertex: () => vertexAnswer(IMPROVED),
  });
  // The import answers with the improve payload too; it parses as JSON either way.
  const jobs = await Promise.all([
    improve(state),
    improve(state),
    improve(state),
    parse(state),
    parse(state),
    parse(state),
  ]);

  assert.deepEqual(jobs.map((job) => job.status).sort(), [
    'completed',
    'failed',
    'failed',
    'failed',
    'failed',
    'failed',
  ]);
  for (const job of jobs.filter((entry) => entry.status === 'failed')) {
    assert.equal(job.error, AI_PAYWALL_CODES.LIMIT_REACHED);
  }
  assert.equal(state.vertexCalls, 1);
  assert.equal(state.ledger.billed().length, 1);
  assert.equal(state.ledger.held().length, 0);
});

test('a failed reservation fails the job without calling Vertex', async (context) => {
  const state = stubNetwork(context, {
    vertex: () => vertexAnswer(IMPROVED),
    failReserveCall: 0,
  });
  const job = await improve(state);

  assert.equal(job.status, 'failed');
  assert.match(job.error, /^AI_USAGE_RESERVE_FAILED/);
  assert.equal(state.vertexCalls, 0);
});

// ---------------------------------------------------------------------------
// (b) A failed call gives its slot back
// ---------------------------------------------------------------------------

test('improve: a failed Vertex call frees the reserved slot', async (context) => {
  let down = true;
  const state = stubNetwork(context, {
    requestsToday: LAST_SLOT,
    vertex: () => (down ? VERTEX_DOWN : vertexAnswer(IMPROVED)),
  });

  const failed = await improve(state);
  assert.equal(failed.status, 'failed');
  assert.equal(state.ledger.rows.length, 0, 'the slot is released, not settled');

  down = false;
  const retried = await improve(state);
  assert.equal(retried.status, 'completed', 'the last slot is still there to spend');
  assert.equal(state.ledger.billed().length, 1);
});

test('import: a failed Vertex call frees the reserved slot', async (context) => {
  let down = true;
  const state = stubNetwork(context, {
    requestsToday: LAST_SLOT,
    vertex: () => (down ? VERTEX_DOWN : vertexAnswer({ basics: { name: 'Jane Doe' } })),
  });

  const failed = await parse(state);
  assert.equal(failed.status, 'failed');
  assert.equal(state.ledger.rows.length, 0, 'the slot is released, not settled');

  down = false;
  const retried = await parse(state);
  assert.equal(retried.status, 'completed', 'the last slot is still there to spend');
  assert.equal(state.ledger.billed().length, 1);
});

/**
 * The release deletes pending rows only. A settle that applied but whose answer
 * was lost fails the job, and the `catch` release must not un-bill the call.
 */
test('a settle whose response is lost stays billed through the release', async (context) => {
  const state = stubNetwork(context, {
    vertex: () => vertexAnswer(IMPROVED),
    loseSettleFor: 'cv_full_optimize',
  });
  const job = await improve(state);

  assert.equal(job.status, 'failed');
  assert.match(job.error, /^USAGE_LOG_INSERT_FAILED/);
  assert.deepEqual(
    state.ledger.billed().map((row) => row.request_type),
    ['cv_full_optimize'],
  );
  assert.equal(state.ledger.held().length, 0);
});

/**
 * A release that fails costs the slot until its reservation expires, never the
 * failed-job update the client polls for.
 */
for (const releaseFails of ['status', 'reject']) {
  test(`a release that fails (${releaseFails}) still marks the job failed`, async (context) => {
    const state = stubNetwork(context, { vertex: () => VERTEX_DOWN, releaseFails });
    const job = await improve(state);

    assert.equal(job?.status, 'failed');
    assert.match(job.error, /VERTEX_REQUEST_FAILED/);
    assert.equal(state.ledger.held().length, 1, 'the slot waits for its expiry and the sweep');
  });
}

test('releaseAll keeps its contract when passed unbound', async (context) => {
  const state = stubNetwork(context, { vertex: () => vertexAnswer(IMPROVED) });
  const hold = createUsageHold(
    createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY),
    USER_ID,
  );
  await hold.reserve('cv_full_optimize');
  const { releaseAll } = hold;

  await releaseAll();
  assert.equal(state.ledger.rows.length, 0);
});

test('a failed letter call frees its slot and keeps the tailored CV billed', async (context) => {
  const state = stubNetwork(context, {
    vertex: (call) => (call === 0 ? vertexAnswer(IMPROVED) : VERTEX_DOWN),
  });
  const job = await improve(state, { coverLetter: LETTER_BLOCK });

  assert.equal(job.status, 'completed');
  assert.equal(job.result.coverLetterError, COVER_LETTER_FAILURES.CALL_FAILED);
  assert.deepEqual(
    state.ledger.billed().map((row) => row.request_type),
    ['cv_full_optimize'],
  );
  assert.equal(state.ledger.held().length, 0);
});

test('a failed letter reservation is a notice, and the tailored CV survives', async (context) => {
  const state = stubNetwork(context, {
    vertex: () => vertexAnswer(IMPROVED),
    failReserveCall: 1,
  });
  const job = await improve(state, { coverLetter: LETTER_BLOCK });

  assert.equal(job.status, 'completed');
  assert.equal(job.result.coverLetterError, COVER_LETTER_FAILURES.CALL_FAILED);
  assert.ok(job.result.basics.improvedFields.summary);
  assert.equal(state.vertexCalls, 1, 'the letter is not drafted without a slot');
  assert.equal(state.ledger.billed().length, 1);
});

// ---------------------------------------------------------------------------
// (c) A successful job counts as before
// ---------------------------------------------------------------------------

test('a successful improve settles one row with what the call reported', async (context) => {
  const state = stubNetwork(context, { vertex: () => vertexAnswer(IMPROVED) });
  const job = await improve(state);

  assert.equal(job.status, 'completed');
  assert.deepEqual(state.reserveCalls, [
    { p_user_id: USER_ID, p_limit: AI_PRO_DAILY_LIMIT, p_request_type: 'cv_full_optimize' },
  ]);
  const [row] = state.ledger.billed();
  assert.equal(state.ledger.billed().length, 1);
  assert.equal(state.ledger.held().length, 0);
  assert.equal(row.request_type, 'cv_full_optimize');
  assert.equal(row.package_used, 'pro');
  assert.equal(row.tokens_input, 100);
  assert.equal(row.tokens_output, 20);
  assert.equal(row.model_used, VERTEX_CONFIG.MODEL);
  assert.equal(row.details.prompt_version, PROMPT_VERSION);
  assert.equal(row.details.region, VERTEX_CONFIG.REGION);
  assert.equal(row.details.context.granularity, 'cv');
});

test('a successful import settles one row with what the call reported', async (context) => {
  const state = stubNetwork(context, {
    vertex: () => vertexAnswer({ basics: { name: 'Jane Doe' } }),
  });
  const job = await parse(state);

  assert.equal(job.status, 'completed');
  assert.deepEqual(
    state.reserveCalls.map((call) => call.p_request_type),
    ['cv_parsing'],
  );
  const [row] = state.ledger.billed();
  assert.equal(state.ledger.billed().length, 1);
  assert.equal(state.ledger.held().length, 0);
  assert.equal(row.request_type, 'cv_parsing');
  assert.equal(row.tokens_input, 100);
  assert.equal(row.model_used, VERTEX_CONFIG.PARSING_MODEL);
  assert.equal(row.details.mode, 'parse_import');
  assert.equal(row.details.prompt_version, PROMPT_VERSION);
});

// ---------------------------------------------------------------------------
// The hold itself
// ---------------------------------------------------------------------------

test('releaseAll gives back only what was not settled, and sends no other DELETE', async (context) => {
  const state = stubNetwork(context, { vertex: () => vertexAnswer(IMPROVED) });
  const deletes = [];
  const stubbed = globalThis.fetch;
  context.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    if ((init.method || 'GET') === 'DELETE') deletes.push(String(input));
    return stubbed(input, init);
  });
  const hold = createUsageHold(
    createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY),
    USER_ID,
  );

  const settled = await hold.reserve('cv_full_optimize');
  const unsettled = await hold.reserve('cover_letter_gen');
  await hold.settle(settled, { usage: { tokens_input: 1, tokens_output: 1 }, details: {} });
  await hold.releaseAll();

  assert.equal(deletes.length, 1);
  assert.ok(deletes[0].includes(`id=eq.${unsettled}`), deletes[0]);
  assert.ok(deletes[0].includes('pending_until=not.is.null'), deletes[0]);
  assert.deepEqual(
    state.ledger.billed().map((row) => row.request_type),
    ['cv_full_optimize'],
  );
  assert.equal(state.ledger.held().length, 0);
});
