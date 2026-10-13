import {
  createEmptyItem,
  generateId,
  isItemEmpty,
  isSectionEmpty,
  persistableItems,
} from '@/utils/items';
import { ALL_EMPTY_ITEM_KEYS, ALL_SECTION_KEYS, type EmptyItemKey } from '@/utils/layout/constants';
import { describe, expect, it } from 'vitest';

/**
 * `items.ts` had no direct tests. `createEmptyItem` is the fifth parallel copy
 * of the section inventory — the same shape as the other inventory copies.
 *
 * It used to `switch` on a plain `string`, which the compiler cannot check: a
 * key added to `ALL_SECTION_KEYS` without a matching `case` compiled cleanly and
 * fell through to `default:`. It is now a
 * `Record<SectionKey | 'profiles', () => Item>`, so **both** drift directions
 * are now build errors at the definition site — including the removed-key
 * direction, which no test can reach (a test can enumerate `ALL_SECTION_KEYS`;
 * it cannot enumerate a `switch`'s cases).
 *
 * This suite does not retire with that change, but it does shrink. Typing the
 * map's *values* as `ItemFor<K>` — read off `ResumeData`, not restated — makes a
 * misspelt or missing **required** field a build error too, so half 2 below is
 * now a backstop rather than the only guard. What types still cannot state:
 * that a field declared optional in `ResumeData` (`location?`, `level?`) is
 * present, and that the item is *blank* — `certificates: () => ({ name:
 * 'Sample cert' })` compiles fine.
 *
 * ⚠️ Reachability, re-checked — this used to say the opposite.
 * `createEmptyItem` is no longer dormant. `initializeSection`
 * (`store/resume/slices/dataSlice.ts`) is still never invoked, but the
 * forms' `newItem` prop is gone and `useArrayForm`'s `addItem` routes through here,
 * so this function now backs the editor's most-clicked button for nine
 * sections. The failure it guards is live, not hypothetical: a missing entry
 * yields `{ _vId }` alone, `isItemEmpty` reads that as empty, and the store
 * sync filters it straight back out — the user clicks "add" and nothing
 * appears.
 */

describe('isItemEmpty', () => {
  it('treats null, undefined and non-objects as empty', () => {
    expect(isItemEmpty(null)).toBe(true);
    expect(isItemEmpty(undefined)).toBe(true);
    expect(isItemEmpty({})).toBe(true);
  });

  it.each([
    ['blank strings', { name: '' }],
    ['whitespace-only strings', { name: '   \n\t' }],
    ['empty arrays', { highlights: [] }],
    ['zero numbers, the default form level', { level: 0 }],
    ['false booleans', { featured: false }],
    ['null and undefined values', { url: null, summary: undefined }],
    ['recursively empty objects', { location: { city: '', region: '' } }],
  ])('reports an item holding only %s as empty', (_label, item) => {
    expect(isItemEmpty(item as Record<string, unknown>)).toBe(true);
  });

  it.each([
    ['a filled string', { name: 'Acme' }],
    ['a non-empty array', { highlights: ['shipped it'] }],
    ['a non-zero number', { level: 3 }],
    ['a true boolean', { featured: true }],
    ['a nested object with content', { location: { city: 'Zürich' } }],
  ])('reports an item holding %s as non-empty', (_label, item) => {
    expect(isItemEmpty(item as Record<string, unknown>)).toBe(false);
  });

  /**
   * These three are bookkeeping, not content. If they counted, every freshly
   * added item would look filled and the empty-item cleanup would never fire.
   */
  it.each(['_id', '_vId', 'visible'])('ignores the %s metadata field', (key) => {
    expect(isItemEmpty({ [key]: 'set', name: '' })).toBe(true);
  });

  it('is empty only when every field is empty, not when some are', () => {
    expect(isItemEmpty({ name: '', position: 'Engineer' })).toBe(false);
  });
});

describe('isSectionEmpty', () => {
  it('is empty with no entries, or only blank ones', () => {
    expect(isSectionEmpty([])).toBe(true);
    expect(isSectionEmpty(undefined)).toBe(true);
    expect(isSectionEmpty([createEmptyItem('work'), { _vId: 'x', name: '  ' }])).toBe(true);
  });

  it('is not empty once one entry has content', () => {
    expect(isSectionEmpty([createEmptyItem('work'), { _vId: 'x', name: 'Acme' }])).toBe(false);
  });
});

describe('generateId', () => {
  it('returns a short alphanumeric string', () => {
    expect(generateId()).toMatch(/^[a-z0-9]{1,9}$/);
  });

  it('does not repeat across a batch', () => {
    const ids = Array.from({ length: 200 }, () => generateId());

    expect(new Set(ids).size).toBe(ids.length);
  });
});

/**
 * The expected field set per section, taken from the item types in
 * `src/types/resume.ts` — every declared property except `visible` and `_vId`,
 * which are bookkeeping rather than content.
 *
 * Yes, this is another copy of the inventory. It is a *test-side* one on
 * purpose: a pin has to state the expected shape independently, or it only
 * proves the implementation equals itself. `hash.test.ts:116` uses the same
 * pattern for `IDENTITY_FIELDS`, and the `Record<…>` annotation makes a section
 * added to or removed from `ALL_SECTION_KEYS` a compile error here.
 */
/**
 * ⚠️ The exported inventory, not a local `[...ALL_SECTION_KEYS, 'profiles']`.
 * That spelling lived here until the same walk was needed in `validation.ts` —
 * at which point a second one would have been the copy this whole family is
 * about. `ALL_EMPTY_ITEM_KEYS` carries the `as const satisfies` and the
 * `_EmptyItemKeysAreExhaustive` alias, so it is also the typed form the local
 * one had to be annotated into by hand.
 */
const ALL_ITEM_KEYS: readonly EmptyItemKey[] = ALL_EMPTY_ITEM_KEYS;

const EXPECTED_FIELDS: Record<(typeof ALL_SECTION_KEYS)[number], readonly string[]> = {
  work: ['name', 'position', 'location', 'url', 'startDate', 'endDate', 'summary', 'highlights'],
  volunteer: [
    'organization',
    'position',
    'location',
    'url',
    'startDate',
    'endDate',
    'summary',
    'highlights',
  ],
  education: [
    'institution',
    'location',
    'url',
    'area',
    'studyType',
    'startDate',
    'endDate',
    'score',
    'courses',
  ],
  awards: ['title', 'date', 'awarder', 'location', 'summary', 'url'],
  certificates: ['name', 'date', 'issuer', 'url'],
  publications: ['name', 'publisher', 'releaseDate', 'url', 'summary'],
  projects: [
    'name',
    'description',
    'highlights',
    'roles',
    'keywords',
    'startDate',
    'endDate',
    'url',
    'entity',
    'location',
    'type',
  ],
  privateProjects: [
    'name',
    'description',
    'highlights',
    'roles',
    'keywords',
    'startDate',
    'endDate',
    'url',
    'entity',
    'location',
    'type',
  ],
  skills: ['name', 'level', 'keywords'],
  languages: ['language', 'certificate', 'level'],
  interests: ['name', 'keywords'],
  references: ['name', 'reference'],
};

/**
 * The drift guard. It needs both halves, and only the first is obvious:
 *
 * 1. No section may produce a fieldless item — catches a *missing* entry. The
 *    missing-key case is a build error, but `work: () => ({})` still
 *    type-checks, so this stays the runtime floor.
 * 2. Each section's field set must match the type exactly — catches a
 *    *narrowed* entry. This does not follow from the first: `work` cut down to
 *    `{ _vId, name: '' }` still has a content field and still reads as blank,
 *    so it passes half 1 and every blankness assertion while silently shipping
 *    an item the forms and the PDF serializers expect more of. Half 1 was the
 *    only half until a reviewer pass asked what a narrowed case would do —
 *    exactly how the same gap surfaced before.
 *
 * Writing half 2 found real drift: `awards` was missing `url` (required by its
 * type and present in `AwardsForm.tsx:21`) and `location`, and `work`,
 * `volunteer`, `education` and `projects` were each missing `location`. Fixed
 * in the same change.
 *
 * Both halves are driven by `ALL_SECTION_KEYS`, the canonical inventory.
 * Verified by mutation: deleting the `certificates` case fails half 1 by name,
 * dropping `studyType` from `education` fails half 2 by name.
 */
describe('createEmptyItem — section inventory drift guard', () => {
  it('expects a field set for every section in the canonical inventory', () => {
    expect(Object.keys(EXPECTED_FIELDS).sort()).toEqual([...ALL_SECTION_KEYS].sort());
  });

  it.each(ALL_SECTION_KEYS)('has a dedicated entry for %s', (section) => {
    const item = createEmptyItem(section);

    // An unknown section yields `{ _vId }` alone. Any real entry adds fields.
    expect(Object.keys(item).filter((k) => k !== '_vId').length).toBeGreaterThan(0);
  });

  it.each(ALL_SECTION_KEYS)('creates the full field set for %s', (section) => {
    const { _vId: _discarded, ...fields } = createEmptyItem(section);

    expect(Object.keys(fields).sort()).toEqual([...EXPECTED_FIELDS[section]].sort());
  });

  it.each(ALL_SECTION_KEYS)('creates a blank, identified item for %s', (section) => {
    const item = createEmptyItem(section);

    expect(typeof item._vId).toBe('string');
    expect(item._vId).not.toBe('');
    // A newly added row must read as empty, or the form's cleanup never fires.
    expect(isItemEmpty(item)).toBe(true);
  });

  it('gives each created item its own _vId', () => {
    expect(createEmptyItem('work')._vId).not.toBe(createEmptyItem('work')._vId);
  });

  /**
   * The hazard the `Record` introduces and the `switch` structurally could
   * not have: a shared shape hoisted into a `const` and shallow-spread into two
   * entries copies the *same* array reference into every item ever created, so
   * pushing to one item's highlights mutates another's. `toEqual` in the shape
   * test above cannot see that — only reference identity can.
   *
   * Driven by the canonical inventory rather than `work` alone, because the
   * shape actually shared in `items.ts` is `projects`/`privateProjects`, and a
   * `work`-only assertion would have watched the wrong entry.
   */
  it.each(ALL_ITEM_KEYS)('gives each created %s item its own array instances', (section) => {
    const first: Record<string, unknown> = createEmptyItem(section);
    const second: Record<string, unknown> = createEmptyItem(section);

    for (const [field, value] of Object.entries(first)) {
      if (Array.isArray(value)) expect(value).not.toBe(second[field]);
    }
  });

  /**
   * ⚠️ The precondition of the test above. Every assertion in it sits behind an
   * `Array.isArray` branch, so a shape with no array fields checks nothing and
   * still reports green — the vacuous-fixture failure mode, where a
   * guard passed because the data never reached the code it guarded. Pinning
   * the count proves the branch is entered, and by how much.
   */
  it('actually reaches an array field in seven of the item shapes', () => {
    const withArrays = ALL_ITEM_KEYS.filter((section) =>
      Object.values(createEmptyItem(section)).some(Array.isArray),
    );

    // Sorted, like the sibling assertions: `ALL_SECTION_KEYS`'s declaration
    // order is not load-bearing anywhere, and reordering it — a legal no-op —
    // must not fail here with a diff that reads like real inventory drift.
    expect(withArrays).toHaveLength(7);
    expect([...withArrays].sort()).toEqual(
      [
        'work',
        'volunteer',
        'education',
        'projects',
        'privateProjects',
        'skills',
        'interests',
      ].sort(),
    );
  });

  /**
   * `profiles` lives under `basics`, so it is not in `ALL_SECTION_KEYS` — it is
   * a `SectionMetadataKey`. It still needs a case, and `getSectionItemHash`
   * handles it too.
   */
  it('also covers profiles, which sits outside ALL_SECTION_KEYS', () => {
    expect(createEmptyItem('profiles')).toMatchObject({ network: '', username: '', url: '' });
  });

  it('shares one item shape between projects and privateProjects', () => {
    const { _vId: _a, ...projects } = createEmptyItem('projects');
    const { _vId: _b, ...privateProjects } = createEmptyItem('privateProjects');

    expect(privateProjects).toEqual(projects);
  });

  it('returns an identified but fieldless item for an unknown section', () => {
    expect(Object.keys(createEmptyItem('not-a-section' as EmptyItemKey))).toEqual(['_vId']);
  });

  /**
   * ⚠️ The `switch` this replaced was total over `string`; an object index is
   * not, and reaches `Object.prototype`. Before the `Object.hasOwn` guard,
   * `'valueOf'` threw `Cannot convert undefined or null to object` and
   * `'toString'` spread `"[object Undefined]"` into a character-keyed item —
   * both from the same line that reads as an ordinary lookup with a fallback.
   *
   * ⚠️ The `as EmptyItemKey` casts here and above are the point, not noise.
   * `createEmptyItem` no longer has a `string` overload: its
   * `initializeSection` justification was false — that action is declared
   * `(section: SectionKey) => void` and always resolved through the typed
   * signature — and the overload let `createEmptyItem('skils')` compile to a
   * fieldless item. Leaving the domain is now something a caller has to write
   * down, and these are the only places that do.
   */
  it.each(['valueOf', 'toString', 'constructor', 'hasOwnProperty', '__proto__'])(
    'does not fall through to Object.prototype for %s',
    (section) => {
      expect(Object.keys(createEmptyItem(section as EmptyItemKey))).toEqual(['_vId']);
    },
  );
});

// Every editor list (ArrayForm, skills, languages, profiles) persists through
// this; dropping `_vId` here unhides entries on the next edit.
describe('persistableItems', () => {
  it('drops blank entries and the local _id, and keeps _vId', () => {
    const kept = persistableItems([
      { _id: 'local-1', _vId: 'v1', name: 'Kept' },
      { _id: 'local-2', _vId: 'v2', name: '  ' },
    ]);
    expect(kept).toEqual([{ _vId: 'v1', name: 'Kept' }]);
  });
});
