import type { ResumeData } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import * as items from '@/utils/items';
import { ALL_EMPTY_ITEM_KEYS, type EmptyItemKey } from '@/utils/layoutMetadata';
import { sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it, vi } from 'vitest';

/**
 * `sanitizeResumeData`'s item schemas were a seventh copy of the item
 * inventory, hand-written, singular-keyed and already drifted.
 *
 * ⚠️ **This copy is field-level and live.** `s()` whitelists by
 * `Object.keys(defaults)`, so a field missing from a schema is not merely absent
 * from a new item — it is **stripped on every `setResume`**, which is every
 * import, every AI apply and every sync pull. That makes it the highest-stakes
 * member of the family.
 *
 * ⚠️ **The assertion here is deliberately NOT `itemSchemas[key]` versus
 * `createEmptyItem(key)`.** That is a tautology that once shipped: a schema derived
 * from a source agrees with that source by construction, so the check passes for
 * any derivation, correct or not, and would have gone on passing if the
 * derivation were quietly re-inlined as a literal. What is asserted instead is
 * the property the whitelist is *for* — **every field of every item shape
 * survives an import** — which is a claim about `sanitizeResumeData`'s output
 * that no amount of restating the schemas can satisfy vacuously.
 */

/**
 * A distinct, *observable* value for one field, chosen from the shape of that
 * field's empty value rather than from its name.
 *
 * ⚠️ The date branch is not cosmetic. `s()` routes every key whose lowercased
 * name contains `"date"` through `normalizeDate`/`isValidDate` and replaces an
 * unparsable value with `''` plus an import warning — so a plain string sentinel
 * on `startDate` would vanish and read as *drift*, failing for the opposite
 * reason to the one this file is about.
 */
const sentinelFor = (field: string, empty: unknown): unknown => {
  if (Array.isArray(empty)) return [`ZQ_${field}`];
  if (typeof empty === 'number') return 3;
  if (field.toLowerCase().includes('date')) return '2020-01-02';
  return `ZQ_${field}`;
};

/** Every field of `key`'s item shape, each carrying its own sentinel. */
const seededItem = (key: EmptyItemKey): Record<string, unknown> => {
  const { _vId: _discarded, ...fields } = createEmptyItem(key);
  return {
    ...Object.fromEntries(
      Object.entries(fields).map(([field, empty]) => [field, sentinelFor(field, empty)]),
    ),
    visible: false,
    ZQ_BOGUS: 'this field is in no schema',
  };
};

const SECTION_KEYS = ALL_EMPTY_ITEM_KEYS.filter((key) => key !== 'profiles');

const importAll = () => {
  const payload: Record<string, unknown> = {
    basics: { name: 'n', profiles: [seededItem('profiles')] },
  };
  for (const key of SECTION_KEYS) payload[key] = [seededItem(key)];
  return sanitizeResumeData(payload as Partial<ResumeData>).sanitized;
};

const importedItem = (sanitized: ResumeData, key: EmptyItemKey): Record<string, unknown> =>
  (key === 'profiles'
    ? sanitized.basics.profiles[0]
    : (sanitized as unknown as Record<string, unknown[]>)[key][0]) as Record<string, unknown>;

/**
 * ⚠️ The anti-vacuity pin, and it is per key rather than a total.
 *
 * "The walk visited thirteen keys" and "each key contributed its fields" are
 * independent properties — an earlier count pin read 45 while half of every
 * two-column theme went unrendered. A single total would also let one section
 * lose three fields while another gained three. These are the field counts of
 * `createEmptyItem`'s shapes, restated here on purpose: a pin that derives from
 * the thing under test cannot fail.
 */
const EXPECTED_FIELD_COUNTS: Record<EmptyItemKey, number> = {
  work: 8,
  volunteer: 8,
  education: 9,
  awards: 6,
  certificates: 4,
  publications: 5,
  projects: 11,
  privateProjects: 11,
  skills: 3,
  languages: 3,
  interests: 2,
  references: 2,
  profiles: 3,
};

describe('the sanitizer whitelist covers every field of every item shape', () => {
  it('expects a field count for every key in the canonical item inventory', () => {
    expect(Object.keys(EXPECTED_FIELD_COUNTS).sort()).toEqual([...ALL_EMPTY_ITEM_KEYS].sort());
  });

  it.each(ALL_EMPTY_ITEM_KEYS)('seeds every field of %s, and none is empty by accident', (key) => {
    const { visible: _v, ZQ_BOGUS: _b, ...seeded } = seededItem(key);

    expect(Object.keys(seeded)).toHaveLength(EXPECTED_FIELD_COUNTS[key]);
    expect(Object.values(seeded).every((value) => value !== undefined && value !== '')).toBe(true);
  });

  it.each(ALL_EMPTY_ITEM_KEYS)('carries every field of %s through an import', (key) => {
    const sanitized = importAll();
    const imported = importedItem(sanitized, key);
    const { _vId: _discarded, ...fields } = createEmptyItem(key);

    for (const [field, empty] of Object.entries(fields)) {
      expect(imported[field], `${key}.${field} was stripped by the import whitelist`).toEqual(
        sentinelFor(field, empty),
      );
    }
  });

  it.each(ALL_EMPTY_ITEM_KEYS)('carries the visible flag of %s through an import', (key) => {
    expect(importedItem(importAll(), key).visible).toBe(false);
  });

  /**
   * ⚠️ The positive control for the case above, and it is what makes it a
   * guard rather than a coincidence. If `s()` stopped whitelisting — if it
   * copied the raw item through — every "carries every field" assertion would
   * pass forever with the schemas empty, deleted or wrong. This is the only
   * case that fails in that world.
   */
  it.each(ALL_EMPTY_ITEM_KEYS)('still strips a field no schema declares, on %s', (key) => {
    expect(importedItem(importAll(), key)).not.toHaveProperty('ZQ_BOGUS');
  });

  /**
   * ⚠️ **`not.toHaveProperty('ZQ_BOGUS')` is existential over ONE name**, and a
   * reviewer walked past it: adding `arbitraryPassthrough: ''` to
   * `buildItemSchema` widens the whitelist for every section — arbitrary
   * imported JSON then reaches the store, `localStorage` and the exported JSON —
   * and all 78 cases stayed green, because the extra key is not the one name the
   * control checks.
   *
   * The set is exactly computable, so it is asserted exactly. This subsumes the
   * `ZQ_BOGUS` case in the strip direction and adds the *over*-permissive
   * direction it could not see; the named case stays because it fails with a
   * clearer message for the common regression.
   */
  it.each(ALL_EMPTY_ITEM_KEYS)('imports exactly the declared key set for %s', (key) => {
    const { _vId: _discarded, ...fields } = createEmptyItem(key);
    const expected = ['_vId', ...Object.keys(fields), 'visible'].sort();

    expect(Object.keys(importedItem(importAll(), key)).sort()).toEqual(expected);
  });

  /**
   * The provenance half. The cases above are behavioural and
   * cannot see *where* the schemas came from — a re-inlined literal that
   * happened to be correct today would pass all of them and then drift, which
   * is the exact state `skill.level`/`language.level` were once in.
   *
   * A value comparison against `createEmptyItem` cannot close that: a copy that
   * has just been made agrees with its source by construction. Spying on the
   * call is universal where the comparison is existential.
   */
  it('calls createEmptyItem for all thirteen keys', () => {
    const spy = vi.spyOn(items, 'createEmptyItem');

    sanitizeResumeData({ basics: { name: 'n' } } as Partial<ResumeData>);

    const calledWith = spy.mock.calls.map(([key]) => key).sort();
    expect(calledWith).toEqual([...ALL_EMPTY_ITEM_KEYS].sort());

    spy.mockRestore();
  });

  /**
   * ⚠️ **The case above is weaker than it looks, and this is the other half.**
   * It observes only that `createEmptyItem` was *called* for every key — never
   * that its **result** is what became the schema. Measured by a reviewer:
   * assigning a hand-written literal over one entry *after* the derivation loop
   * (`itemSchemas.work = { … }`) leaves the loop running, so the call is still
   * made and the spy still sees thirteen keys. All 78 cases passed. That is
   * precisely the re-inlined-literal drift shape this file exists to forbid.
   *
   * A value comparison against `createEmptyItem` cannot close it either — that
   * is the same tautology. What does is making the source **observable**: each key
   * gets its own sentinel field injected into `createEmptyItem`'s return, and
   * the sentinel has to survive the import. A literal cannot produce a field it
   * does not know about, so any schema that did not come from the call fails by
   * name.
   */
  it('builds every schema FROM createEmptyItem, not merely alongside a call to it', () => {
    const real = items.createEmptyItem;
    const spy = vi.spyOn(items, 'createEmptyItem').mockImplementation(((key: EmptyItemKey) => ({
      ...(real(key) as Record<string, unknown>),
      [`ZQ_PROV_${key}`]: 'from-createEmptyItem',
    })) as typeof items.createEmptyItem);

    const payload: Record<string, unknown> = {
      basics: { name: 'n', profiles: [{ network: 'gh', [`ZQ_PROV_profiles`]: 'x' }] },
    };
    for (const key of SECTION_KEYS) payload[key] = [{ [`ZQ_PROV_${key}`]: 'x' }];
    const { sanitized } = sanitizeResumeData(payload as Partial<ResumeData>);

    for (const key of ALL_EMPTY_ITEM_KEYS) {
      expect(
        importedItem(sanitized, key),
        `${key}'s schema did not come from createEmptyItem`,
      ).toHaveProperty(`ZQ_PROV_${key}`);
    }

    spy.mockRestore();
  });

  /**
   * ⚠️ The per-section value pin, and it exists because an earlier one did not.
   * `EMPTY_ITEM_FIELDS.languages` was changed to `level: undefined` — the
   * very drift this file guards against, on the sibling section — and the whole suite stayed
   * green, because the only explicit level assertion was `skills`'.
   *
   * `0` is the seed `SKILL_LEVELS`/`FLUENCY_LEVELS` give the "not specified"
   * option. The seventh copy held `undefined`, which
   * `JSON.stringify` **drops** — so an imported skill reached the persisted
   * store and the exported JSON with no `level` key at all, where one created in
   * the app has `level: 0`.
   */
  it.each([
    ['skills', 'level'],
    ['languages', 'level'],
  ] as const)('seeds %s.%s to 0 for an item that omits it', (section, field) => {
    const { sanitized } = sanitizeResumeData({
      basics: { name: 'n' },
      [section]: [{ name: 'x', language: 'x' }],
    } as unknown as Partial<ResumeData>);

    const imported = (sanitized as unknown as Record<string, unknown[]>)[section][0] as Record<
      string,
      unknown
    >;

    expect(imported[field]).toBe(0);
    expect(JSON.parse(JSON.stringify(imported))).toHaveProperty(field);
  });
});

/**
 * The same schemas, one property over: a schema is a **value**, and one
 * of them serves every item in its section.
 *
 * `s()` used to write `defaults[key]` straight through for an absent key, so
 * every imported item that omitted `highlights` / `keywords` / `courses` got the
 * *same array instance*. Import a résumé whose work entries have no highlights,
 * add one to the first entry, and it appeared on all of them.
 *
 * ⚠️ **`toEqual` cannot see this** — two aliases of one empty array are equal to
 * each other and to `[]`. The guard has to be an identity check plus a mutation.
 */

/**
 * ⚠️ The keys with at least one array field, pinned rather than only derived.
 * Seven of thirteen have one; the other six would make an "arrays are distinct"
 * assertion **vacuous by construction** — the `not.toContain`-over-twelve-themes
 * mistake of round fourteen, where 3 of 12 cases asserted nothing because those
 * themes emit no footer. Deriving the list is what makes it total; pinning it is
 * what makes a section that silently *loses* its array field fail here.
 */
const KEYS_WITH_ARRAY_FIELDS: readonly EmptyItemKey[] = [
  'work',
  'volunteer',
  'education',
  'projects',
  'privateProjects',
  'skills',
  'interests',
];

const arrayFieldsOf = (key: EmptyItemKey): string[] => {
  const { _vId: _discarded, ...fields } = createEmptyItem(key);
  return Object.entries(fields)
    .filter(([, empty]) => Array.isArray(empty))
    .map(([field]) => field);
};

/** Two items per section, each omitting every array field. */
const importTwoBareItems = () => {
  const payload: Record<string, unknown> = { basics: { name: 'n' } };
  for (const key of SECTION_KEYS) {
    const bare = Object.fromEntries(
      Object.entries(createEmptyItem(key)).filter(
        ([field, empty]) => field !== '_vId' && !Array.isArray(empty),
      ),
    );
    payload[key] = [{ ...bare }, { ...bare }];
  }
  return sanitizeResumeData(payload as Partial<ResumeData>).sanitized;
};

describe('an omitted array field gets a fresh instance per item', () => {
  it('agrees with the shapes about which keys have an array field at all', () => {
    const derived = ALL_EMPTY_ITEM_KEYS.filter((key) => arrayFieldsOf(key).length > 0);

    expect([...derived].sort()).toEqual([...KEYS_WITH_ARRAY_FIELDS].sort());
  });

  it.each(KEYS_WITH_ARRAY_FIELDS)('gives %s two distinct array instances', (key) => {
    const sanitized = importTwoBareItems();
    const [first, second] = (sanitized as unknown as Record<string, unknown[]>)[key] as Array<
      Record<string, unknown>
    >;

    const fields = arrayFieldsOf(key);
    expect(fields.length).toBeGreaterThan(0);

    for (const field of fields) {
      expect(first[field], `${key}.${field} was not seeded`).toEqual([]);
      expect(first[field], `${key}.${field} is shared between items`).not.toBe(second[field]);
    }
  });

  /**
   * ⚠️ The behavioural half, and the one that matches the user-visible symptom.
   * An identity check alone would pass against a `structuredClone` that somehow
   * still aliased, and it says nothing about what the user sees. This pushes.
   */
  it.each(KEYS_WITH_ARRAY_FIELDS)('does not leak a push on %s into its sibling', (key) => {
    const sanitized = importTwoBareItems();
    const [first, second] = (sanitized as unknown as Record<string, unknown[]>)[key] as Array<
      Record<string, unknown>
    >;

    for (const field of arrayFieldsOf(key)) {
      (first[field] as unknown[]).push('ZQ_PUSHED');

      expect(second[field], `pushing to ${key}[0].${field} reached ${key}[1]`).toEqual([]);
    }
  });

  /**
   * The positive control, over this block's **own** domain. The two cases above
   * read `sanitized[key]`, and if the fixture ever stopped producing two items
   * per section — a payload shape change, a filter upstream — `second` would be
   * `undefined`, `first[field] !== undefined` would hold trivially and both
   * would pass forever.
   */
  /**
   * ⚠️ **The cases above are scoped to arrays, which is the instance and not the
   * class — and this note is here because no test can close the gap.**
   *
   * `s()`'s absent-key branch writes `defaults[key]` through whatever its shape,
   * so an *object*-valued default aliases exactly the same way. A reviewer
   * demonstrated it by adding a temporary object field to the `work` schema: two
   * imported items got one instance, and pushing into one showed in the other.
   * `arrayFieldsOf` cannot see it, because it filters on `Array.isArray`.
   *
   * ⚠️ **It is not assertable today, and a case that looks like it asserts it is
   * worse than none.** No item shape has an object field, and the one object
   * default that does exist — `schemas.basics.location` — is reachable only
   * *across* calls, where per-call schema construction already guarantees
   * distinctness. A draft of this block compared two `sanitizeResumeData`
   * results and passed identically with the clone narrowed back to arrays: green
   * for a reason unrelated to the property, which is this repo's most-repeated
   * vacuity.
   *
   * So the answer is to make the shape unexpressible rather than detected: `s()`
   * clones **unconditionally**. There is no `Array.isArray` left to be wrong
   * about, and the next default shape needs no new reasoning and no new case
   * here. Prefer that to a guard whose fixture cannot reach the state.
   */
  it.each(KEYS_WITH_ARRAY_FIELDS)(
    'imports two separate %s items for those cases to compare',
    (key) => {
      const items = (importTwoBareItems() as unknown as Record<string, unknown[]>)[key] as Array<
        Record<string, unknown>
      >;

      expect(items).toHaveLength(2);
      expect(items[0]._vId).not.toBe(items[1]._vId);
    },
  );
});
