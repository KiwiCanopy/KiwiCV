import { AI_EXCLUDED_SECTIONS } from '@/constants/ai';
import { RAIL_SECTION_ORDER } from '@/features/dashboard/editor/rail/railSections';
import { initialResumeState } from '@/types/resume';
import { customSectionItemFields } from '@/utils/items';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * A third section inventory, and the only one that crosses a process boundary.
 *
 * - the frontend hides Improve for `AI_EXCLUDED_SECTIONS` (`constants/ai.ts`)
 * - the backend can only serve the keys of `SECTION_COMPOSITION`
 *   (`netlify/functions/lib/ai/definitions.js`)
 * - `npm run ai:check-sync` compares `AI_PRO_DAILY_LIMIT`, `AI_MAX_CHAR_LIMIT`
 *   and `AI_LANGUAGE_NAME_MAX_LENGTH` — named constants
 *   that must agree, and nothing about which sections exist
 *
 * So nothing stopped the rail offering an Improve button for a target the
 * backend cannot answer. `section:coverLetter` was exactly that target for a
 * year: the rail gave the cover letter a row of its own and
 * `SECTION_COMPOSITION` had no entry for it. The object-section path is now built
 * end to end, so the letter belongs on the improvable side — and this test
 * is what stops the two halves drifting apart again in either direction.
 *
 * ⚠️ **Key presence is not serveability, and this test learned that the hard
 * way.** An earlier change added `coverLetter: ['subject', 'paragraphs']` and flipped the
 * assertion below to expect it — which passed, because a key is present the
 * moment it is typed. It was reverted because three things downstream could not
 * carry it: `FIELD_DEFS` had neither field, so `buildItemSchema` spread `{}` and
 * the response schema shipped untyped nodes; that schema keys items by `_vId`,
 * which an object section has none of; and `applySectionSuggestion` branched on
 * `basics` or `Array.isArray`, so nothing was written back.
 *
 * The last test in this file is the cheap half of that lesson: a composition may
 * only name fields the schema builder can actually resolve. The expensive half —
 * driving a response through the real schema into the real store — is
 * `store/resume/slices/ai/suggestions/__tests__/coverLetterImprove.test.ts`.
 *
 * ⚠️ The backend file is read as **text**, not imported. It is ESM shipped
 * to Netlify, outside the app's tsconfig, and importing it would make this test
 * a test of the bundler. Reading it means the assertion survives that file
 * being edited by someone who never opens the frontend.
 */

const ROOT = process.cwd();

const BACKEND_DEFINITIONS = fileURLToPath(
  new URL('../../../netlify/functions/lib/ai/definitions.js', import.meta.url),
);

function backendComposableSections(): string[] {
  const source = readFileSync(BACKEND_DEFINITIONS, 'utf8');
  const start = source.indexOf('export const SECTION_COMPOSITION = {');
  if (start === -1) throw new Error('SECTION_COMPOSITION not found in the backend definitions');

  const block = source.slice(start, source.indexOf('\n};', start));
  return [...block.matchAll(/^ {2}(\w+):/gm)].map((match) => match[1]);
}

function backendSingletonSections(): string[] {
  const source = readFileSync(BACKEND_DEFINITIONS, 'utf8');
  const match = source.match(/export const SINGLETON_SECTIONS = \[([^\]]*)\]/);
  if (!match) throw new Error('SINGLETON_SECTIONS not found in the backend definitions');
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

const FRONTEND_IMPROVABLE = RAIL_SECTION_ORDER.filter(
  (key) => !(AI_EXCLUDED_SECTIONS as readonly string[]).includes(key),
);

/**
 * Every field name any composition uses, and every field `FIELD_DEFS` defines.
 * Read as text for the same reason as above — the backend is ESM outside
 * the app's tsconfig.
 */
function backendFieldUsage(): { defined: string[]; used: Record<string, string[]> } {
  const source = readFileSync(BACKEND_DEFINITIONS, 'utf8');

  const defsStart = source.indexOf('export const FIELD_DEFS = {');
  if (defsStart === -1) throw new Error('FIELD_DEFS not found in the backend definitions');
  const defsBlock = source.slice(defsStart, source.indexOf('\n};', defsStart));
  const defined = [...defsBlock.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);

  const used: Record<string, string[]> = {};
  for (const name of ['SECTION_COMPOSITION', 'PARSING_COMPOSITION', 'TRANSLATION_COMPOSITION']) {
    const start = source.indexOf(`export const ${name} = {`);
    if (start === -1) throw new Error(`${name} not found in the backend definitions`);
    const block = source.slice(start, source.indexOf('\n};', start));

    // ⚠️ Per ENTRY, not per line. A line-scoped match silently drops an entry
    // that Prettier wraps — `privateProjects` is 99 characters against a
    // `printWidth` of 100, so one added field would have wrapped it out of this
    // guard with no error, and the non-vacuity floor below would still pass.
    // Each entry runs from its key to the next top-level key or the block end.
    const keys = [...block.matchAll(/^ {2}(\w+):/gm)];
    for (let i = 0; i < keys.length; i += 1) {
      const from = keys[i].index;
      const to = i + 1 < keys.length ? keys[i + 1].index : block.length;
      const entry = block.slice(from, to);
      const literals = [...entry.matchAll(/'([^']+)'/g)].map((m) => m[1]);
      if (literals.length) used[`${name}.${keys[i][1]}`] = literals;
    }
  }
  return { defined, used };
}

describe('the sections the editor may offer Improve for', () => {
  /**
   * Non-vacuity first. A regex that silently matches nothing would make every
   * assertion below trivially true against an empty set.
   */
  it('parses a real inventory out of the backend file', () => {
    const parsed = backendComposableSections();
    expect(parsed.length).toBeGreaterThan(5);
    expect(parsed).toContain('work');
    expect(new Set(parsed).size).toBe(parsed.length);
  });

  it('matches what the backend can actually compose', () => {
    expect(new Set(FRONTEND_IMPROVABLE)).toEqual(new Set(backendComposableSections()));
  });

  it('offers Improve for the cover letter, which the backend now serves', () => {
    expect(FRONTEND_IMPROVABLE).toContain('coverLetter');
    expect(backendComposableSections()).toContain('coverLetter');
  });

  it.each(['references', 'profiles'])('the backend cannot serve %s', (sectionKey) => {
    expect(FRONTEND_IMPROVABLE).not.toContain(sectionKey);
    expect(backendComposableSections()).not.toContain(sectionKey);
  });

  /**
   * ⚠️ The set-equality assertion above compares two inventories, and both are
   * derived — so a section added to one and forgotten in the other is caught,
   * but a button pointing somewhere neither list mentions is not. This reads the
   * sources instead, which is what makes it hold while `coverLetter` moves from
   * one side to the other.
   */
  it('no component renders an Improve button the backend cannot answer', () => {
    const files = spawnSync('git', ['ls-files', '-z', '*.tsx'], { cwd: ROOT, encoding: 'utf8' })
      .stdout.split('\0')
      .filter(Boolean)
      .filter((rel) => !rel.includes('__tests__'));

    expect(files.length).toBeGreaterThan(50);

    const servable = new Set(backendComposableSections());
    const offenders: string[] = [];

    for (const rel of files) {
      const source = readFileSync(path.join(ROOT, rel), 'utf8');
      for (const match of source.matchAll(/target=["'{`]*section:(\w+)/g)) {
        if (!servable.has(match[1])) offenders.push(`${rel} -> section:${match[1]}`);
      }
    }

    expect(
      offenders,
      'an Improve button targets a section SECTION_COMPOSITION has no entry for',
    ).toEqual([]);
  });

  /**
   * ⚠️ **The third cross-boundary inventory, and the one shipped without a pin.**
   * `SINGLETON_SECTIONS` decides which sections answer with `improvedFields`
   * alone instead of an `items[]` keyed by `_vId`. The truth is the store's own
   * shape — `initialResumeState` — which the backend cannot see, so it carries a
   * copy. `ai:check-sync` pins the shared constants and the set-equality case
   * above pins the section inventory; this one had nothing.
   *
   * Both directions matter, and they catch different failures:
   *
   * - **forward** — a list section declared a singleton. The schema then asks
   *   for `improvedFields` while `applySectionSuggestion`'s array branch looks
   *   for `items`, and nothing is written back.
   * - **reverse** — an object section added to `SECTION_COMPOSITION` and
   *   forgotten here. That is the earlier defect exactly: the schema comes back keyed by a
   *   `_vId` the section has none of, the run costs a daily request, and the
   *   user reads "No changes".
   *
   * `basics` was once exempt here; now that it is on the list, this
   * is the guard that reds when the two criteria are made to disagree again.
   */
  it('declares as singleton exactly the object-shaped sections the store has', () => {
    const singletons = backendSingletonSections();
    const store = initialResumeState as unknown as Record<string, unknown>;

    expect(singletons.length).toBeGreaterThan(0);

    const isObjectSection = (key: string) => {
      const value = store[key];
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    };

    for (const key of singletons) {
      expect(
        Object.keys(store),
        `SINGLETON_SECTIONS names "${key}", which is not a section of the resume at all`,
      ).toContain(key);
      expect(
        isObjectSection(key),
        `SINGLETON_SECTIONS names "${key}", but the store holds an array there — the schema would ask for improvedFields while the apply path looked for items, and write nothing`,
      ).toBe(true);
    }

    for (const key of backendComposableSections()) {
      if (!isObjectSection(key)) continue;
      expect(
        singletons,
        `"${key}" is one object in the store but is not in SINGLETON_SECTIONS, so its schema keys items by a _vId it does not have`,
      ).toContain(key);
    }
  });

  /**
   * ⚠️ The assertion that change needed and did not have. `buildItemSchema` spreads
   * `{ ...FIELD_DEFS[fieldKey] }`, so a field the registry does not define
   * becomes `{}` — a schema node with no `type`, which Vertex's Schema proto
   * rejects. Nothing else in the repo notices: it typechecks, it lints, and the
   * key-presence assertions above stay green.
   */
  it('names only fields the schema builder can resolve', () => {
    const { defined, used } = backendFieldUsage();

    expect(defined.length).toBeGreaterThan(20);
    expect(defined).toContain('summary');
    expect(Object.keys(used).length).toBeGreaterThan(20);

    for (const [where, fields] of Object.entries(used)) {
      for (const field of fields) {
        expect(
          defined,
          `${where} names "${field}", which FIELD_DEFS does not define — buildItemSchema would emit an untyped {} node for it`,
        ).toContain(field);
      }
    }
  });
});

/**
 * A custom section's entry fields live on both sides of the boundary: the store's
 * `customSectionItemFields` and the backend's `CUSTOM_SECTION_ITEM_COMPOSITION`.
 * A field added to one and not the other is never improved or translated, and a
 * translated CV ships it in the source language. `url` is the one field
 * deliberately left out: it is stripped before the model.
 */
describe('the custom-section entry fields the AI covers', () => {
  it('are every field an entry has, except url', () => {
    const source = readFileSync(BACKEND_DEFINITIONS, 'utf8');
    const match = source.match(/export const CUSTOM_SECTION_ITEM_COMPOSITION = \[([^\]]*)\]/);
    if (!match) throw new Error('CUSTOM_SECTION_ITEM_COMPOSITION not found');
    const composed = [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);

    expect(composed.length).toBeGreaterThan(0);
    expect([...composed, 'url'].sort()).toEqual(Object.keys(customSectionItemFields()).sort());
  });
});
