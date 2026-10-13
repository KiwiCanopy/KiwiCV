import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { ALL_EMPTY_ITEM_KEYS, type EmptyItemKey } from '@/utils/layout/constants';
import { sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * What `sanitizeResumeData` does with an **array-valued** field, in both
 * directions: a container that is not an array, and an array holding something
 * that is not a string.
 *
 * `s()` whitelists by `Object.keys(defaults)` and once wrote an array
 * field's value through raw — so a *present* non-array survived the import
 * whitelist and reached every unguarded `.map` / `.length` in the renderers.
 * The `isDateField` branch beside it already had the equivalent guard.
 *
 * ⚠️ **Measured through `setResume`, not through
 * `sanitizeResumeData` directly** — that distinction changed the answer twice,
 * because `setResume` runs `validateSkills` *after* the sanitizer:
 *
 * | field(s) | `"a, b"` container | `[{}]` element |
 * | --- | --- | --- |
 * | `work.highlights` | 12 HTML / 12 Typst | 12 HTML / 12 Typst |
 * | `education.courses` | 9 / 9 | 9 / 8 |
 * | `interests.keywords` | 7 / 6 | 6 / 5 |
 * | `skills.keywords` | **0 / 0** | 8 / 8 |
 *
 * So the first measurement (six and six) was taken against a barer fixture and
 * understated the container half by half, and the first scope listed `skills`
 * for a crash it cannot have: `validateSkills` replaces a non-array `keywords` before
 * anything renders. What it *does* have is the element half, which no issue
 * named and which is the only route to `skills.keywords`. ⚠️ `skills` losing the
 * container half is also why that row is not evidence of anything on its own —
 * it is green before the fix and after it.
 *
 * ⚠️ Both halves are needed and neither implies the other. A fix that only
 * replaced a non-array container leaves every `[{}]` crash in the table above;
 * a fix that only filtered elements leaves `.filter is not a function`.
 */

/**
 * The array fields, **derived from the item shapes** rather than listed. A
 * hand-written list here would be the very copy `EMPTY_ITEM_FIELDS` exists to
 * be the single source of — and the first list was written from the defect's
 * description rather than from the code.
 */
const ARRAY_FIELDS: Array<[EmptyItemKey, string]> = ALL_EMPTY_ITEM_KEYS.flatMap((key) =>
  Object.entries(createEmptyItem(key))
    .filter(([, value]) => Array.isArray(value))
    .map(([field]) => [key, field] as [EmptyItemKey, string]),
);

/**
 * ⚠️ Pinning the set the walk **found**, not the number of keys it opened — the
 * pin-the-set rule (`.claude/rules/testing.md`).
 * `expect(ALL_EMPTY_ITEM_KEYS).toHaveLength(13)` would be true and irrelevant: an
 * entry that stopped declaring its array field would leave that count untouched
 * and silently drop out of every case below.
 */
const EXPECTED_ARRAY_FIELDS: Array<[string, string]> = [
  ['work', 'highlights'],
  ['volunteer', 'highlights'],
  ['education', 'courses'],
  ['projects', 'highlights'],
  ['projects', 'roles'],
  ['projects', 'keywords'],
  ['privateProjects', 'highlights'],
  ['privateProjects', 'roles'],
  ['privateProjects', 'keywords'],
  ['skills', 'keywords'],
  ['interests', 'keywords'],
];

/** Not an array. Each one once reached the renderers unchanged. */
const NON_ARRAY_CONTAINERS: Array<[string, unknown]> = [
  ['null', null],
  ['a number', 42],
  ['a comma-joined string', 'a, b'],
  ['an object', { 0: 'x' }],
  ['a boolean', true],
];

/** Inside an array. `[null]` is here as the one that never threw. */
const NON_STRING_ELEMENTS: Array<[string, unknown]> = [
  ['a number', 42],
  ['null', null],
  ['an object', {}],
  ['a nested array', ['x']],
];

const sanitizeItem = (
  section: string,
  item: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const { sanitized } = sanitizeResumeData({ [section]: [item] } as Record<string, unknown>);
  return (sanitized as unknown as Record<string, Array<Record<string, unknown>>>)[section]?.[0];
};

describe('the array-field inventory this file is driven from', () => {
  it('is the eleven fields the item shapes declare', () => {
    expect(ARRAY_FIELDS).toEqual(EXPECTED_ARRAY_FIELDS);
  });

  /**
   * The positive control for the derivation itself. If `createEmptyItem` ever
   * returned `Record<string, unknown>` with no arrays in it — a shape that
   * nearly shipped — `ARRAY_FIELDS` would be `[]` and every `it.each` below
   * would run **zero** cases, green. Same failure as a `Record<never, …>`.
   */
  it('is not empty, and none of its sections is the basics-only key', () => {
    expect(ARRAY_FIELDS.length).toBeGreaterThan(0);
    expect(ARRAY_FIELDS.map(([key]) => key)).not.toContain('profiles');
  });
});

describe('a non-array container on an array field', () => {
  it.each(
    ARRAY_FIELDS.flatMap(([section, field]) =>
      NON_ARRAY_CONTAINERS.map(
        ([label, value]) => [section, field, label, value] as [string, string, string, unknown],
      ),
    ),
  )('%s.%s replaces %s with an empty array', (section, field, _label, value) => {
    expect(sanitizeItem(section, { [field]: value })?.[field]).toEqual([]);
  });
});

describe('a non-string element inside an array field', () => {
  it.each(
    ARRAY_FIELDS.flatMap(([section, field]) =>
      NON_STRING_ELEMENTS.map(
        ([label, value]) => [section, field, label, value] as [string, string, string, unknown],
      ),
    ),
  )('%s.%s drops %s', (section, field, _label, value) => {
    // ⚠️ A surviving *string* beside the bad element, so "the field came back
    // empty" can never be mistaken for "the element was dropped". Without it a
    // fix that discarded the whole array would pass every case here.
    const out = sanitizeItem(section, { [field]: ['kept', value, 'also kept'] })?.[field];
    expect(out).toEqual(['kept', 'also kept']);
  });
});

describe('half two: what the fix must NOT do', () => {
  it.each(ARRAY_FIELDS)('%s.%s keeps a well-formed array unchanged', (section, field) => {
    expect(sanitizeItem(section, { [field]: ['one', 'two'] })?.[field]).toEqual(['one', 'two']);
  });

  /**
   * ⚠️ `structuredClone(defaultValue)` on a **new** branch reopens the aliasing
   * question already closed on the absent-key branch: one schema object serves
   * every item in a section, so writing `defaults[key]` through would hand all
   * of them the same instance. That branch's guard cannot see this — it walks the
   * absent-key path, and here the key is present.
   */
  it('gives two items falling back their own array instances', () => {
    const { sanitized } = sanitizeResumeData({
      work: [
        { name: 'A', highlights: 'not an array' },
        { name: 'B', highlights: 42 },
      ],
    } as Record<string, unknown>);

    const [first, second] = sanitized.work;
    expect(first.highlights).toEqual([]);
    expect(second.highlights).not.toBe(first.highlights);

    first.highlights.push('only mine');
    expect(second.highlights).toEqual([]);
  });

  /**
   * The same property for the *present and valid* path, which `filter` gives
   * for free and a `result[key] = value` passthrough would not: an input object
   * that hands two items one array must not put that array in the store.
   */
  it('never stores the caller’s own array instance', () => {
    const shared = ['shared highlight'];
    const { sanitized } = sanitizeResumeData({
      work: [
        { name: 'A', highlights: shared },
        { name: 'B', highlights: shared },
      ],
    } as Record<string, unknown>);

    expect(sanitized.work[0].highlights).toEqual(['shared highlight']);
    expect(sanitized.work[0].highlights).not.toBe(shared);
    expect(sanitized.work[1].highlights).not.toBe(sanitized.work[0].highlights);
  });
});

/**
 * The same branch, on the other family of array defaults it reaches. These are
 * `string[]` on `ResumeData` too, and a stored non-array once went to the
 * store raw — `meta.content.order` has its own `Array.isArray` guards further
 * down `sanitizeResumeData`, `hiddenIds` and `hiddenSections` have none.
 */
describe('meta.content’s array fields', () => {
  const meta = (content: Record<string, unknown>) =>
    sanitizeResumeData({ meta: { content } } as Record<string, unknown>).sanitized.meta.content;

  it('replaces a non-array hiddenIds and hiddenSections', () => {
    const out = meta({ hiddenIds: 'a,b', hiddenSections: 42 });
    expect(out.hiddenIds).toEqual([]);
    expect(out.hiddenSections).toEqual([]);
  });

  it('drops a non-string id and keeps the rest', () => {
    expect(meta({ hiddenIds: ['keep', 7, null, 'keep2'] }).hiddenIds).toEqual(['keep', 'keep2']);
  });

  it('replaces a non-array stored order', () => {
    expect(meta({ order: { oneColumn: 'work' } }).order.oneColumn).toEqual([]);
  });
});

/**
 * The behavioural half. The unit cases above pin what the store holds; these
 * pin the thing a user sees, on every theme and in both outputs — the
 * render-then-scan rule.
 *
 * ⚠️ `buildSingleItemResume` rather than a bare `{ work: [...] }`: measuring
 * against a barer fixture is what gave the first measurement six themes where
 * there are twelve, since a theme that renders no work section cannot crash in it.
 */
describe('neither renderer throws on a malformed array field', () => {
  const withHighlights = (themeId: ThemeId, value: unknown): ResumeData => {
    const raw = structuredClone(buildSingleItemResume(themeId)) as unknown as Record<
      string,
      unknown
    >;
    (raw.work as Array<Record<string, unknown>>)[0].highlights = value;
    return sanitizeResumeData(raw).sanitized;
  };

  const html = (themeId: ThemeId, data: ResumeData): string =>
    renderToStaticMarkup(
      createElement(ThemeRegistry[themeId].HTMLComponent, {
        data,
        formatCVDate: (value?: string) => value || '',
        formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
      }),
    );

  it.each(ALL_THEME_IDS)('%s survives a comma-joined string and a bad element', (themeId) => {
    for (const value of ['a, b', [{}], [42]]) {
      const data = withHighlights(themeId, value);
      expect(() => html(themeId, data)).not.toThrow();
      expect(() => SERIALIZERS[themeId](data)).not.toThrow();
    }
  });

  /**
   * ⚠️ The positive control, and it is what stops the block above being
   * vacuous: a "fix" that emptied every array field would satisfy every
   * `not.toThrow()` here. `buildSingleItemResume` gives `work[0].highlights`
   * exactly one entry, so a theme that renders highlights at all must show it.
   */
  it.each(ALL_THEME_IDS)('%s still renders a well-formed highlight', (themeId) => {
    const data = withHighlights(themeId, ['A REAL HIGHLIGHT']);
    expect(data.work[0].highlights).toEqual(['A REAL HIGHLIGHT']);
    expect(html(themeId, data) + SERIALIZERS[themeId](data)).toContain('A REAL HIGHLIGHT');
  });
});
