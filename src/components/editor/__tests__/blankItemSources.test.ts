// @vitest-environment jsdom
import { useLanguageForm } from '@/components/editor/LanguageForm/useLanguageForm';
import { useProfileList } from '@/components/editor/ProfileList/useProfileList';
import { useSkillsForm } from '@/components/editor/SkillsForm/useSkillsForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import * as items from '@/utils/items';
import { createEmptyItem } from '@/utils/items';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Nine of the twelve editor sections are `ArrayForm`s, and they route
 * their "add" button through `createEmptyItem`. `SkillsForm`, `LanguageForm` and
 * `ProfileList` are not `ArrayForm`s and kept their own blank-item literal — the
 * sixth parallel copy of the section inventory, and one of the three had already
 * drifted (`level: undefined as unknown as SkillLevel` against `level: 0`).
 *
 * These three hooks are the last editor forms that build an item themselves, so
 * this file covers them behaviourally: click "add", read what the hook actually
 * put in local state.
 *
 * ## Two properties, and the first draft only had the weaker one
 *
 * ⚠️ **Provenance and value are different claims, and value alone is a
 * tautology against a freshly-copied literal.** Both reviewer passes found this
 * independently, and both measured it: restoring the *exact* earlier bodies of
 * `addLanguage` and `addProfile` left this file at **4 passed** and the whole
 * suite at 1332. Of course it did — every assertion compared the hook's output
 * to a fresh `createEmptyItem` call, and a literal that has just been copied
 * agrees with its source by construction. It fires only once the copy has
 * *drifted*, i.e. after the bug ships. `skills` failed only because its old
 * literal already carried `level: undefined`.
 *
 * So the provenance half is now a spy: `createEmptyItem` must be **called**,
 * with the right key, during the add. That is a universal claim about the call
 * rather than an existential one about the value, and re-inlining any of the
 * three literals fails it whether or not the copy has drifted yet.
 *
 * The value half stays, and it is not redundant with the spy: a form could call
 * `createEmptyItem` and then override a field.
 *
 * ⚠️ **The independent pin is not here, and it must not be.** Asserting the
 * hook's item against `createEmptyItem`'s output cannot, on its own, catch a
 * change to `EMPTY_ITEM_FIELDS` — both sides move together, which is the point
 * of having one definition. What states the expected shape *independently* is
 * `EXPECTED_FIELDS` in `utils/__tests__/items.test.ts`, driven by
 * `ALL_SECTION_KEYS`. The chain is: form → `createEmptyItem` → that pin.
 *
 * ⚠️ …with one gap, since `ALL_SECTION_KEYS` has twelve entries and `profiles`
 * is not among them: `EXPECTED_FIELDS` never runs for `profiles`, whose field
 * set is pinned only by `ItemFor<'profiles'>` requiring all three fields. Fine
 * today; blind to an optional field added later, exactly as that comment warns
 * for `location?` and `level?`.
 *
 * ⚠️ Equality is by **value**, not by field set. The drift found here was a
 * value (`0` vs `undefined`) under a field name both copies agreed on, and
 * `EXPECTED_FIELDS` compares `Object.keys` — it cannot see that one. The
 * `toEqual`s here can, but only for the section under test: the explicit
 * `level` pins below exist because `toEqual` compares both sides against the
 * same source. A reviewer changed `EMPTY_ITEM_FIELDS.languages` to
 * `level: undefined` — the same drift, on the sibling section — and the full
 * suite stayed green with `skills` pinned and `languages` not.
 *
 * ⚠️ **This is a pinned three-hook list, and a pinned list is a regression pin**
 * A fourth non-`ArrayForm` editor form with its own literal produces no
 * match and no failure, which is indistinguishable from a form that has none.
 * The forward guard is `handRolledItems.test.ts`, scoped by the property
 * — a file under `src/components/editor/**` that writes `_vId` as a property key
 * must also mention `createEmptyItem` — and it does **not** retire these three
 * cases. A source scan is a forward guard; the sites that exist are covered
 * behaviourally or not at all.
 *
 * Verified by mutation: re-inlining any of the three literals *unchanged* now
 * fails its provenance case by name; narrowing or widening one fails its value
 * case; and `expect(added.level).toBe(0)` fails for whichever of skills or
 * languages is changed in `EMPTY_ITEM_FIELDS`.
 */

const stripLocalId = (item: Record<string, unknown>) => {
  const { _id: _discarded, ...rest } = item;
  return rest;
};

/** `createEmptyItem` stamps a fresh `_vId` per call, so it can never compare equal. */
const stripIds = (item: Record<string, unknown>) => {
  const { _id: _localId, _vId: _visibilityId, ...rest } = item;
  return rest;
};

describe('the three non-ArrayForm sections seed their blank item from createEmptyItem', () => {
  let initialState: ReturnType<typeof useResumeStore.getState>;

  beforeEach(() => {
    initialState = useResumeStore.getState();
  });

  afterEach(() => {
    useResumeStore.setState(initialState, true);
    vi.restoreAllMocks();
  });

  /**
   * The provenance half. `vi.spyOn` on the module namespace works here because
   * every one of the three hooks imports `createEmptyItem` as a named binding
   * from `@/utils/items` and Vite's ESM interop resolves that through the same
   * module record the spy replaces — verified by mutation, not assumed: with the
   * literal re-inlined the spy records zero calls and the case fails by name.
   *
   * `mockRestore` matters: the value cases below need the real implementation.
   */
  it.each([
    ['skills', () => renderHook(() => useSkillsForm({ defaultCollapsed: true })), 'addSkill'],
    [
      'languages',
      () => renderHook(() => useLanguageForm({ defaultCollapsed: true })),
      'addLanguage',
    ],
    [
      'profiles',
      () =>
        renderHook(() => useProfileList({ profiles: [], onChange: () => {}, onToggle: () => {} })),
      'addProfile',
    ],
  ] as const)(
    '%s asks createEmptyItem for its blank item rather than writing one',
    (sectionKey, mount, addFn) => {
      const spy = vi.spyOn(items, 'createEmptyItem');

      const { result } = mount();
      act(() => (result.current as unknown as Record<string, () => void>)[addFn]());

      expect(spy).toHaveBeenCalledWith(sectionKey);
    },
  );

  it('addSkill produces createEmptyItem(‘skills’), field for field and value for value', () => {
    const { result } = renderHook(() => useSkillsForm({ defaultCollapsed: true }));

    act(() => result.current.addSkill());

    const [added] = result.current.localSkills;
    expect(added).toBeDefined();
    expect(stripIds(added as unknown as Record<string, unknown>)).toEqual(
      stripIds(createEmptyItem('skills')),
    );

    // The drift itself, pinned in the direction it was resolved: `0` is the
    // value `SKILL_LEVELS` gives the "not specified" option, and it is what
    // `EMPTY_ITEM_FIELDS` has always seeded. `toEqual` above treats a missing
    // key and an `undefined` value as equal, so state it separately.
    expect(added.level).toBe(0);
    expect(Object.keys(stripLocalId(added as unknown as Record<string, unknown>))).toEqual(
      Object.keys(createEmptyItem('skills')),
    );
  });

  it('addLanguage produces createEmptyItem(‘languages’)', () => {
    const { result } = renderHook(() => useLanguageForm({ defaultCollapsed: true }));

    act(() => result.current.addLanguage());

    const [added] = result.current.localLanguages;
    expect(added).toBeDefined();
    expect(stripIds(added as unknown as Record<string, unknown>)).toEqual(
      stripIds(createEmptyItem('languages')),
    );

    // ⚠️ The same explicit pin `skills` gets, and it was missing until a
    // reviewer changed `EMPTY_ITEM_FIELDS.languages` to `level: undefined` — the
    // exact drift this test exists for, on the sibling section — and watched the
    // full suite stay green at 1332. `toEqual` above compares both sides against
    // the same source, `EXPECTED_FIELDS` compares `Object.keys` and
    // `{ level: undefined }` keeps the key, and `isItemEmpty` calls both blank.
    // Nothing else in the repo pins this value.
    expect(added.level).toBe(0);
    expect(Object.keys(stripLocalId(added as unknown as Record<string, unknown>))).toEqual(
      Object.keys(createEmptyItem('languages')),
    );
  });

  it('addProfile produces createEmptyItem(‘profiles’)', () => {
    const { result } = renderHook(() =>
      useProfileList({ profiles: [], onChange: () => {}, onToggle: () => {} }),
    );

    act(() => result.current.addProfile());

    const [added] = result.current.localProfiles;
    expect(added).toBeDefined();
    expect(stripIds(added as unknown as Record<string, unknown>)).toEqual(
      stripIds(createEmptyItem('profiles')),
    );
    expect(Object.keys(stripLocalId(added as unknown as Record<string, unknown>))).toEqual(
      Object.keys(createEmptyItem('profiles')),
    );
  });

  /**
   * The positive control. If the harness stopped reaching `addSkill` — a
   * renamed return key, an `act` that no longer flushes, a hook that throws
   * before the callback is bound — every assertion above would pass vacuously
   * on an empty array, because `expect(undefined).toBeDefined()` is the only
   * thing standing between them and nothing at all.
   *
   * ⚠️ Mutating a **required** field is the control that matters, not the count:
   * this asserts the observation channel is live by driving a real edit through
   * it and watching the item move.
   */
  it('the harness observes a real edit, so the assertions above are not vacuous', () => {
    const { result } = renderHook(() => useSkillsForm({ defaultCollapsed: true }));

    act(() => result.current.addSkill());
    const before = stripIds(result.current.localSkills[0] as unknown as Record<string, unknown>);

    act(() => result.current.updateSkill(0, { name: 'ZQSENTINEL' }));
    const after = stripIds(result.current.localSkills[0] as unknown as Record<string, unknown>);

    expect(after).not.toEqual(before);
    expect(after.name).toBe('ZQSENTINEL');
  });
});
