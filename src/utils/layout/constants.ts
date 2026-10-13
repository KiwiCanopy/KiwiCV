import type { TwoColumnThemeId } from '@/components/preview/themeIds';

/**
 * All available section keys in resume data
 */
export const ALL_SECTION_KEYS = [
  'work',
  'volunteer',
  'education',
  'awards',
  'certificates',
  'publications',
  'projects',
  'privateProjects',
  'skills',
  'languages',
  'interests',
  'references',
] as const;

export type SectionKey = (typeof ALL_SECTION_KEYS)[number];

/**
 * Sections that have an item shape. `profiles` lives under `basics.profiles`
 * rather than in `ALL_SECTION_KEYS`, but its entries are items like any other.
 *
 * Not `SectionMetadataKey`: that union also carries `'basics'`, which has no
 * item shape and would become a mandatory bogus entry in `EMPTY_ITEM_FIELDS`.
 *
 * ⚠️ Declared here rather than in `utils/items.ts` so `SectionMetadataKey`
 * below can be written as an extension of it instead of restating `| 'profiles'`
 * in a second file. The item *shapes* still live in `utils/items.ts`;
 * this module owns the inventories.
 */
export type EmptyItemKey = SectionKey | 'profiles';

/**
 * The runtime inventory for `EmptyItemKey`, spread from `ALL_SECTION_KEYS` so a
 * thirteenth section lands here with no edit. Consumers that need to *walk* the
 * item keys (`utils/validation.ts`'s sanitizer schemas) use this rather
 * than restating the twelve, which would bring back the hand-written seventh copy of
 * the item inventory the sanitizer once carried.
 *
 * ⚠️ `as const satisfies` plus the alias below, per the both-halves rule
 * (`.claude/rules/testing.md`): the `satisfies` rejects a bogus member, and only
 * the `Exclude` constrained to `never` rejects a **missing** one. `satisfies` alone would let
 * `EmptyItemKey` gain a member silently, and the walk would then skip a whole
 * section's schema — the exact drift shape, one level up.
 */
export const ALL_EMPTY_ITEM_KEYS = [
  ...ALL_SECTION_KEYS,
  'profiles',
] as const satisfies readonly EmptyItemKey[];

export type _EmptyItemKeysAreExhaustive<
  Missing extends never = Exclude<EmptyItemKey, (typeof ALL_EMPTY_ITEM_KEYS)[number]>,
> = Missing;

/**
 * Everything the editor UI can show as a section entry: the twelve, `profiles`,
 * and `basics` — the one member with no array anywhere on `ResumeData`.
 *
 * ⚠️ **Written as `EmptyItemKey | 'basics'`, and the direction of that
 * derivation is the claim.** It says "everything with an item shape is also a
 * card the editor can show, plus the basics form itself" — which is true of
 * `profiles` for the same reason it is an `EmptyItemKey` at all (it behaves like
 * a section whose array happens to live under `basics`). It previously restated
 * `SectionKey | 'basics' | 'profiles'`, i.e. a second copy of the `| 'profiles'`
 * decision in a different file from the first.
 *
 * ⚠️ It is **not** `Record`-keyed anywhere, so neither drift direction is a
 * build error here. `SECTION_METADATA` in `data/sections.ts` is
 * `Record<string, SectionMetadata>`; what pins that map against the canonical
 * inventory is `layout.test.ts`'s `ALL_UI_SECTION_ORDER` permutation test, and
 * that walks `ALL_SECTION_KEYS` — `basics` and `profiles` are deliberately
 * outside it.
 */
export type SectionMetadataKey = EmptyItemKey | 'basics';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'work',
  'education',
  'skills',
  'languages',
  'awards',
  'certificates',
  'publications',
  'projects',
  'volunteer',
  'privateProjects',
  'interests',
  'references',
];

export type TwoColumnLayoutDefaults = {
  main: string[];
  sidebar: string[];
};

/**
 * Where each two-column theme puts each section by default.
 *
 * Keyed by `TwoColumnThemeId`, which is derived from `THEME_LAYOUTS` — so a
 * theme switched to `'two-column'` in that table fails the build here until it
 * gets a layout (`TS2741`), and an entry for a theme that is not two-column is
 * an excess property (`TS2353`). This was `Record<string, …>` with a runtime
 * set-equality test against a hand-written `TWO_COLUMN_THEMES` array; both the
 * array and the test are gone.
 */
export const TWO_COLUMN_THEME_DEFAULTS: Record<TwoColumnThemeId, TwoColumnLayoutDefaults> = {
  swiss_grid: {
    main: ['work', 'education', 'publications'],
    sidebar: [
      'skills',
      'volunteer',
      'awards',
      'certificates',
      'interests',
      'projects',
      'privateProjects',
      'references',
      'languages',
    ],
  },
  lunar: {
    main: ['work', 'certificates', 'education', 'awards', 'publications'],
    sidebar: [
      'skills',
      'languages',
      'interests',
      'projects',
      'privateProjects',
      'volunteer',
      'references',
    ],
  },
  misty: {
    main: ['work', 'skills', 'awards', 'volunteer', 'publications'],
    sidebar: [
      'education',
      'certificates',
      'projects',
      'privateProjects',
      'languages',
      'interests',
      'references',
    ],
  },
  foggy: {
    main: ['work', 'skills', 'awards', 'publications', 'volunteer'],
    sidebar: [
      'education',
      'certificates',
      'projects',
      'privateProjects',
      'languages',
      'interests',
      'references',
    ],
  },
  soft: {
    main: ['work', 'education', 'publications'],
    sidebar: [
      'skills',
      'languages',
      'interests',
      'projects',
      'privateProjects',
      'volunteer',
      'awards',
      'certificates',
      'references',
    ],
  },
  skyline: {
    main: ['work', 'skills', 'awards', 'publications'],
    sidebar: [
      'education',
      'languages',
      'projects',
      'privateProjects',
      'volunteer',
      'references',
      'interests',
      'certificates',
    ],
  },
};
