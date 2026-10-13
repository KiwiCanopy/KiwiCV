import { useResumeStore } from '@/store/resume/useResumeStore';
import { initialResumeState } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { ALL_SECTION_KEYS, type SectionKey } from '@/utils/layout/constants';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * The last copy of the section inventory, and the one the census could not
 * see.
 *
 * `setResume` walked an inline `Array<keyof ResumeData>` of **eleven** entries
 * (`skills` was bolted on as a twelfth block underneath) to build
 * `updatedSections`, which is then spread over `currentResume`.
 *
 * ⚠️ **It was a latent hazard, not a live defect — this file said otherwise and
 * a reviewer pass measured it.** The eleven plus `skills` were *exactly*
 * `ALL_SECTION_KEYS`: equal sets, nothing discarded in 4.0.1. The decisive
 * measurement is this file itself — run unchanged against the pre-fix
 * code it passes **17/17**. Read the defect as "nothing held two lists equal",
 * not as "imports were lossy".
 *
 * What made it worth closing is the failure mode *if* they diverged. `mergedData`
 * spreads `updatedSections` over `currentResume`, so a section absent from the
 * walk keeps whatever the store held and the imported one is **silently dropped**
 * — on every JSON import, Drive/GitHub sync pull and AI apply. No exception, no
 * warning, no diff.
 *
 * ⚠️ **And nothing would have told anyone.** The census for this family is to add
 * a thirteenth key to `ALL_SECTION_KEYS` and run `npx tsc -b --force`; on
 * the pre-fix code that gave **20 errors in 14 files** and none of them here, because
 * `Array<keyof ResumeData>` is satisfied by any subset of the keys.
 *
 * ⚠️ **The completeness half is carried by there being no list, not by `tsc`** —
 * the earlier claim that the census closes it "in both directions" was wrong in
 * the second direction. Re-inlining an eleven-entry literal annotated
 * `readonly SectionKey[]` and dropping a key produces the *same* `TS2345` the fix
 * does, so that error tracks the annotation rather than the coverage. The
 * behavioural claim — *an imported résumé arrives whole* — is what this file
 * asserts, over `ALL_SECTION_KEYS` rather than over a list; measured, that
 * re-inlining fails three cases here and names the missing section.
 *
 * ⚠️ **The empty starting store is what makes it non-vacuous, and it is asserted
 * rather than assumed.** `mergedData` falls back to `currentResume[key]` for an
 * unwalked section, so a fixture whose store already held the imported items
 * would pass with the walk deleted entirely.
 */

/**
 * ⚠️ `_vId` is the sentinel because it is the one field every item shape has and
 * the importer **preserves** rather than regenerates: `sanitizeArray` keeps a
 * non-empty incoming `_vId` that differs from the schema's (`validation.ts:676`).
 * Any other field would have to be chosen per section.
 */
const vid = (key: SectionKey) => `ZQ-${key}`;

/**
 * One item per section.
 *
 * ⚠️ Built from `createEmptyItem`, not hand-written: `sanitizeResumeData`
 * whitelists an item's fields by its schema, so an item of an invented shape
 * would arrive stripped and the payload would stop resembling a résumé the
 * importer accepts.
 */
const seededPayload = (): Record<string, unknown> => {
  const payload: Record<string, unknown> = { basics: { name: 'Census Fixture' } };
  for (const key of ALL_SECTION_KEYS) {
    payload[key] = [{ ...createEmptyItem(key), _vId: vid(key) }];
  }
  return payload;
};

const stored = (key: SectionKey): Array<Record<string, unknown>> =>
  (useResumeStore.getState().resume as unknown as Record<string, Array<Record<string, unknown>>>)[
    key
  ];

describe('setResume writes every declared section', () => {
  let initial: ReturnType<typeof useResumeStore.getState>;

  beforeEach(() => {
    initial = useResumeStore.getState();
    useResumeStore.setState({ resume: structuredClone(initialResumeState) });
  });

  afterEach(() => {
    useResumeStore.setState(initial, true);
  });

  /**
   * ⚠️ The precondition, asserted first. Every case below is "the imported item
   * is in the store", and the unwalked-section fallback is `currentResume[key]`
   * — so if the fixture's store were already populated the whole block would pass
   * with the walk deleted. It is empty, so a section the walk skips reads `[]`.
   */
  it('starts from a store with no section items at all', () => {
    for (const key of ALL_SECTION_KEYS) {
      expect(stored(key)).toEqual([]);
    }
  });

  it.each(ALL_SECTION_KEYS)('imports the %s section', (key) => {
    useResumeStore.getState().setResume(seededPayload(), { silent: true });

    expect(stored(key).map((item) => item._vId)).toEqual([vid(key)]);
  });

  /**
   * The same property stated once over the whole inventory, so a walk that wrote
   * eleven of twelve names the missing one instead of failing one anonymous
   * `it.each` row — and so the *set* is pinned rather than twelve independent
   * memberships.
   */
  it('leaves no section behind', () => {
    useResumeStore.getState().setResume(seededPayload(), { silent: true });

    expect(ALL_SECTION_KEYS.filter((key) => stored(key)[0]?._vId !== vid(key))).toEqual([]);
  });

  /**
   * ⚠️ The positive control for the block above, and it moves a value rather
   * than counting one. The cases above would all pass on a store that was
   * populated once and never written again; this drives a *second* import with
   * different sentinels and requires every section to change.
   */
  it('a second import replaces what the first one wrote', () => {
    useResumeStore.getState().setResume(seededPayload(), { silent: true });

    const second = seededPayload();
    for (const key of ALL_SECTION_KEYS) {
      (second[key] as Array<Record<string, unknown>>)[0]._vId = `ZQ2-${key}`;
    }
    useResumeStore.getState().setResume(second, { silent: true });

    expect(ALL_SECTION_KEYS.filter((key) => stored(key)[0]?._vId !== `ZQ2-${key}`)).toEqual([]);
  });

  /**
   * `skills` is the one section with an extra pass in front of it
   * (`validateSkills`), and folding it into the walk is what let the inline list
   * be the whole inventory instead of eleven twelfths of it. Its normalisation
   * still has to run, so this pins what the fold must not lose: an out-of-range
   * legacy level is migrated onto the 1–4 scale rather than stored raw.
   */
  it('still runs skills through validateSkills inside the walk', () => {
    const payload = seededPayload();
    (payload.skills as Array<Record<string, unknown>>)[0].level = 95;

    useResumeStore.getState().setResume(payload, { silent: true });

    expect(stored('skills')[0].level).toBe(4);
    expect(stored('skills')[0]._vId).toBe(vid('skills'));
  });

  /**
   * The unchanged-section fast path, which the walk also owns: a section whose
   * imported value matches the stored one keeps its array **identity**, so
   * subscribers bound to it do not re-render. Asserted because the rewrite moved
   * `skills` onto that path for the first time — it used to carry its own
   * `JSON.stringify` comparison below the loop.
   */
  it('keeps the previous array identity for a section that did not change', () => {
    useResumeStore.getState().setResume(seededPayload(), { silent: true });
    const before = Object.fromEntries(ALL_SECTION_KEYS.map((key) => [key, stored(key)]));

    useResumeStore.getState().setResume(seededPayload(), { silent: true });

    expect(ALL_SECTION_KEYS.filter((key) => stored(key) !== before[key])).toEqual([]);
  });
});
