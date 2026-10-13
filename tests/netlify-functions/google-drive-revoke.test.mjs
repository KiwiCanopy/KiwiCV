import assert from 'node:assert/strict';
import test from 'node:test';

process.env.GOOGLE_CLIENT_ID = 'test-client';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';

const { handler } = await import('../../netlify/functions/google-drive-sync.mjs');

function call(body) {
  return handler({ httpMethod: 'POST', body: JSON.stringify(body) });
}

test('revokes the grant without first exchanging the token', async (context) => {
  const calls = [];
  context.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    calls.push({ url, body: init.body });
    return { ok: true, status: 200, json: async () => ({}) };
  });

  const response = await call({ action: 'revoke', refreshToken: 'refresh-token' });

  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).success, true);

  // Exactly one outbound call, and it is the revoke endpoint. Going through
  // getAccessToken first would fail for the very tokens a user most wants to
  // disconnect — already expired, already revoked at Google.
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /oauth2\.googleapis\.com\/revoke$/);
  assert.match(calls[0].body, /token=refresh-token/);
});

test('treats an already-invalid token as successfully disconnected', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: 'invalid_token' }),
  }));

  const response = await call({ action: 'revoke', refreshToken: 'stale-token' });

  // Google answers 400 for a token that is already invalid. The user's intent
  // is satisfied, so reporting failure would only invite a pointless retry.
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).success, true);
});

test('reports a real revoke failure rather than claiming success', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 500,
    json: async () => ({}),
  }));

  const response = await call({ action: 'revoke', refreshToken: 'refresh-token' });

  const payload = JSON.parse(response.body);
  assert.equal(payload.success, false);
  assert.equal(payload.error, 'REVOKE_FAILED');
});

test('still requires a token to revoke', async () => {
  const response = await call({ action: 'revoke' });
  assert.equal(response.statusCode, 400);
});
