/**
 * The call site of `dropUnchangedSkillsReorg` (#32): a whole-CV answer whose
 * restructure changes nothing must reach the client with no skills and no
 * `isReorg`, since the client routes on the flag alone. Real Vertex path, stubbed
 * network, as in `json-parse-error-logging.test.mjs`.
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
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
const { usageLedger } = await import('./usage-ledger.mjs');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';

const jsonResponse = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  headers: new Headers({ 'content-type': 'application/json' }),
  text: async () => JSON.stringify(payload),
  json: async () => payload,
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

const RESUME = {
  basics: { name: 'Jane Doe', label: 'Engineer' },
  work: [{ _vId: 'w1', position: 'Engineer', summary: 'Ran reconciliation.' }],
  skills: [
    { _vId: 's1', name: 'Frontend', keywords: ['React'] },
    { _vId: 's2', name: 'Backend', keywords: ['Node'] },
  ],
};

const runWith = async (context, skills) => {
  const jobUpdates = stubNetwork(context, {
    vertexText: JSON.stringify({
      work: [{ _vId: 'w1', improvedFields: { position: 'Staff Engineer' } }],
      skills,
    }),
  });
  await handler({
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({
      jobId: JOB_ID,
      mode: 'professional',
      currentLang: 'en',
      activeTarget: 'cv',
      allowReorg: true,
      resumeData: RESUME,
    }),
  });
  return jobUpdates.at(-1)?.result;
};

test('an unchanged restructure is stripped, and the run still carries its real change', async (context) => {
  const result = await runWith(context, [
    { name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] },
    { name: 'Backend', keywords: ['Node'], _sourceVIds: ['s2'] },
  ]);

  assert.ok(result, 'the job completed');
  assert.equal('skills' in result, false);
  assert.equal(result.isReorg, false);
  assert.equal(result.isNoOp, false);
  assert.deepEqual(result.work, [{ _vId: 'w1', improvedFields: { position: 'Staff Engineer' } }]);
});

test('a reorder reaches the client as a restructure', async (context) => {
  const reordered = [
    { name: 'Backend', keywords: ['Node'], _sourceVIds: ['s2'] },
    { name: 'Frontend', keywords: ['React'], _sourceVIds: ['s1'] },
  ];
  const result = await runWith(context, reordered);

  assert.equal(result.isReorg, true);
  assert.deepEqual(result.skills, reordered);
});
