import { en } from '@/locales/en/index';
import { THEME_PARAM_DEFAULTS, initialResumeState } from '@/types/resume';
import type { ResumeData } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { ALL_EMPTY_ITEM_KEYS, ALL_SECTION_KEYS } from '@/utils/layoutMetadata';
import { lookupTranslation } from '@/utils/translationLookup';
import {
  RESUME_DATE_FIELDS,
  labelKeyForWarningSection,
  sanitizeResumeData,
} from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * "What the warnings UI can label" was restated three times and the three
 * disagreed. `labelKeyForWarningSection` is the single inventory; this file
 * asserts the two properties that made the three restatements a bug.
 *
 * ⚠️ **Half 1 (a section is missing) and half 2 (a label is wrong) are separate,
 * and half 2 is the one a set-equality test cannot see.** Resolving the returned
 * key against the real `en` bundle is what catches a label key that names
 * nothing — which is exactly the failure the modals shipped, since `t` returns
 * the path for a key it cannot find and therefore renders `editor.sections.meta`
 * as if it were a heading.
 */

const resolve = (path: string) => lookupTranslation(en, path);

describe('labelKeyForWarningSection', () => {
  it.each(ALL_SECTION_KEYS)('labels %s with a key the en bundle resolves', (section) => {
    const key = labelKeyForWarningSection(section);
    expect(key).toBe(`editor.sections.${section}`);
    expect(typeof resolve(key!)).toBe('string');
  });

  it('labels basics through its supersection, which is where the string lives', () => {
    const key = labelKeyForWarningSection('basics');
    expect(key).toBe('editor.supersections.basics.title');
    expect(typeof resolve(key!)).toBe('string');
  });

  it.each([['meta'], ['about'], ['contact'], ['profiles'], ['toString'], ['']])(
    'returns null for %o, which no modal can head',
    (section) => {
      expect(labelKeyForWarningSection(section)).toBeNull();
    },
  );

  /**
   * The inventory is derived, so the labelable set is exactly the twelve plus
   * `basics` — asserted as a set rather than by spot checks, because a helper
   * that returned a key for everything would pass every case above.
   */
  it('labels exactly ALL_SECTION_KEYS plus basics', () => {
    const candidates = [...ALL_SECTION_KEYS, 'basics', 'meta', 'profiles', 'about', 'coverLetter'];
    const labelable = candidates.filter((s) => labelKeyForWarningSection(s) !== null);

    expect([...labelable].sort()).toEqual([...ALL_SECTION_KEYS, 'basics'].sort());
  });
});

/**
 * The universal form of the gate: whatever `sanitizeResumeData` raises, the
 * modals must be able to head the row. Driven by an import that trips every
 * warning branch at once rather than by a per-branch case, so a fourth
 * `warnings.push` added without a gate fails here.
 */
describe('every warning sanitizeResumeData raises is labelable', () => {
  const hostile = {
    basics: {
      name: 'Ada',
      profiles: [{ network: 'GitHub', username: 'ada', url: 'https://example.com' }],
    },
    work: [{ _vId: 'w', name: 'ACME', startDate: 'Sommer 2020', highlights: 'a, b' }],
    education: [{ _vId: 'e', institution: 'Uni', courses: [42, 'ok'], endDate: 'irgendwann' }],
    skills: [{ _vId: 's', name: 'TS', level: 99, keywords: 'a, b' }],
    publications: [{ _vId: 'p', name: 'Paper', releaseDate: 'someday' }],
    meta: {
      theme: { params: { footerDate: 'Sommer 2026' } },
      content: { hiddenIds: 'not-an-array', order: { oneColumn: 'nope' } },
    },
  } as Record<string, unknown>;

  it('raises warnings at all — the control for the assertion below', () => {
    const { warnings } = sanitizeResumeData(hostile);
    expect(warnings.length).toBeGreaterThan(3);
  });

  it('gives every warning a section the UI has a label for', () => {
    const { warnings } = sanitizeResumeData(hostile);
    const unlabelable = warnings.filter((w) => labelKeyForWarningSection(w.section) === null);

    expect(unlabelable).toEqual([]);
  });

  /**
   * ⚠️ The specific false positive the widened gate exposed. `schemas.basics`
   * used to restate `profiles: []`, and `s()`'s array branch filters elements to
   * strings — so every real profiles array scored `lost = length` and only the
   * old `ALL_SECTION_KEYS` spelling of the gate kept the warning hidden.
   * Measured by widening that gate alone.
   */
  it('does not accuse a valid profiles array of being an invalid list', () => {
    const { sanitized, warnings } = sanitizeResumeData({
      basics: {
        name: 'Ada',
        profiles: [{ network: 'GitHub', username: 'ada', url: 'https://example.com' }],
      },
    } as Record<string, unknown>);

    expect(warnings).toEqual([]);
    expect(sanitized.basics.profiles).toHaveLength(1);
    expect(sanitized.basics.profiles[0]?.network).toBe('GitHub');
  });
});

/**
 * Half 2 of the date-inventory change: narrowing `RESUME_DATE_FIELDS` must break
 * something. Driven off `createEmptyItem` so it is the item inventory being
 * asserted rather than a list — dropping `releaseDate`, or the whole derivation,
 * fails a case here.
 *
 * ⚠️ **`profiles` contributes nothing to this sweep, and an earlier note here
 * said the opposite.** It claimed `profiles` "belongs in the sweep" because it
 * is walked under the labelable section string `basics` — true about the walk
 * and irrelevant here: `createEmptyItem('profiles')` has **no** date-named
 * field, so the derivation never yields a `profiles` tuple and the branch
 * handling one was unreachable. Deleted rather than kept as defensive, per the
 * delete-dead-branches rule (`.claude/rules/testing.md`). Found by the
 * code-reviewer pass.
 */
const DATE_FIELDS_BY_SECTION = ALL_EMPTY_ITEM_KEYS.flatMap((key) =>
  Object.keys(createEmptyItem(key))
    .filter((field) => field.toLowerCase().includes('date'))
    .map((field) => [key, field] as const),
);

describe('the real item date fields still get the date check', () => {
  it('found date fields to sweep, and none of them is profiles', () => {
    expect(DATE_FIELDS_BY_SECTION).toHaveLength(13);
    expect(DATE_FIELDS_BY_SECTION.map(([section]) => section)).not.toContain('profiles');
  });

  it.each(DATE_FIELDS_BY_SECTION)('warns about an unparsable %s.%s', (section, field) => {
    const patch = { [section]: [{ _vId: 'x', [field]: 'Sommer 2020' }] };

    const { sanitized, warnings } = sanitizeResumeData({
      ...structuredClone(initialResumeState),
      ...patch,
    } as unknown as ResumeData);

    expect(warnings.map((w) => w.field)).toContain(field);
    expect(warnings.every((w) => labelKeyForWarningSection(w.section) !== null)).toBe(true);
    void sanitized;
  });
});

/**
 * The forward guard for the original defect's actual shape: a **settings** key that happens to
 * contain the word "date" must not be parsed as one. Asserted over
 * `THEME_PARAM_DEFAULTS` rather than over `footerDate` alone, so an eleventh
 * param named `…Date` is covered without an edit here.
 */
describe('no theme param is treated as a date', () => {
  const dateNamedParams = Object.keys(THEME_PARAM_DEFAULTS).filter((key) =>
    key.toLowerCase().includes('date'),
  );

  /**
   * ⚠️ **The sweep below is EXISTENTIAL over a one-element set, and on its own it
   * is not the guard this block advertises.** `THEME_PARAM_DEFAULTS` has exactly
   * one date-named key (`footerDate`), so "an eleventh param named `…Date` is
   * covered without an edit here" was a claim about a set of size one. Measured
   * by the code-reviewer pass: replacing the inventory lookup with a **named
   * exemption** on top of the old heuristic —
   * `key !== 'footerDate' && key.toLowerCase().includes('date')` — left the
   * whole suite green. A `footerDateFormat` or `coverLetterDate` added later
   * would be blanked on import exactly as `footerDate` was, silently.
   *
   * The universal half is the set assertion below: the inventory is **exactly**
   * the date-named fields of the item schemas, so it cannot be a hand-kept list
   * with an exemption bolted on. `RESUME_DATE_FIELDS` is exported for this, and
   * for nothing else.
   */
  it('the date inventory is exactly the item schemas date fields, with no exemptions', () => {
    const derived = new Set(
      ALL_EMPTY_ITEM_KEYS.flatMap((key) =>
        Object.keys(createEmptyItem(key)).filter((field) => field.toLowerCase().includes('date')),
      ),
    );

    expect([...RESUME_DATE_FIELDS].sort()).toEqual([...derived].sort());
    expect([...RESUME_DATE_FIELDS].sort()).toEqual(['date', 'endDate', 'releaseDate', 'startDate']);

    // Half two: no theme param may be in it. A named exemption bolted onto a
    // name heuristic satisfies the row above and fails this one.
    for (const param of Object.keys(THEME_PARAM_DEFAULTS)) {
      expect(RESUME_DATE_FIELDS.has(param)).toBe(false);
    }
  });

  it('there is at least one such param to test', () => {
    expect(dateNamedParams).toContain('footerDate');
  });

  it.each(dateNamedParams)('passes a non-date string through %s untouched', (param) => {
    const { sanitized, warnings } = sanitizeResumeData({
      meta: { theme: { params: { [param]: 'Sommer 2026' } } },
    } as Record<string, unknown>);

    expect((sanitized.meta.theme.params as Record<string, unknown>)[param]).toBe('Sommer 2026');
    expect(warnings).toEqual([]);
  });
});
