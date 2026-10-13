import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { ALL_EMPTY_ITEM_KEYS, ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { sanitizeResumeData, validateSkills } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * Losing a list entry on import must not be silent.
 *
 * ⚠️ **The defect was first located in `validateSkills`, and a later fix moved
 * the site.** The point
 * was that `keywords = Array.isArray(originalKeywords) ? originalKeywords : []`
 * discards a comma-joined string with no `ImportWarning`, while the same
 * function already warns about a level it cannot explain. That was true. Now
 * `sanitizeResumeData` normalises the container first and `setResume`
 * calls it **before** `validateSkills`, so the branch first named is no
 * longer reachable from production — and the silent loss it describes now
 * happens one layer up, for all **seven** array fields rather than for
 * `skills.keywords` alone.
 *
 * So the warning belongs at `s()`. Fixing it where it was first located would have
 * left `work.highlights`, `education.courses` and the rest exactly as silent,
 * behind a guard that no longer fires.
 */

const arrayFieldsOf = (key: string): string[] =>
  Object.entries(createEmptyItem(key as (typeof ALL_EMPTY_ITEM_KEYS)[number]))
    .filter(([, value]) => Array.isArray(value))
    .map(([field]) => field);

/**
 * ⚠️ Three title fields with one value, because `sanitizeArray` is given a
 * different `titleField` per section — `name` for most, `organization` for
 * volunteer, `institution` for education — and that is what fills the
 * warning's `item`, i.e. the name the user reads in the modal above the
 * offending field. A fixture carrying only `name` left two of the seven
 * reporting `item: undefined`, which is a warning that cannot say *which*
 * entry. Found by the assertion below rather than by reading `sanitizeArray`.
 * Each section keeps only its own (the others are not in its schema), so the
 * label is `'ZQ Item'` for all seven and the assertion stays universal.
 */
const importWith = (section: string, field: string, value: unknown) =>
  sanitizeResumeData({
    [section]: [
      { name: 'ZQ Item', organization: 'ZQ Item', institution: 'ZQ Item', [field]: value },
    ],
  } as Record<string, unknown>);

const SECTIONS_WITH_ARRAY_FIELDS = ALL_SECTION_KEYS.flatMap((key) =>
  arrayFieldsOf(key).map((field) => [key, field] as [string, string]),
);

describe('a discarded list value raises an import warning', () => {
  it('covers every array field, not just the one first reported', () => {
    expect(SECTIONS_WITH_ARRAY_FIELDS.map(([section]) => section)).toContain('skills');
    expect(SECTIONS_WITH_ARRAY_FIELDS.length).toBeGreaterThan(1);
  });

  it.each(SECTIONS_WITH_ARRAY_FIELDS)(
    '%s.%s warns when the container is not an array',
    (section, field) => {
      const { warnings } = importWith(section, field, 'a, b');
      expect(warnings).toEqual([
        { section, item: 'ZQ Item', field, message: 'editor.errors.invalid_list_value' },
      ]);
    },
  );

  it.each(SECTIONS_WITH_ARRAY_FIELDS)('%s.%s warns when an entry is dropped', (section, field) => {
    const { warnings } = importWith(section, field, ['kept', 42]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe(field);
  });

  /**
   * ⚠️ Half two, and the half a "always warn" implementation would fail. A
   * warning for a list that lost nothing is worse than none: it teaches the user
   * that the modal is noise.
   */
  it.each(SECTIONS_WITH_ARRAY_FIELDS)(
    '%s.%s stays silent when nothing is lost',
    (section, field) => {
      expect(importWith(section, field, ['one', 'two']).warnings).toEqual([]);
      expect(importWith(section, field, []).warnings).toEqual([]);
      // ⚠️ **A nullish container is the case both new guards missed**, and it
      // is the likeliest of the lot: `null` is how a third party or an LLM
      // writes an empty list. It carried no entries, so it lost none — and the
      // string and date branches beside it are silent for the same input.
      // Adding these two lines failed 7 of 7 before the fix.
      expect(importWith(section, field, null).warnings).toEqual([]);
      expect(importWith(section, field, undefined).warnings).toEqual([]);
      // An *absent* field is not a loss either — that branch clones the default.
      expect(
        sanitizeResumeData({
          [section]: [{ name: 'ZQ Item', organization: 'ZQ Item', institution: 'ZQ Item' }],
        } as Record<string, unknown>).warnings,
      ).toEqual([]);
    },
  );

  /**
   * ⚠️ The gate, and it is not cosmetic. `ImportWarningsModal` heads each row
   * with `t('editor.sections.' + section)`, a namespace that holds the twelve
   * section keys and nothing else — a warning raised for `meta` would print its
   * own translation key as the heading. `meta.content`'s arrays go through the
   * same branch, so this has to be asserted rather than assumed.
   */
  it('does not warn for meta.content’s arrays, which the modal cannot label', () => {
    const { sanitized, warnings } = sanitizeResumeData({
      meta: { content: { hiddenIds: 'not-an-array', hiddenSections: ['ok', 7] } },
    } as Record<string, unknown>);

    expect(sanitized.meta.content.hiddenIds).toEqual([]);
    expect(sanitized.meta.content.hiddenSections).toEqual(['ok']);
    expect(warnings).toEqual([]);
  });
});

/**
 * The reachability claim the fix rests on, measured rather than reasoned — the
 * premise lesson of rounds sixteen and seventeen. If `setResume` ever stopped
 * sanitizing before validating, `validateSkills`'s own branch would become live
 * again and the original defect would reopen where it was filed.
 */
describe('validateSkills no longer sees a non-array keywords through setResume', () => {
  it('receives an array, because the sanitizer ran first', () => {
    const raw = structuredClone(initialResumeState) as unknown as Record<string, unknown>;
    raw.skills = [{ name: 'Zig', level: null, keywords: 'a, b' }];
    useResumeStore.getState().setResume(raw as unknown as ResumeData);

    const stored = useResumeStore.getState().resume.skills[0];
    expect(stored.keywords).toEqual([]);
    expect(stored.name).toBe('Zig');
  });

  /**
   * And the function's own contract is unchanged, so a direct caller still gets
   * the normalisation. This is why the branch is kept rather than deleted: it is
   * unreachable through `setResume`, not dead in the function.
   */
  it('still normalises a non-array keywords when called directly', () => {
    const { validated, warnings } = validateSkills([
      { name: 'Zig', level: null, keywords: 'a, b' },
    ]);
    expect(validated[0].keywords).toEqual([]);
    expect(warnings).toEqual([]);
  });
});
