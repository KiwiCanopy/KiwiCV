import assert from 'node:assert/strict';
import test from 'node:test';

import { discoverBackups } from '../../netlify/functions/lib/google-drive-discovery.js';

function jsonResponse(data) {
  return {
    ok: true,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

test('discovers KiwiCV and CVCanvas backups without querying CV-Canvas', async (context) => {
  const queries = [];
  context.mock.method(globalThis, 'fetch', async (input) => {
    const query = new URL(String(input)).searchParams.get('q') || '';
    queries.push(query);

    if (query.includes("'root' in parents")) {
      return jsonResponse({
        files: [
          { id: 'legacy-root', name: 'CVCanvas' },
          { id: 'canonical-root', name: 'KiwiCV' },
        ],
      });
    }
    if (query.includes("'canonical-root' in parents")) {
      return jsonResponse({ files: [{ id: 'canonical-backups', name: 'backups' }] });
    }
    if (query.includes("'legacy-root' in parents")) {
      return jsonResponse({ files: [{ id: 'legacy-backups', name: 'backups' }] });
    }
    if (query.includes("'canonical-backups' in parents")) {
      return jsonResponse({ files: [{ id: 'canonical-en', name: 'en' }] });
    }
    if (query.includes("'legacy-backups' in parents")) {
      return jsonResponse({ files: [{ id: 'legacy-en', name: 'en' }] });
    }
    if (query.includes("'canonical-en' in parents")) {
      assert.match(new URL(String(input)).searchParams.get('fields'), /appProperties/);
      return jsonResponse({
        files: [
          {
            id: 'canonical-resume',
            name: 'resume.json',
            modifiedTime: '2026-07-17T12:00:00.000Z',
            appProperties: { kcvUrl0: 'https://jobs.example.com/42' },
          },
        ],
      });
    }
    if (query.includes("'legacy-en' in parents")) {
      return jsonResponse({
        files: [
          {
            id: 'legacy-resume',
            name: 'resume.json',
            modifiedTime: '2026-07-18T12:00:00.000Z',
          },
        ],
      });
    }

    throw new Error(`Unexpected query: ${query}`);
  });

  const result = await discoverBackups('access-token');

  assert.deepEqual(result.en, [
    {
      id: 'canonical-resume',
      name: 'resume.json',
      modifiedTime: '2026-07-17T12:00:00.000Z',
      driveRoot: 'KiwiCV',
      // #54: the posting link, listed without opening the file.
      appProperties: { kcvUrl0: 'https://jobs.example.com/42' },
    },
    {
      id: 'legacy-resume',
      name: 'resume.json',
      modifiedTime: '2026-07-18T12:00:00.000Z',
      driveRoot: 'CVCanvas',
    },
  ]);
  assert.equal(
    queries.some((query) => query.includes("name = 'CV-Canvas'")),
    false,
  );
});

test('returns an empty map when neither supported root exists', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => jsonResponse({ files: [] }));

  assert.deepEqual(await discoverBackups('access-token'), {});
});

test('propagates Google Drive API errors instead of treating them as empty data', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    text: async () => 'permission denied',
  }));

  await assert.rejects(
    discoverBackups('access-token'),
    /Google Drive discovery failed: permission denied/,
  );
});
