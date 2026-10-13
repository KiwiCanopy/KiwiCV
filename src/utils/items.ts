import type { CustomSection, CustomSectionItem, ResumeData } from '@/types/resume';
import { type EmptyItemKey, type SectionKey } from '@/utils/layout/constants';

/**
 * Checks if an item (typically a resume section entry) is "empty".
 * An item is considered empty if all its fields are effectively empty:
 * - String fields are empty or whitespace only.
 * - Array fields are empty.
 * - Number fields are 0 (default level/score).
 * - Boolean fields are false (default visibility usually handled separately, but false is safe).
 * - Nested objects are recursively empty.
 */
export function isItemEmpty(item: Record<string, unknown> | null | undefined): boolean {
  if (!item || typeof item !== 'object') return true;

  return Object.entries(item).every(([key, value]) => {
    // Skip metadata fields
    if (key === '_id' || key === '_vId' || key === 'visible') return true;

    if (value === null || value === undefined) return true;

    if (typeof value === 'string') {
      return value.trim() === '';
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'number') {
      // 0 is often a default level or empty state in resume forms
      return value === 0;
    }

    if (typeof value === 'boolean') {
      return value === false;
    }

    if (typeof value === 'object') {
      return isItemEmpty(value as Record<string, unknown>);
    }

    return false;
  });
}

/** A list with no entry holding content — nothing for Improve to act on. */
export function isSectionEmpty(items: readonly unknown[] | null | undefined): boolean {
  return !items || items.every((item) => isItemEmpty(item as Record<string, unknown>));
}

/**
 * The entries an editor list persists: blank ones dropped, the editor-local `_id`
 * removed. `_vId` stays — `hiddenIds` addresses entries by it.
 */
export function persistableItems<T extends { _id: string }>(items: T[]): Omit<T, '_id'>[] {
  return items
    .filter((item) => !isItemEmpty(item as Record<string, unknown>))
    .map(({ _id, ...rest }) => rest);
}

/**
 * Generates a simple random ID for local state tracking.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

type ArrayEl<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;

/**
 * The item type each key's factory must produce, read straight off `ResumeData`
 * rather than restated. This is what turns a *narrowed* entry below into a build
 * error — `Record<EmptyItemKey, () => Record<string, unknown>>` constrains only
 * the keys, so `awards: () => ({ title: '' })` used to compile, and a missing
 * required field is exactly the drift once found by hand.
 *
 * Fields declared optional in `ResumeData` (`location?`, `level?`) stay
 * omittable, so `EXPECTED_FIELDS` in `items.test.ts` is still the only thing
 * pinning those.
 */
type ItemMap = {
  [K in EmptyItemKey]: K extends 'profiles'
    ? ArrayEl<ResumeData['basics']['profiles']>
    : K extends SectionKey
      ? ArrayEl<ResumeData[K]>
      : never;
};

/**
 * ⚠️ An indexed access on a mapped type, **not** a bare conditional, and the
 * difference is load-bearing. Written as
 * `K extends 'profiles' ? … : K extends SectionKey ? … : never`, TS resolves it
 * eagerly wherever `K` is only constraint-known — so at `useArrayForm`'s call,
 * where `K extends ArraySectionKeys`, it collapses to the union of all twelve
 * item shapes and can no longer be related to `ArrayElement<ResumeData[K]>`.
 * That produced a `TS2352` there, and a first draft answered it by
 * widening the local back to `Record<string, unknown>` — which threw the typed
 * overload away for nine of the twelve sections while advertising it. `ItemMap[K]`
 * defers, so the generic call keeps the real type. Found by the architect pass,
 * with the working alternative attached.
 */
export type ItemFor<K extends EmptyItemKey> = ItemMap[K];

/**
 * What an `EMPTY_ITEM_FIELDS` entry must actually produce: every field of the
 * item type, **including the optional ones**, minus the two bookkeeping fields
 * that belong to other layers.
 *
 * ⚠️ **`ItemFor<K>` alone is not total, and that makes it a one-edit bug.**
 * `location?`, `level?` and friends stay omittable under it, so an entry could
 * silently lack a declared field — and since `utils/validation.ts` now derives
 * the import whitelist from this map, a field missing here is *stripped on every
 * `setResume`*. Measured: adding `department?: string` to `ResumeData['work']`
 * gave `tsc -b --force` **exit 0** and a full green suite, while an imported
 * `department` vanished. Found by an architect pass.
 *
 * `Required<Omit<…>>` moves that to the declaration site: the same mutation is
 * now `TS2741` on the `work` entry below. `items.test.ts`'s `EXPECTED_FIELDS`
 * does not retire — it pins the field *names* a type cannot state a value for —
 * but it is no longer the only thing standing between a new optional field and
 * silent data loss.
 *
 * ⚠️ `visible` and `_vId` are `Omit`ted rather than left to `Required` because
 * they are genuinely not part of the item shape: `_vId` is stamped by
 * `createEmptyItem` itself and `visible` is added by `buildItemSchema` at the
 * import layer. `EXPECTED_FIELDS` pins their absence.
 */
type ItemShape<K extends EmptyItemKey> = Required<Omit<ItemFor<K>, 'visible' | '_vId'>>;

/**
 * `projects` and `privateProjects` share one item shape. Referencing a single
 * **factory** from both keys keeps them from drifting apart without aliasing:
 * each call allocates its own `highlights` array.
 *
 * ⚠️ A shared `const PROJECT_FIELDS = { … }` spread into both entries would
 * not — a shallow spread copies the *same* array reference into every item ever
 * created, so pushing to one item's highlights mutates another's. `toEqual`
 * cannot see that; `items.test.ts`'s "own array instances" test can.
 */
const projectFields = (): ItemShape<'projects'> => ({
  name: '',
  description: '',
  highlights: [],
  roles: [],
  keywords: [],
  startDate: '',
  endDate: '',
  url: '',
  entity: '',
  location: '',
  type: '',
});

/**
 * The item shape per section — the fifth parallel copy of the section
 * inventory, and the one place it is checked by the compiler.
 *
 * Keying it on `EmptyItemKey` makes **both** drift directions build errors at
 * the definition site, regardless of `createEmptyItem`'s `string` parameter:
 * a key added to `ALL_SECTION_KEYS` with no entry here is `TS2741`, and an entry
 * left behind after a key is removed is `TS2353`. The second direction is one no
 * test can reach — a test can enumerate `ALL_SECTION_KEYS`, but it cannot
 * enumerate a `switch`'s cases, which is what this used to be.
 *
 * Typing the *values* as `ItemFor<K>` rather than `Record<string, unknown>`
 * carries that down to the field level: a misspelt or missing required field is
 * a build error here too, checked against `ResumeData` itself.
 *
 * Values are factories, never shared constants — see `projectFields` above.
 */
const EMPTY_ITEM_FIELDS: { [K in EmptyItemKey]: () => ItemShape<K> } = {
  work: () => ({
    name: '',
    position: '',
    location: '',
    url: '',
    startDate: '',
    endDate: '',
    summary: '',
    highlights: [],
  }),
  volunteer: () => ({
    organization: '',
    position: '',
    location: '',
    url: '',
    startDate: '',
    endDate: '',
    summary: '',
    highlights: [],
  }),
  education: () => ({
    institution: '',
    location: '',
    url: '',
    area: '',
    studyType: '',
    startDate: '',
    endDate: '',
    score: '',
    courses: [],
  }),
  awards: () => ({ title: '', date: '', awarder: '', location: '', summary: '', url: '' }),
  certificates: () => ({ name: '', date: '', issuer: '', url: '' }),
  publications: () => ({ name: '', publisher: '', releaseDate: '', url: '', summary: '' }),
  projects: projectFields,
  privateProjects: projectFields,
  skills: () => ({ name: '', level: 0, keywords: [] }),
  languages: () => ({ language: '', certificate: '', level: 0 }),
  interests: () => ({ name: '', keywords: [] }),
  references: () => ({ name: '', reference: '' }),
  profiles: () => ({ network: '', username: '', url: '' }),
};

/**
 * The custom-section entry shape. Outside `EMPTY_ITEM_FIELDS` on purpose:
 * that map is keyed by `EmptyItemKey`, which drives the section inventories a
 * dynamic, user-titled section is not part of.
 */
export const customSectionItemFields = (): Required<
  Omit<CustomSectionItem, 'visible' | '_vId'>
> => ({
  name: '',
  startDate: '',
  endDate: '',
  url: '',
  summary: '',
  highlights: [],
});

export const createCustomSectionItem = (): CustomSectionItem & { _vId: string } => ({
  _vId: generateId(),
  ...customSectionItemFields(),
});

export const createCustomSection = (title: string): CustomSection => ({
  id: crypto.randomUUID(),
  title,
  items: [],
});

/**
 * Creates a default empty item structure for a given section.
 *
 * An unknown section yields `{ _vId }` alone, which `isItemEmpty` reads as
 * empty. `_vId` stays first so `getResumeHash` sees an unchanged JSON shape.
 *
 * ⚠️ `Object.hasOwn`, not a plain truthiness check on the lookup. The `switch`
 * this replaced was total over `string`; an object index is not, and reaches
 * `Object.prototype` — `createEmptyItem('valueOf')` threw `Cannot convert
 * undefined or null to object` and `'toString'` spread `"[object Undefined]"`
 * into a character-keyed item. That runtime guard is what the "unknown section"
 * tests pin, and it stays whatever the signature says.
 *
 * **The typed return is what lets a caller consume the result without a cast**,
 * and that is the whole reason the three non-`ArrayForm` forms could drop
 * their own blank-item literals. `Record<string, unknown>` types every field
 * `unknown`, so `{ _id, ...createEmptyItem('skills') }` is not assignable to
 * `LocalSkill` and the call site has to assert a shape — which is precisely the
 * restatement being deleted. `ItemFor<K>` is read off `ResumeData`, so the call
 * site gets the real item type and a *narrowed* `EMPTY_ITEM_FIELDS` entry
 * becomes a build error at the form.
 *
 * ⚠️ `K` is inferred from the **value** argument at every production site. A
 * signature whose guarantee depends on an author remembering to write
 * `<Something>` is advice, not a guard. `useArrayForm` does write it, but
 * as `<K & EmptyItemKey>` where `K` is its own enclosing generic — there is no
 * author choice to forget there, only a formulation that compiles or does not.
 *
 * ⚠️ **There is no `string` overload, and the reason there was one is a claim
 * that was never checked.** It read "for `initializeSection`'s sake";
 * `initializeSection` is declared `(section: SectionKey) => void`, so it resolves
 * through the typed signature and always did. Both reviewer passes measured the
 * same thing independently: deleting the overload produced **zero** production
 * errors and seven in two test files. Keeping it meant
 * `createEmptyItem('skils')` compiled clean and returned `{ _vId }` with no
 * fields — the "user clicks add and nothing appears" failure, with no compiler
 * signal. The out-of-domain tests now cast at their call sites, which is where a
 * deliberate escape from the domain belongs.
 */
export function createEmptyItem<K extends EmptyItemKey>(
  sectionId: K,
): ItemFor<K> & { _vId: string } {
  const fields = Object.hasOwn(EMPTY_ITEM_FIELDS, sectionId)
    ? EMPTY_ITEM_FIELDS[sectionId]
    : undefined;

  return { _vId: generateId(), ...(fields ? fields() : {}) } as ItemFor<K> & { _vId: string };
}
