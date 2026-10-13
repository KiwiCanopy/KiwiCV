import assert from 'node:assert/strict';
import test from 'node:test';

process.env.GOOGLE_CLIENT_ID = 'test-client';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';

const { handler } = await import('../../netlify/functions/google-drive-sync.mjs');

function tokenResponse() {
  return {
    ok: true,
    json: async () => ({ access_token: 'access-token' }),
  };
}

test('rejects legacy writes and direct parent uploads before calling Drive', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async () => tokenResponse());
  const requests = [
    {
      action: 'upload',
      refreshToken: 'refresh-token',
      folderPath: ['CVCanvas', 'backups', 'en'],
      files: [],
    },
    {
      action: 'upload',
      refreshToken: 'refresh-token',
      folderPath: ['KiwiCV', 'backups', 'en'],
      parentId: 'untrusted-parent',
      files: [],
    },
    {
      action: 'resolve-folder',
      refreshToken: 'refresh-token',
      folderPath: ['CVCanvas', 'backups', 'en'],
    },
  ];

  for (const body of requests) {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify(body) });
    assert.equal(response.statusCode, 400);
  }

  assert.equal(fetchMock.mock.callCount(), requests.length);
});

function jsonResponse(data) {
  return { ok: true, json: async () => data };
}

function searchQueries(fetchMock) {
  return fetchMock.mock.calls
    .map((call) => new URL(call.arguments[0]).searchParams.get('q'))
    .filter(Boolean);
}

test('get-file escapes backslashes and quotes in the Drive search query', async (context) => {
  context.mock.method(console, 'warn', () => {});
  const fetchMock = context.mock.method(globalThis, 'fetch', async (url) => {
    if (String(url).startsWith('https://oauth2.googleapis.com/token')) return tokenResponse();
    if (String(url).includes('google-apps.folder')) {
      return jsonResponse({ files: [{ id: 'folder-id' }] });
    }
    return jsonResponse({ files: [] });
  });

  const response = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      action: 'get-file',
      refreshToken: 'refresh-token',
      folderPath: ['KiwiCV', 'backups', "O'Brien"],
      fileName: "O'Brien\\cv.json",
    }),
  });

  assert.equal(response.statusCode, 404);
  const queries = searchQueries(fetchMock);
  assert.ok(queries.some((q) => q.startsWith("name = 'O\\'Brien' and mimeType")));
  assert.ok(
    queries.includes(
      "name = 'O\\'Brien\\\\cv.json' and 'folder-id' in parents and trashed = false",
    ),
  );
});

test('get-file not-found logs never carry the user-chosen folder or file name', async (context) => {
  const warn = context.mock.method(console, 'warn', () => {});
  const folderName = 'Acme Corp Senior Engineer';
  const fileName = 'acme-application.json';

  for (const folderExists of [false, true]) {
    context.mock.method(globalThis, 'fetch', async (url) => {
      if (String(url).startsWith('https://oauth2.googleapis.com/token')) return tokenResponse();
      if (folderExists && String(url).includes('google-apps.folder')) {
        return jsonResponse({ files: [{ id: 'folder-id' }] });
      }
      return jsonResponse({ files: [] });
    });

    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        action: 'get-file',
        refreshToken: 'refresh-token',
        folderPath: ['KiwiCV', 'backups', folderName],
        fileName,
      }),
    });
    assert.equal(response.statusCode, 404);
  }

  assert.equal(warn.mock.callCount(), 2);
  for (const call of warn.mock.calls) {
    const line = call.arguments.map((arg) => JSON.stringify(arg)).join(' ');
    assert.ok(!line.includes(folderName), line);
    assert.ok(!line.includes(fileName), line);
  }
});

test('a fileId that is not a bare Drive id never reaches a Drive URL', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async () => tokenResponse());
  for (const action of ['get-file', 'delete-file']) {
    for (const fileId of ['../about', 'x?alt=media&fields=*', 'a/b']) {
      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({ action, refreshToken: 'refresh-token', fileId }),
      });
      assert.equal(response.statusCode, 400, `${action} ${fileId}`);
    }
  }
  const driveCalls = fetchMock.mock.calls.filter((call) =>
    String(call.arguments[0]).startsWith('https://www.googleapis.com/drive/'),
  );
  assert.equal(driveCalls.length, 0);
});

test('a bare Drive id is still deleted', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async (url) =>
    String(url).startsWith('https://oauth2.googleapis.com/token')
      ? tokenResponse()
      : { ok: true, status: 204, json: async () => ({}) },
  );
  const response = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      action: 'delete-file',
      refreshToken: 'refresh-token',
      fileId: '1AbC_d-9',
    }),
  });
  assert.equal(response.statusCode, 200);
  assert.ok(
    fetchMock.mock.calls.some(
      (call) => String(call.arguments[0]) === 'https://www.googleapis.com/drive/v3/files/1AbC_d-9',
    ),
  );
});

test('a failed folder creation stops instead of querying under an undefined parent', async (context) => {
  context.mock.method(console, 'error', () => {});
  const fetchMock = context.mock.method(globalThis, 'fetch', async (url, init) => {
    if (String(url).startsWith('https://oauth2.googleapis.com/token')) return tokenResponse();
    if (init?.method === 'POST') return { ok: false, status: 403, json: async () => ({}) };
    return jsonResponse({ files: [] });
  });
  const response = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      action: 'upload',
      refreshToken: 'refresh-token',
      folderPath: ['KiwiCV', 'backups', 'en'],
      files: [],
    }),
  });
  assert.notEqual(response.statusCode, 200);
  assert.ok(!searchQueries(fetchMock).some((q) => q.includes("'undefined' in parents")));
});

test('upload rejects a contentType outside the three the client sends, before touching Drive', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async () => tokenResponse());
  for (const contentType of ['application/json\r\nX-Injected: 1', 'image/svg+xml']) {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        action: 'upload',
        refreshToken: 'refresh-token',
        folderPath: ['KiwiCV', 'backups', 'en'],
        files: [{ fileName: 'cv.json', content: '{}', contentType }],
      }),
    });
    assert.equal(response.statusCode, 400, JSON.stringify(contentType));
  }
  const driveCalls = fetchMock.mock.calls.filter((call) =>
    String(call.arguments[0]).startsWith('https://www.googleapis.com/'),
  );
  assert.equal(driveCalls.length, 0);
});

test('upload still sends a PDF with its content type', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async (url) => {
    if (String(url).startsWith('https://oauth2.googleapis.com/token')) return tokenResponse();
    if (String(url).includes('google-apps.folder')) return jsonResponse({ files: [{ id: 'f' }] });
    if (String(url).includes('uploadType=multipart')) return jsonResponse({ id: 'new' });
    return jsonResponse({ files: [] });
  });
  const response = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      action: 'upload',
      refreshToken: 'refresh-token',
      folderPath: ['KiwiCV', 'backups', 'en'],
      files: [
        { fileName: 'cv.pdf', content: 'JVBERi0=', contentType: 'application/pdf', isBase64: true },
      ],
    }),
  });
  assert.equal(response.statusCode, 200);
  const upload = fetchMock.mock.calls.find((call) =>
    String(call.arguments[0]).includes('uploadType=multipart'),
  );
  assert.ok(upload.arguments[1].body.toString().includes('Content-Type: application/pdf\r\n'));
});

// The client discards a stored credential on exactly these two codes, so each
// is pinned next to the neighbouring failure that must keep its old code.
async function handshakeWith(context, { token, drive }) {
  context.mock.method(console, 'warn', () => {});
  context.mock.method(console, 'error', () => {});
  context.mock.method(globalThis, 'fetch', async (url) => {
    if (String(url).startsWith('https://oauth2.googleapis.com/token')) return token();
    return drive();
  });
  const response = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ action: 'handshake', refreshToken: 'refresh-token' }),
  });
  return { statusCode: response.statusCode, body: JSON.parse(response.body) };
}

function driveForbidden(error) {
  return () => ({ ok: false, status: 403, json: async () => ({ error }) });
}

function tokenRejected(oauthError) {
  return () => ({ ok: false, status: 400, json: async () => ({ error: oauthError }) });
}

const noDriveCall = () => assert.fail('Drive must not be called without an access token');

test('handshake reports INSUFFICIENT_SCOPE when Drive names a missing scope', async (context) => {
  for (const error of [
    { code: 403, errors: [{ reason: 'insufficientPermissions' }] },
    { code: 403, details: [{ reason: 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' }] },
  ]) {
    const result = await handshakeWith(context, {
      token: tokenResponse,
      drive: driveForbidden(error),
    });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, { success: false, error: 'INSUFFICIENT_SCOPE' });
  }
});

test('handshake keeps a quota, policy, bodiless or 401 refusal as UNAUTHORIZED', async (context) => {
  const drives = [
    driveForbidden({ code: 403, errors: [{ reason: 'userRateLimitExceeded' }] }),
    driveForbidden({ code: 403, errors: [{ reason: 'domainPolicy' }] }),
    () => ({ ok: false, status: 403, json: async () => Promise.reject(new Error('not json')) }),
    () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: { errors: [{ reason: 'insufficientPermissions' }] } }),
    }),
  ];
  for (const drive of drives) {
    const result = await handshakeWith(context, { token: tokenResponse, drive });
    assert.deepEqual(result.body, { success: false, error: 'UNAUTHORIZED' });
  }
});

test('a refresh token Google rejects as invalid_grant is reported as INVALID_GRANT', async (context) => {
  const result = await handshakeWith(context, {
    token: tokenRejected('invalid_grant'),
    drive: noDriveCall,
  });
  assert.equal(result.statusCode, 400);
  assert.deepEqual(result.body, { success: false, error: 'INVALID_GRANT' });
});

test('any other token-exchange failure stays a server error', async (context) => {
  const result = await handshakeWith(context, {
    token: tokenRejected('invalid_client'),
    drive: noDriveCall,
  });
  assert.equal(result.statusCode, 500);
  assert.notEqual(result.body.error, 'INVALID_GRANT');
});
