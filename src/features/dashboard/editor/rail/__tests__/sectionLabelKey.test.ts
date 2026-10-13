import {
  RAIL_LABEL_KEYS,
  RAIL_SECTION_ORDER,
  sectionLabelKey,
} from '@/features/dashboard/editor/rail/railSections';
import { en } from '@/locales/en/index';
import { lookupTranslation } from '@/utils/translationLookup';
import { describe, expect, it } from 'vitest';

/**
 * `t()` returns the path for a key `lookupTranslation` cannot resolve, and
 * a path is a truthy string. So a wrong label key does not throw and does not
 * blank — it renders itself, and the customary `|| id` fallback never fires
 * because there was no falsy value to fall back from.
 *
 * ⚠️ That shipped. Once `section:coverLetter` became reachable,
 * and `AIEditHeader` was templating `editor.sections.${id}` — a prefix three of
 * the fifteen rows do not use — so the AI modal's title read
 * **"Optimize editor.sections.coverLetter"** in all 15 locales. The exact string
 * `railSections.ts` uses as its own cautionary example.
 *
 * The map was already correct and already resolved by `railInventory.test.ts`.
 * What was missing is a test that the *consumers* read it, which is why this
 * asserts the resolver rather than the record.
 */

const resolve = (path: string) => lookupTranslation(en, path);

describe('sectionLabelKey', () => {
  it('answers for every rail row', () => {
    expect(RAIL_SECTION_ORDER.length).toBeGreaterThan(10);
    for (const id of RAIL_SECTION_ORDER) {
      expect(sectionLabelKey(id), `no label key for the rail row "${id}"`).toBeTruthy();
    }
  });

  /**
   * The assertion that would have caught the shipped bug. Not "a key exists"
   * but "the key resolves to a real string in the bundle" — the difference
   * between a name and a path rendered as a name.
   */
  it.each(RAIL_SECTION_ORDER)('resolves "%s" to a real translated string', (id) => {
    const key = sectionLabelKey(id)!;
    const value = resolve(key);
    expect(typeof value, `${id} -> ${key} does not resolve in the en bundle`).toBe('string');
    expect(value).not.toBe('');
  });

  /**
   * ⚠️ The three rows that do NOT live under `editor.sections.*`, named
   * explicitly. This is the whole reason templating that prefix is wrong, and
   * a future refactor that "simplifies" the resolver back into a template
   * has to delete this test to do it.
   */
  it.each([
    ['basics', 'editor.basics.title'],
    ['profiles', 'editor.basics.profiles.title'],
    ['coverLetter', 'editor.coverLetter.title'],
  ])('%s does not live under editor.sections.*', (id, expected) => {
    expect(sectionLabelKey(id)).toBe(expected);
    expect(resolve(`editor.sections.${id}`)).toBeNull();
  });

  it('returns undefined for an id that is not a rail row', () => {
    expect(sectionLabelKey('notASection')).toBeUndefined();
    // So a caller can tell "no name" from "a name that happens to be a path".
    expect(sectionLabelKey('')).toBeUndefined();
  });

  /** Non-vacuity: the record the resolver reads is real and complete. */
  it('reads a populated record', () => {
    expect(Object.keys(RAIL_LABEL_KEYS).length).toBe(RAIL_SECTION_ORDER.length);
  });
});
