/**
 * The import worker reads the uploaded file from `ai_jobs.payload` and writes
 * the result back with the service-role client, which RLS does not restrict.
 * Every read and write must therefore name the caller: a job id alone
 * would let one user's request read or overwrite another user's import.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

process.env.VITE_SUPABASE_URL = 'https://project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const { handler } = await import('../../netlify/functions/parse-cv-background.mjs');

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

const run = async (context, headers) => {
  const jobUrls = [];
  context.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/auth/v1/user'))
      return jsonResponse(200, { id: USER_ID, aud: 'authenticated' });
    if (url.includes('/rest/v1/ai_jobs')) {
      jobUrls.push(`${init.method || 'GET'} ${url}`);
      // Another user's job: a query scoped to the caller finds no row.
      return jsonResponse(406, { code: 'PGRST116', message: 'no rows' });
    }
    return jsonResponse(200, {});
  });
  context.mock.method(console, 'error', () => {});
  context.mock.method(console, 'warn', () => {});
  await handler({ httpMethod: 'POST', headers, body: JSON.stringify({ jobId: JOB_ID }) });
  return jobUrls;
};

test('every ai_jobs read and write names the authenticated caller', async (context) => {
  const urls = await run(context, { authorization: 'Bearer token' });
  assert.ok(
    urls.some((u) => u.startsWith('GET')),
    'the payload is read',
  );
  assert.ok(
    urls.some((u) => u.startsWith('PATCH')),
    'the failure is written back',
  );
  for (const entry of urls) {
    const params = new URL(entry.split(' ')[1]).searchParams;
    assert.equal(params.get('id'), `eq.${JOB_ID}`);
    assert.equal(params.get('user_id'), `eq.${USER_ID}`, `unscoped: ${entry}`);
  }
});

test('an unauthenticated request touches no job', async (context) => {
  assert.deepEqual(await run(context, {}), []);
});

/**
 * The runs above cover the paths a request can reach in a test; this pins the
 * rest (the success writes, the letter stage) by reading the workers: every
 * `ai_jobs` chain names `user_id` before its statement ends.
 */
test('every ai_jobs chain in both workers names user_id', () => {
  for (const file of ['improve-cv-background.mjs', 'parse-cv-background.mjs']) {
    const source = readFileSync(
      new URL(`../../netlify/functions/${file}`, import.meta.url),
      'utf8',
    );
    const chains = source
      .split(".from('ai_jobs')")
      .slice(1)
      .map((rest) => rest.split(';')[0]);
    assert.ok(chains.length >= 3, `${file}: found ${chains.length} ai_jobs chains`);
    chains.forEach((chain, i) =>
      assert.match(
        chain,
        /\.eq\('user_id', user\.id\)/,
        `${file}: ai_jobs chain ${i + 1} is not scoped`,
      ),
    );
  }
});
