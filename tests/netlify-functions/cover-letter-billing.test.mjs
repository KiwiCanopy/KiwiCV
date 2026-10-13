/**
 * What a two-call job costs, through the real worker.
 *
 * | Outcome                | Slots |
 * | ---------------------- | ----- |
 * | call 1 ✓, call 2 ✓    | 2     |
 * | call 1 ✓, call 2 ✗    | 1     |
 * | call 1 ✗               | 0     |
 *
 * A slot is one `usage_logs` row — `ai_usage_count_today` counts rows and sums
 * no column — so the table above is literally a row count of settled rows, and
 * that is what these tests assert, beside no slot left held once the job ends.
 * They drive `handler` with `mock: true` over a stubbed Supabase REST surface,
 * the pattern `delete-user.test.mjs` established: no network, no module
 * mocking, and the accounting path is the real one.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.VITE_SUPABASE_URL = 'https://project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
// The worker honours `mock` only where a test or local dev opts in.
process.env.AI_ALLOW_MOCK = 'true';

const { handler } = await import('../../netlify/functions/improve-cv-background.mjs');
const { COVER_LETTER_FAILURES } = await import('../../netlify/functions/lib/ai/coverLetter.js');
const { AI_JOB_STAGE_COVER_LETTER, AI_PRO_DAILY_LIMIT } =
  await import('../../netlify/functions/lib/ai/constants.js');
const { usageLedger } = await import('./usage-ledger.mjs');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';

const RESUME = {
  basics: { name: 'Jane Doe', label: 'Engineer', summary: 'Builds payment systems.' },
  work: [{ _vId: 'w1', position: 'Engineer', summary: 'Ran reconciliation.' }],
  coverLetter: { enabled: false, subject: '', paragraphs: [] },
  meta: { template: 'professional' },
};

const LETTER_BLOCK = {
  jobDescription: 'Senior Engineer, Berlin.',
  targetLang: 'en',
  wordTarget: 300,
  tone: 'professional',
};

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

/**
 * Stands in for the Supabase REST surface the worker touches: the token
 * lookup, the profile, the allowance ledger and the job row. `ledger.billed()`
 * is the billing the tests read.
 */
function supabaseMock({ proRequestsToday = 0, failUsageInsertFor = null } = {}) {
  const ledger = usageLedger({
    requestsToday: proRequestsToday,
    failSettleFor: failUsageInsertFor,
  });
  const state = { ledger, jobUpdates: [] };

  state.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || (typeof input === 'string' ? 'GET' : input.method) || 'GET';
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
      state.jobUpdates.push(body);
      return jsonResponse(200, null);
    }
    return jsonResponse(200, {});
  };

  return state;
}

const run = async (context, overrides = {}, mockOptions = {}) => {
  const supabase = supabaseMock(mockOptions);
  context.mock.method(globalThis, 'fetch', supabase.fetch);

  const response = await handler({
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({
      jobId: JOB_ID,
      activeTarget: 'cv',
      mode: 'job_description',
      resumeData: RESUME,
      instructions: 'Adjust to match this job description: Senior Engineer, Berlin.',
      currentLang: 'en',
      mock: true,
      ...overrides,
    }),
  });

  const lastUpdate = supabase.jobUpdates.at(-1) || {};
  return {
    response,
    usageRows: supabase.ledger.billed(),
    heldRows: supabase.ledger.held(),
    // Every PATCH in order, because the stage marker is an intermediate
    // one and the outcome is the last.
    jobUpdates: supabase.jobUpdates,
    status: lastUpdate.status,
    result: lastUpdate.result || {},
    jobError: lastUpdate.error,
  };
};

// ---------------------------------------------------------------------------
// 2 / 1 / 0
// ---------------------------------------------------------------------------

test('call 1 and call 2 both succeed: two rows, one per call', async (context) => {
  const { usageRows, heldRows, status, result } = await run(context, {
    coverLetter: LETTER_BLOCK,
  });

  assert.equal(status, 'completed');
  assert.equal(usageRows.length, 2);
  assert.equal(heldRows.length, 0);
  assert.deepEqual(
    usageRows.map((row) => row.request_type),
    ['cv_full_optimize', 'cover_letter_gen'],
  );
  // The second row is the letter's own accounting, not a copy of the first.
  assert.equal(usageRows[1].details.context.granularity, 'cover_letter');
  assert.equal(usageRows[1].package_used, 'pro');

  assert.ok(result.coverLetter.improvedFields.paragraphs.length > 0);
  assert.equal(result.coverLetterError, undefined);
  assert.equal(result.isNoOp, false);
});

test('the letter fails: one row, and the tailored CV is still there', async (context) => {
  const { usageRows, heldRows, status, result } = await run(context, {
    // A letter language the prompt refuses — a failure this side of the call,
    // deterministic where a SAFETY block or a 503 is not.
    coverLetter: { ...LETTER_BLOCK, targetLang: 'kl' },
  });

  assert.equal(status, 'completed', 'a letter failure is never an error');
  assert.equal(usageRows.length, 1, 'a failed letter is not billed');
  assert.equal(heldRows.length, 0, 'the reserved letter slot is given back');
  assert.equal(usageRows[0].request_type, 'cv_full_optimize');

  assert.equal(result.coverLetterError, COVER_LETTER_FAILURES.BAD_REQUEST);
  assert.equal(result.coverLetter, undefined);
  assert.ok(result.basics.improvedFields.summary, 'the tailoring the user paid for survives');
});

test('call 1 fails: nothing is billed and the job is marked failed', async (context) => {
  const { usageRows, heldRows, status, jobError } = await run(context, {
    coverLetter: LETTER_BLOCK,
    // Rejected before either call, by the guard that bounds free text.
    instructions: 'x'.repeat(20000),
  });

  assert.equal(status, 'failed');
  assert.equal(jobError, 'INSTRUCTIONS_TOO_LONG');
  assert.equal(usageRows.length, 0);
  assert.equal(heldRows.length, 0);
});

test('a run that asks for no letter still costs exactly one', async (context) => {
  const { usageRows, heldRows, result } = await run(context);

  assert.equal(usageRows.length, 1);
  assert.equal(heldRows.length, 0);
  assert.equal(result.coverLetter, undefined);
  assert.equal(result.coverLetterError, undefined);
});

// ---------------------------------------------------------------------------
// The allowance, and the retry
// ---------------------------------------------------------------------------

/**
 * Each call reserves its own slot. Without the letter's own reservation the
 * pair bills 201 requests against a 200-request day.
 */
test('the letter is skipped rather than billed past the daily allowance', async (context) => {
  const { usageRows, status, result } = await run(
    context,
    { coverLetter: LETTER_BLOCK },
    { proRequestsToday: AI_PRO_DAILY_LIMIT - 1 },
  );

  assert.equal(status, 'completed');
  assert.equal(usageRows.length, 1, 'the CV run had the last slot; the letter had none');
  assert.equal(result.coverLetterError, COVER_LETTER_FAILURES.ALLOWANCE_SPENT);
});

test('a letter-only re-run costs one request and does not redo the CV', async (context) => {
  const { usageRows, heldRows, status, result } = await run(context, {
    coverLetter: LETTER_BLOCK,
    coverLetterOnly: true,
  });

  assert.equal(status, 'completed');
  assert.equal(usageRows.length, 1);
  assert.equal(heldRows.length, 0);
  assert.equal(usageRows[0].request_type, 'cover_letter_gen');
  assert.ok(result.coverLetter.improvedFields.paragraphs.length > 0);
  assert.equal(result.basics, undefined, 'call 1 did not run, so nothing re-tailors the CV');
  assert.equal(result.isNoOp, false);
});

test('a letter-only re-run with no letter block has nothing to run', async (context) => {
  const { status, jobError, usageRows } = await run(context, { coverLetterOnly: true });

  assert.equal(status, 'failed');
  assert.equal(jobError, 'MISSING_PARAMS');
  assert.equal(usageRows.length, 0);
});

/**
 * The letter is drawn from the CV call 1 just produced, so a section run has no
 * tailored CV to echo. Unreachable from the app's own controls; a hand-rolled
 * POST gets the notice rather than a letter written from the wrong input.
 */
test('a letter asked for on a section run is refused, and the section still improves', async (context) => {
  const { usageRows, status, result } = await run(context, {
    activeTarget: 'section:work',
    resumeData: RESUME.work,
    coverLetter: LETTER_BLOCK,
  });

  assert.equal(status, 'completed');
  assert.equal(usageRows.length, 1);
  assert.equal(usageRows[0].request_type, 'cv_section_optimize');
  assert.equal(result.coverLetterError, COVER_LETTER_FAILURES.BAD_REQUEST);
});

/**
 * ⚠️ The CV outranks the row. `settleUsageRow` throws on a write error, and
 * unhandled that would fail the whole job — losing tailoring the user already
 * paid a slot for, through the BILLING path rather than the letter path this
 * lane took such care over. The unsettled row keeps holding its slot until the
 * reservation expires; a lost CV is the run.
 */
test('a failed usage row for the letter does not destroy the tailored CV', async (context) => {
  const { usageRows, heldRows, status, result, jobError } = await run(
    context,
    { coverLetter: LETTER_BLOCK },
    { failUsageInsertFor: 'cover_letter_gen' },
  );

  assert.equal(status, 'completed');
  assert.equal(jobError, undefined);
  assert.ok(result.basics.improvedFields.summary, 'the tailored CV survives');
  assert.ok(result.coverLetter.improvedFields.paragraphs.length > 0, 'so does the letter');
  assert.deepEqual(
    usageRows.map((row) => row.request_type),
    ['cv_full_optimize'],
  );
  assert.deepEqual(
    heldRows.map((row) => row.request_type),
    ['cover_letter_gen'],
    'the delivered letter is not handed its slot back',
  );
});

/**
 * The CV call's own row is the opposite case: it is written before the letter
 * runs, and a job that cannot account for the request it just made is a job
 * that failed. That asymmetry is deliberate, so it is asserted rather than
 * assumed.
 */
test('a failed usage row for the CV call still fails the job', async (context) => {
  const { status, jobError, usageRows, heldRows } = await run(
    context,
    { coverLetter: LETTER_BLOCK },
    { failUsageInsertFor: 'cv_full_optimize' },
  );

  assert.equal(status, 'failed');
  assert.match(jobError, /USAGE_LOG_INSERT_FAILED/);
  assert.equal(usageRows.length, 0);
  assert.equal(heldRows.length, 0, 'a failed job gives its slot back');
});

/**
 * ⚠️ A failed letter must not arrive as `isNoOp`. `useAIGeneration` maps that to
 * `status: 'no_changes'`, which `AIStatusView` renders as a GREEN success panel
 * reading "no changes were needed" — with the notice never shown, because that
 * branch renders none. A letter-only retry is the reachable case: the CV is
 * untouched there by definition.
 */
test('a letter-only retry that fails is not reported as a no-op', async (context) => {
  const { status, result, usageRows, heldRows } = await run(context, {
    coverLetter: { ...LETTER_BLOCK, targetLang: 'kl' },
    coverLetterOnly: true,
  });

  assert.equal(status, 'completed');
  assert.equal(usageRows.length, 0, 'no call succeeded, so nothing is billed');
  assert.equal(heldRows.length, 0);
  assert.equal(result.coverLetterError, COVER_LETTER_FAILURES.BAD_REQUEST);
  // False although the CV genuinely changed nothing: `isNoOp` decides which
  // client branch runs, and the one it would have chosen renders no notice.
  assert.equal(result.isNoOp, false);
});

test('the result says whether a retry is worth offering', async (context) => {
  const spent = await run(
    context,
    { coverLetter: LETTER_BLOCK },
    { proRequestsToday: AI_PRO_DAILY_LIMIT - 1 },
  );
  assert.equal(spent.result.coverLetterError, COVER_LETTER_FAILURES.ALLOWANCE_SPENT);
  assert.equal(
    spent.result.coverLetterRetryable,
    false,
    'the day is spent; a retry cannot clear it',
  );
});

// ---------------------------------------------------------------------------
// The stage marker
// ---------------------------------------------------------------------------

/**
 * A two-call run writes which call is in flight into `ai_jobs.result` so the
 * poller can head the status view with it. `status` stays `processing` — it is
 * a Postgres enum and a new value there would be a migration; `result` is jsonb
 * and needs none.
 */
test('a two-call run announces the letter stage before drafting it', async (context) => {
  const { jobUpdates, status } = await run(context, { coverLetter: LETTER_BLOCK });

  assert.equal(jobUpdates.length, 2, 'the marker, then the outcome');
  assert.deepEqual(jobUpdates[0], { result: { stage: AI_JOB_STAGE_COVER_LETTER } });
  assert.equal(jobUpdates[0].status, undefined, 'the job is still processing');
  assert.equal(status, 'completed');
});

test('a run that asks for no letter writes only its outcome', async (context) => {
  const { jobUpdates } = await run(context);

  assert.equal(jobUpdates.length, 1);
  assert.equal(jobUpdates[0].status, 'completed');
});

/** A letter-only re-run has no call 1, and the client already knows that. */
test('a letter-only re-run announces no stage', async (context) => {
  const { jobUpdates } = await run(context, {
    coverLetter: LETTER_BLOCK,
    coverLetterOnly: true,
  });

  assert.equal(jobUpdates.length, 1);
  assert.equal(jobUpdates[0].status, 'completed');
});

/**
 * The two refusals resolve before the call, so there is no drafting to
 * announce — a marker there would head the view with a stage that never ran.
 */
test('a letter refused before the call announces no stage', async (context) => {
  const { jobUpdates, result } = await run(
    context,
    { coverLetter: LETTER_BLOCK },
    { proRequestsToday: AI_PRO_DAILY_LIMIT - 1 },
  );

  assert.equal(jobUpdates.length, 1);
  assert.equal(result.coverLetterError, COVER_LETTER_FAILURES.ALLOWANCE_SPENT);
});
