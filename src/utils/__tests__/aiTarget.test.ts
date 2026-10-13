import { getAITrackingParams } from '@/utils/ai';
import {
  AI_TARGET_KINDS,
  isAITargetKey,
  isItemKeyOf,
  isItemTarget,
  isSectionTarget,
  itemTarget,
  parseAITarget,
  sectionTarget,
} from '@/utils/aiTarget';
import { isCustomSectionToken } from '@/utils/layout/customSections';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const UUID = '3f2b8c1e-9a4d-4e6b-8f1a-2c3d4e5f6a7b';

const CASES: Array<[string, ReturnType<typeof parseAITarget>]> = [
  ['cv', { type: 'cv', sectionKey: '', vId: undefined }],
  ['section:work', { type: 'section', sectionKey: 'work', vId: undefined }],
  ['item:work:v1', { type: 'item', sectionKey: 'work', vId: 'v1' }],
  ['item:basics', { type: 'item', sectionKey: 'basics', vId: undefined }],
  [`section:custom:${UUID}`, { type: 'section', sectionKey: `custom:${UUID}`, vId: undefined }],
  [`item:custom:${UUID}`, { type: 'item', sectionKey: `custom:${UUID}`, vId: undefined }],
  [`item:custom:${UUID}:v9`, { type: 'item', sectionKey: `custom:${UUID}`, vId: 'v9' }],
  ['section:custom:', { type: 'section', sectionKey: 'custom:', vId: undefined }],
  // A kind the app never builds: a persisted or imported string.
  ['reorg', { type: 'unknown', sectionKey: '', vId: undefined }],
  ['group:work,education', { type: 'unknown', sectionKey: 'work,education', vId: undefined }],
  ['work:v1', { type: 'unknown', sectionKey: 'v1', vId: undefined }],
  ['', { type: 'unknown', sectionKey: '', vId: undefined }],
];

/** The backend twin, run in node: it is ESM outside the app's tsconfig (see aiSanitizerParity). */
const backendParse = (targets: string[]): unknown[] => {
  const url = new URL('../../../netlify/functions/lib/ai/target.js', import.meta.url).href;
  const script = `
    import { isCustomSectionKey, parseAITarget } from '${url}';
    const targets = JSON.parse(process.env.AI_TARGETS);
    process.stdout.write(
      JSON.stringify(
        targets.map((t) => ({ ...parseAITarget(t), custom: isCustomSectionKey(parseAITarget(t).sectionKey) })),
      ),
    );
  `;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: { ...process.env, AI_TARGETS: JSON.stringify(targets) },
  });
  if (run.status !== 0) throw new Error(`backend parseAITarget failed:\n${run.stderr}`);
  return JSON.parse(run.stdout) as unknown[];
};

describe('parseAITarget', () => {
  it.each(CASES)('parses %s', (target, expected) => {
    expect(parseAITarget(target)).toEqual(expected);
  });

  it('the backend twin parses every case identically', () => {
    // JSON drops `vId: undefined`, so compare through the same round trip.
    // `custom` pins the backend's `isCustomSectionKey` to `isCustomSectionToken`.
    const frontend = JSON.parse(
      JSON.stringify(
        CASES.map(([target]) => {
          const parsed = parseAITarget(target);
          return { ...parsed, custom: isCustomSectionToken(parsed.sectionKey) };
        }),
      ),
    );
    expect(backendParse(CASES.map(([target]) => target))).toEqual(frontend);
  });

  it('the backend twin knows exactly the kinds AI_TARGET_KINDS lists', () => {
    // `group` was retired from both lists; a twin still holding it parses it as a kind.
    const kinds = [...AI_TARGET_KINDS, 'group'];
    const targets = kinds.flatMap((kind) => [kind, `${kind}:x`]);
    const types = (parsed: unknown[]) => parsed.map((p) => (p as { type: string }).type);
    expect(types(targets.map(parseAITarget))).toEqual(
      kinds.flatMap((kind) => {
        const type = (AI_TARGET_KINDS as readonly string[]).includes(kind) ? kind : 'unknown';
        return [type, type];
      }),
    );
    expect(types(backendParse(targets))).toEqual(types(targets.map(parseAITarget)));
  });
});

/*
 * The spellings are literals here on purpose: a test built from `itemTarget`
 * would follow a changed prefix and stay green while every persisted key and
 * the backend's parser kept the old one.
 */
describe('target builders and predicates', () => {
  it('build the shipped spellings', () => {
    expect(itemTarget('work', 'v1')).toBe('item:work:v1');
    expect(itemTarget('basics')).toBe('item:basics');
    expect(itemTarget(`custom:${UUID}`, 'v9')).toBe(`item:custom:${UUID}:v9`);
    expect(sectionTarget('work')).toBe('section:work');
  });

  it.each([
    ['item:work:v1', { item: true, section: false }],
    ['item:basics', { item: true, section: false }],
    [`item:custom:${UUID}:v9`, { item: true, section: false }],
    ['section:work', { item: false, section: true }],
    [`section:custom:${UUID}`, { item: false, section: true }],
    // A retired kind: nothing builds `group:`.
    ['group:work,education', { item: false, section: false }],
    ['cv', { item: false, section: false }],
    // The bare kind parses as that kind, but carries no colon: not a target of it.
    ['item', { item: false, section: false }],
    ['section', { item: false, section: false }],
    ['items:work', { item: false, section: false }],
    ['Item:work', { item: false, section: false }],
    [' item:work', { item: false, section: false }],
    ['', { item: false, section: false }],
  ])('classify %j', (target, expected) => {
    expect({
      item: isItemTarget(target),
      section: isSectionTarget(target),
    }).toEqual(expected);
  });

  it('isItemKeyOf takes both item spellings of its own section only', () => {
    expect(isItemKeyOf('item:work:v1', 'work')).toBe(true);
    expect(isItemKeyOf('item:basics', 'basics')).toBe(true);
    expect(isItemKeyOf('item:workshop:v1', 'work')).toBe(false);
    expect(isItemKeyOf('section:work', 'work')).toBe(false);
  });

  it('isAITargetKey admits every key the builders make, and nothing else', () => {
    const built = ['cv', sectionTarget('work'), itemTarget('work', 'v1'), itemTarget('basics')];
    expect(built.filter((target) => !isAITargetKey(target))).toEqual([]);
    expect(itemTarget(`custom:${UUID}`, 'c1')).toSatisfy(isAITargetKey);
    const outside = ['CV', 'reorg', 'work', 'items:work', 'group:work,skills', 'cv:x', ''];
    expect(outside.filter(isAITargetKey)).toEqual([]);
  });
});

describe('getAITrackingParams on a custom section', () => {
  it('reports `custom`, never the uuid, at both granularities', () => {
    expect(getAITrackingParams(`section:custom:${UUID}`)).toEqual({
      ai_scope: 'section',
      ai_section_key: 'custom',
      ai_target: 'section:custom',
    });
    expect(getAITrackingParams(`item:custom:${UUID}:v9`)).toEqual({
      ai_scope: 'item',
      ai_section_key: 'custom',
      ai_target: 'item:custom',
    });
  });
});

/** The backend's `aggregateAITarget` over one of the improve worker's target tables. */
const backendAggregate = (table: 'SERVED_TARGETS' | 'REFUSED_TARGETS'): Array<[string, string]> => {
  const tables = new URL('../../../tests/netlify-functions/ai-target-tables.mjs', import.meta.url)
    .href;
  const request = new URL('../../../netlify/functions/lib/ai/request.js', import.meta.url).href;
  const script = `
    import { ${table} } from '${tables}';
    import { aggregateAITarget } from '${request}';
    process.stdout.write(JSON.stringify(${table}.map((t) => [t, aggregateAITarget(t)])));
  `;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
  });
  if (run.status !== 0) throw new Error(`backend aggregateAITarget failed:\n${run.stderr}`);
  return JSON.parse(run.stdout) as Array<[string, string]>;
};

/** PostHog's `ai_target` and `usage_logs`' `activeTarget` must join. */
describe('getAITrackingParams agrees with the backend aggregateAITarget', () => {
  it('on every target the improve worker serves', () => {
    const pairs = backendAggregate('SERVED_TARGETS');
    expect(pairs.length).toBeGreaterThan(0);
    for (const [target, backend] of pairs) {
      expect(isAITargetKey(target), target).toBe(true);
      if (isAITargetKey(target))
        expect(getAITrackingParams(target).ai_target, target).toBe(backend);
    }
  });

  it('on every refused target of a kind the app never builds, which no AITargetKey can be', () => {
    const pairs = backendAggregate('REFUSED_TARGETS').filter(
      ([target]) => parseAITarget(target).type === 'unknown',
    );
    expect(pairs.map(([target]) => target)).toEqual(['group:work,skills', 'foo']);
    for (const [target, backend] of pairs) {
      expect(backend).toBe('unknown');
      expect(isAITargetKey(target), target).toBe(false);
    }
  });
});
