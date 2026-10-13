/**
 * What `usage_logs.details.context.activeTarget` and the dev log's file name
 * record: the target without its ids, in the shape PostHog gets.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { SECTION_COMPOSITION } from '../../netlify/functions/lib/ai/definitions.js';
import { logAIWorkflow } from '../../netlify/functions/lib/ai/logger.js';
import { UNKNOWN_TARGET, aggregateAITarget } from '../../netlify/functions/lib/ai/request.js';
import { REFUSED_TARGETS, SERVED_TARGETS } from './ai-target-tables.mjs';

const RECORDABLE = new Set([
  'cv',
  'section:custom',
  'item:custom',
  ...Object.keys(SECTION_COMPOSITION).flatMap((key) => [`section:${key}`, `item:${key}`]),
  UNKNOWN_TARGET,
]);

test('a custom section named by free text is recorded as section:custom', () => {
  assert.equal(aggregateAITarget('section:custom:Jane Doe'), 'section:custom');
});

test('an entry whose id is free text is recorded without it', () => {
  assert.equal(aggregateAITarget('item:work:Acme Corp'), 'item:work');
  assert.equal(aggregateAITarget('item:custom:Jane Doe:Acme Corp'), 'item:custom');
  assert.equal(
    aggregateAITarget('item:custom:3f2b8c1e-0000-4000-8000-000000000001:c1'),
    'item:custom',
  );
});

test('the whole CV and a built-in section are recorded as they are', () => {
  assert.equal(aggregateAITarget('cv'), 'cv');
  assert.equal(aggregateAITarget('section:work'), 'section:work');
});

test('a malformed, oversized or non-string target is recorded as unknown', () => {
  for (const target of [
    'section:Jane Doe',
    'item:Acme Corp:x',
    'group:work,skills',
    '',
    `item:work:${'x'.repeat(10_000)}`,
    `section:custom:${'Jane Doe '.repeat(1_000)}`,
    undefined,
    null,
    42,
    { type: 'cv' },
  ]) {
    assert.equal(aggregateAITarget(target), UNKNOWN_TARGET, String(target).slice(0, 40));
  }
});

test('the dev log is named by the aggregate, never by an id', (context) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ai-log-'));
  const cwd = process.cwd();
  const devFlag = process.env.NETLIFY_DEV;
  context.after(() => {
    process.chdir(cwd);
    if (devFlag === undefined) delete process.env.NETLIFY_DEV;
    else process.env.NETLIFY_DEV = devFlag;
    rmSync(dir, { recursive: true, force: true });
  });
  context.mock.method(console, 'log', () => {});
  process.env.NETLIFY_DEV = 'true';
  process.chdir(dir);

  logAIWorkflow({ granularity: 'item', mode: 'improve', activeTarget: 'item:work:Acme Corp' });

  const [fileName, ...rest] = readdirSync(path.join(dir, 'logs'));
  assert.equal(rest.length, 0);
  assert.match(fileName, /_item_work\.json$/);
  assert.ok(!fileName.includes('Acme'), fileName);
});

test('every served target is recorded as one aggregated shape, every refused one as unknown', () => {
  for (const target of SERVED_TARGETS) {
    const recorded = aggregateAITarget(target);
    assert.ok(RECORDABLE.has(recorded) && recorded !== UNKNOWN_TARGET, `${target} → ${recorded}`);
  }
  for (const target of REFUSED_TARGETS) {
    assert.equal(aggregateAITarget(target), UNKNOWN_TARGET, target);
  }
});
