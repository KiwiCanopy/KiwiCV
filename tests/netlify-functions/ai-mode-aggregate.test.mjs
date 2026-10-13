/**
 * What `usage_logs` records as a run's mode — `details.context.mode` from the
 * improve worker, `details.mode` from the import worker: a mode the prompt
 * builder knows, else `unknown`. Both workers read it from caller-written text.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

process.env.VITE_SUPABASE_URL = 'https://project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.AI_ALLOW_MOCK = 'true';

const { BASE_ROLE_PROMPTS } = await import('../../netlify/functions/lib/ai/prompts.js');
const { UNKNOWN_TARGET, aggregateAIMode } =
  await import('../../netlify/functions/lib/ai/request.js');
const { handler: parseHandler } = await import('../../netlify/functions/parse-cv-background.mjs');
const { usageLedger } = await import('./usage-ledger.mjs');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const FREE_TEXT = `Jane Doe, Acme Corp ${'x'.repeat(10_000)}`;

/** The improve modes the app sends, and the import styles `useAIImportJob.ts` maps to. */
const APP_MODES = ['professional', 'job_description', 'custom', 'translate_close', 'parse_import'];

test('every mode the app sends is recorded as itself', () => {
  for (const mode of APP_MODES) assert.equal(aggregateAIMode(mode), mode);
  assert.deepEqual(Object.keys(BASE_ROLE_PROMPTS).sort(), [...APP_MODES].sort());
});

test("the client's improve modes are all recordable", () => {
  const source = readFileSync(
    new URL('../../src/store/ui/useFlowStore.ts', import.meta.url),
    'utf8',
  );
  const union = source.match(/export type AIPromptMode =([^;]+);/)?.[1];
  assert.ok(union, 'AIPromptMode not found');
  const modes = [...union.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.ok(modes.length >= 4, union);
  for (const mode of modes) assert.equal(aggregateAIMode(mode), mode);
});

test('anything else is recorded as unknown', () => {
  for (const mode of [
    FREE_TEXT,
    'improve',
    'Professional',
    'cover_letter',
    '',
    'toString',
    '__proto__',
    ['professional'],
    { toString: () => 'professional' },
    42,
    null,
    undefined,
  ]) {
    assert.equal(aggregateAIMode(mode), UNKNOWN_TARGET, String(mode).slice(0, 40));
  }
});

const jsonResponse = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: String(status),
  headers: new Headers({ 'content-type': 'application/json' }),
  text: async () => JSON.stringify(payload),
  json: async () => payload,
});

/** One import run against a stubbed Supabase, on the mock model; returns the usage rows. */
const runImport = async (context, mode) => {
  const ledger = usageLedger();
  const jobUpdates = [];
  context.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || 'GET';
    const body = init.body ? JSON.parse(init.body) : null;
    if (url.includes('/auth/v1/user'))
      return jsonResponse(200, { id: USER_ID, aud: 'authenticated' });
    if (url.includes('/rest/v1/ai_jobs') && method === 'GET') {
      return jsonResponse(200, {
        payload: { text: 'Jane Doe. Engineer.', mode, currentLang: 'en', mock: true },
      });
    }
    if (url.includes('/rest/v1/ai_jobs')) {
      jobUpdates.push(body);
      return jsonResponse(200, null);
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
    return jsonResponse(200, {});
  });
  context.mock.method(console, 'error', () => {});
  context.mock.method(console, 'warn', () => {});
  await parseHandler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ jobId: JOB_ID }),
  });
  assert.equal(jobUpdates.at(-1)?.status, 'completed', JSON.stringify(jobUpdates.at(-1)));
  return ledger.billed();
};

test('an import whose payload mode is free text is billed with mode unknown', async (context) => {
  const rows = await runImport(context, FREE_TEXT);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].details.mode, UNKNOWN_TARGET);
  const row = JSON.stringify(rows[0]);
  assert.ok(!row.includes('Jane') && !row.includes('Acme'), row.slice(0, 200));
});

for (const mode of ['parse_import', 'professional', 'job_description', 'custom']) {
  test(`an import in ${mode} mode is billed as ${mode}`, async (context) => {
    const rows = await runImport(context, mode);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].details.mode, mode);
  });
}
