/**
 * Node 24 quotes the input in some `JSON.parse` messages (`Unexpected token 'J',
 * "Jane Doe s"... is not valid JSON`), so the AI workers must log a parse failure
 * without the error object. Both workers run on the real Vertex path, and
 * every console line they write is checked for the CV text that failed to parse —
 * including a Vertex error body and a malformed Vertex envelope that quote it.
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { test } from 'node:test';
import { format } from 'node:util';

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

const { describeJsonParseError } = await import('../../netlify/functions/lib/json-parse-error.js');
const { describeDbError, describeError } =
  await import('../../netlify/functions/lib/describe-error.js');
const { handler: improveHandler } =
  await import('../../netlify/functions/improve-cv-background.mjs');
const { handler: parseHandler } = await import('../../netlify/functions/parse-cv-background.mjs');
const { usageLedger } = await import('./usage-ledger.mjs');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const CV_TEXT = 'Jane Doe senior engineer at ACME';

const parseError = (input) => {
  try {
    JSON.parse(input);
  } catch (error) {
    return error;
  }
  throw new Error('expected a parse failure');
};

const jsonResponse = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  headers: new Headers({ 'content-type': 'application/json' }),
  text: async () => JSON.stringify(payload),
  json: async () => payload,
});

/** A response whose body is `text` verbatim; `json()` rejects as a real `Response` would. */
const rawResponse = (status, text) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  headers: new Headers({ 'content-type': 'application/json' }),
  text: async () => text,
  json: async () => JSON.parse(text),
});

/**
 * A network where Vertex answers `vertexText` verbatim, or `vertexResponse` whole,
 * and the job payload is `jobPayload`.
 */
const stubNetwork = (context, { vertexText, vertexResponse, jobPayload = {} }) => {
  const jobUpdates = [];
  const ledger = usageLedger();
  context.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || 'GET';
    if (url.includes('/rest/v1/rpc/reserve_ai_usage') || url.includes('/rest/v1/usage_logs')) {
      return jsonResponse(...ledger.respond(url, method, JSON.parse(init.body || 'null')));
    }
    if (url.includes('oauth2.googleapis.com/token')) {
      return jsonResponse(200, { access_token: 'access-token' });
    }
    if (url.includes('aiplatform')) {
      if (vertexResponse) return vertexResponse;
      return jsonResponse(200, {
        candidates: [{ content: { parts: [{ text: vertexText }] }, finishReason: 'STOP' }],
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20 },
      });
    }
    if (url.includes('/auth/v1/user')) return jsonResponse(200, { id: USER_ID });
    if (url.includes('/rest/v1/profiles')) {
      return jsonResponse(200, {
        id: USER_ID,
        premium_until: new Date(Date.now() + 86400000).toISOString(),
      });
    }
    if (url.includes('/rest/v1/ai_jobs') && method === 'PATCH') {
      jobUpdates.push(JSON.parse(init.body));
      return jsonResponse(200, null);
    }
    if (url.includes('/rest/v1/ai_jobs')) return jsonResponse(200, { payload: jobPayload });
    return jsonResponse(200, {});
  });
  return jobUpdates;
};

/** Every line written to the console, formatted as Node would print it. */
const captureConsole = (context) => {
  const lines = [];
  for (const level of ['log', 'info', 'warn', 'error']) {
    context.mock.method(console, level, (...args) => lines.push(format(...args)));
  }
  return lines;
};

const assertNoCvText = (lines) => {
  assert.ok(lines.length > 0, 'the failure is logged');
  for (const line of lines) assert.ok(!line.includes('Jane'), `CV text logged: ${line}`);
};

test('the measured leak: a Node 24 parse error quotes its input', () => {
  assert.match(String(parseError(CV_TEXT)), /Jane Doe/);
});

test('describeJsonParseError keeps the name, the length and a content-free position', () => {
  const truncated = `{"summary": "${CV_TEXT}`;
  assert.deepEqual(describeJsonParseError(parseError(truncated), truncated), {
    name: 'SyntaxError',
    inputLength: truncated.length,
    position: truncated.length,
  });
  // The quoting message has no trailing position; nothing is read out of it.
  assert.deepEqual(describeJsonParseError(parseError(CV_TEXT), CV_TEXT), {
    name: 'SyntaxError',
    inputLength: CV_TEXT.length,
    position: null,
  });
  assert.deepEqual(describeJsonParseError(undefined, undefined), {
    name: 'Error',
    inputLength: null,
    position: null,
  });
});

test('improve: an unparseable model response is logged without its text', async (context) => {
  const jobUpdates = stubNetwork(context, { vertexText: CV_TEXT });
  const lines = captureConsole(context);

  await improveHandler({
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({
      jobId: JOB_ID,
      mode: 'improve',
      currentLang: 'en',
      activeTarget: 'item:work:w1',
      resumeData: { _vId: 'w1', position: 'Engineer', summary: 'Ran reconciliation.' },
    }),
  });

  assert.equal(jobUpdates.at(-1)?.error, 'INVALID_AI_RESPONSE_FORMAT');
  assertNoCvText(lines);
});

test('improve: an unparseable request body is logged without its text and returns 200', async (context) => {
  stubNetwork(context, { vertexText: '{}' });
  const lines = captureConsole(context);

  const response = await improveHandler({
    headers: { authorization: 'Bearer token' },
    body: CV_TEXT,
  });

  assert.equal(response.statusCode, 200, 'a non-2xx makes Netlify re-fire the worker');
  assertNoCvText(lines);
});

test('parse: an unparseable model response is logged without its text', async (context) => {
  const jobUpdates = stubNetwork(context, {
    vertexText: CV_TEXT,
    jobPayload: { text: 'Résumé text', mode: 'parse' },
  });
  const lines = captureConsole(context);

  await parseHandler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ jobId: JOB_ID }),
  });

  assert.equal(jobUpdates.at(-1)?.error, 'INVALID_AI_RESPONSE_FORMAT');
  assertNoCvText(lines);
});

test('parse: an unparseable request body is logged without its text', async (context) => {
  stubNetwork(context, { vertexText: '{}' });
  const lines = captureConsole(context);

  await parseHandler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
    body: CV_TEXT,
  });
  assertNoCvText(lines);
});

test('the measured leak: a Node 24 Response.json() rejection quotes its body', async () => {
  await assert.rejects(new Response(CV_TEXT).json(), /Jane Doe/);
});

test('describeError keeps the leading code, never the text after it', () => {
  const vertexFailure = Object.assign(new Error('VERTEX_REQUEST_FAILED: 400'), { status: 400 });
  assert.deepEqual(describeError(vertexFailure), {
    name: 'Error',
    code: 'VERTEX_REQUEST_FAILED',
    status: 400,
  });
  assert.deepEqual(describeError(new Error(`USAGE_LOG_INSERT_FAILED: ${CV_TEXT}`)), {
    name: 'Error',
    code: 'USAGE_LOG_INSERT_FAILED',
  });
  assert.deepEqual(describeError(new Error('LIMIT_REACHED')), {
    name: 'Error',
    code: 'LIMIT_REACHED',
  });
  assert.deepEqual(describeError(parseError(CV_TEXT)), {
    name: 'SyntaxError',
    code: 'UNCLASSIFIED_ERROR',
  });
  assert.deepEqual(describeError(new Error(`${CV_TEXT}: REALLY`)).code, 'UNCLASSIFIED_ERROR');
  assert.deepEqual(describeError(undefined), { name: 'Error', code: 'UNCLASSIFIED_ERROR' });
  assert.deepEqual(describeError({ message: 'X', status: '500' }), { name: 'Error', code: 'X' });
});

test('describeDbError drops the PostgREST details that quote the failing row', () => {
  const rowError = {
    code: '23514',
    message: 'new row for relation "ai_jobs" violates check constraint "ai_jobs_status_check"',
    details: `Failing row contains (${CV_TEXT}).`,
    hint: null,
  };
  assert.deepEqual(describeDbError(rowError), { code: rowError.code, message: rowError.message });
  assert.deepEqual(describeDbError(null), { code: null, message: null });
});

const VERTEX_4XX_BODY = JSON.stringify({
  error: {
    code: 400,
    message: `Invalid JSON payload received. Unknown name "x" at "${CV_TEXT}"`,
    status: 'INVALID_ARGUMENT',
  },
});

const vertexFailures = [
  {
    label: 'a Vertex 4xx body quoting the request',
    response: () => rawResponse(400, VERTEX_4XX_BODY),
    code: 'VERTEX_REQUEST_FAILED: 400',
  },
  {
    label: 'a malformed Vertex envelope',
    response: () => rawResponse(200, CV_TEXT),
    code: 'INVALID_VERTEX_ENVELOPE',
  },
  {
    label: 'a truncated Vertex envelope',
    response: () => rawResponse(200, `{"candidates":[{"content":{"parts":[{"text":"${CV_TEXT}`),
    code: 'INVALID_VERTEX_ENVELOPE',
  },
];

for (const { label, response, code } of vertexFailures) {
  test(`improve: ${label} is logged without its text`, async (context) => {
    const jobUpdates = stubNetwork(context, { vertexResponse: response() });
    const lines = captureConsole(context);

    const result = await improveHandler({
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        jobId: JOB_ID,
        mode: 'improve',
        currentLang: 'en',
        activeTarget: 'item:work:w1',
        resumeData: { _vId: 'w1', position: 'Engineer', summary: 'Ran reconciliation.' },
      }),
    });

    assertNoCvText(lines);
    assert.equal(result.statusCode, 200);
    assert.equal(jobUpdates.at(-1)?.error, code);
  });

  test(`parse: ${label} is logged without its text`, async (context) => {
    const jobUpdates = stubNetwork(context, {
      vertexResponse: response(),
      jobPayload: { text: 'Résumé text', mode: 'parse' },
    });
    const lines = captureConsole(context);

    const result = await parseHandler({
      httpMethod: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({ jobId: JOB_ID }),
    });

    assertNoCvText(lines);
    assert.equal(result.statusCode, 200);
    assert.equal(jobUpdates.at(-1)?.error, code);
  });
}

test("a Vertex 4xx logs its HTTP status and Google's structured status", async (context) => {
  stubNetwork(context, { vertexResponse: rawResponse(400, VERTEX_4XX_BODY) });
  const lines = captureConsole(context);

  await parseHandler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ jobId: JOB_ID }),
  });

  assert.ok(
    lines.some((line) => /httpStatus: 400/.test(line) && /INVALID_ARGUMENT/.test(line)),
    lines.join('\n'),
  );
});
