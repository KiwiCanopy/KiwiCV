import assert from 'node:assert/strict';
import test from 'node:test';

process.env.VITE_SUPABASE_URL = 'https://project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const { handler } = await import('../../netlify/functions/delete-user.mjs');

const CALLER_ID = '11111111-1111-4111-8111-111111111111';
const VICTIM_ID = '22222222-2222-4222-8222-222222222222';

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
 * Stands in for the Supabase REST surface. `GET /auth/v1/user` resolves the
 * bearer token; `DELETE /auth/v1/admin/users/<id>` is the destructive call
 * whose target we care about.
 */
function supabaseMock({ tokenIsValid = true } = {}) {
  const calls = [];
  return {
    calls,
    fetch: async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = init.method || (typeof input === 'string' ? 'GET' : input.method) || 'GET';
      calls.push({ url, method });

      if (url.includes('/auth/v1/admin/users/')) {
        return jsonResponse(200, { user: null });
      }
      if (url.includes('/auth/v1/user')) {
        return tokenIsValid
          ? jsonResponse(200, { id: CALLER_ID, aud: 'authenticated' })
          : jsonResponse(401, { message: 'invalid claim: missing sub claim' });
      }
      return jsonResponse(200, {});
    },
  };
}

test('rejects a request with no Authorization header without touching Supabase', async (context) => {
  const mock = supabaseMock();
  context.mock.method(globalThis, 'fetch', mock.fetch);

  const response = await handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify({ userId: VICTIM_ID }),
  });

  assert.equal(response.statusCode, 401);
  assert.equal(mock.calls.length, 0, 'no Supabase call may be made for an unauthenticated request');
});

test('rejects an invalid bearer token before deleting anything', async (context) => {
  const mock = supabaseMock({ tokenIsValid: false });
  context.mock.method(globalThis, 'fetch', mock.fetch);

  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer forged-token' },
    body: JSON.stringify({ userId: VICTIM_ID }),
  });

  assert.equal(response.statusCode, 401);
  assert.ok(
    !mock.calls.some((call) => call.url.includes('/admin/users/')),
    'an invalid token must not reach the admin delete endpoint',
  );
});

test('deletes the token holder, never the id supplied in the body', async (context) => {
  const mock = supabaseMock();
  context.mock.method(globalThis, 'fetch', mock.fetch);

  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer valid-token' },
    // A caller naming someone else's account. The body is not an input.
    body: JSON.stringify({ userId: VICTIM_ID }),
  });

  assert.equal(response.statusCode, 200);

  const deleteCall = mock.calls.find((call) => call.url.includes('/admin/users/'));
  assert.ok(deleteCall, 'the delete must actually be issued');
  assert.ok(
    deleteCall.url.includes(CALLER_ID),
    `expected the verified caller ${CALLER_ID} in ${deleteCall.url}`,
  );
  assert.ok(
    !deleteCall.url.includes(VICTIM_ID),
    'the body-supplied id must never reach the admin delete endpoint',
  );
});

test('answers the CORS preflight with the Authorization header allowed', async () => {
  const response = await handler({ httpMethod: 'OPTIONS', headers: {} });

  assert.equal(response.statusCode, 200);
  assert.match(response.headers['Access-Control-Allow-Headers'], /Authorization/);
});
