import { ALL_THEME_IDS, THEME_LAYOUTS, isTwoColumnThemeId } from '@/components/preview/themeIds';
import { ALL_UI_SECTION_ORDER } from '@/data/sections';
import { type ResumeData, initialResumeState } from '@/types/resume';
import {
  ALL_SECTION_KEYS,
  DEFAULT_SECTION_ORDER,
  type SectionKey,
  TWO_COLUMN_THEME_DEFAULTS,
  clearUnusedLayoutMetadata,
  dedupeSections,
  getDefaultOneColumnLayout,
  getDefaultTwoColumnLayout,
  getEffectiveSectionOrder,
  getRenderableTwoColumnSections,
  getSortedSectionsForOneColumn,
  isTwoColumnTheme,
  migrateLayoutMetadata,
  migrateToNewLayoutStructure,
  normalizeTwoColumnLayout,
  resolveSectionConflicts,
  sanitizeLayoutMetadata,
  sectionExists,
  sectionHasRenderableContent,
  validateLayoutMetadata,
} from '@/utils/layoutMetadata';
import { describe, expect, it } from 'vitest';

/** A minimal array item — only the section's emptiness matters to layout code. */
const item = (name: string) => ({ name }) as never;

/**
 * Builds a resume whose named sections have one item each and whose theme,
 * stored order and hidden sections are under the test's control.
 */
function resume(options: {
  theme?: string;
  filled?: SectionKey[];
  oneColumn?: string[];
  twoColumn?: { main: string[]; sidebar: string[] };
  hiddenSections?: string[];
}): ResumeData {
  const data = structuredClone(initialResumeState);

  data.meta.theme.name = options.theme ?? 'plain';
  for (const section of options.filled ?? []) {
    data[section] = [item(section)] as never;
  }
  data.meta.content.order.oneColumn = options.oneColumn ?? [];
  data.meta.content.order.twoColumn = {
    main: options.twoColumn?.main ?? [],
    sidebar: options.twoColumn?.sidebar ?? [],
  };
  data.meta.content.hiddenSections = options.hiddenSections ?? [];

  return data;
}

/**
 * Every array-valued key on `ResumeData` is a layout-managed section. This is
 * the drift guard: a new section added to the type must also be added to
 * `ALL_SECTION_KEYS`, or it silently drops out of ordering, theme defaults and
 * the layout editors.
 */
describe('section key inventory', () => {
  // `customSections` is the one array that is not a section: it holds sections,
  // which the layout places by token (`allLayoutSectionIds`).
  const arrayKeys = Object.entries(initialResumeState)
    .filter(([key, value]) => Array.isArray(value) && key !== 'customSections')
    .map(([key]) => key)
    .sort();

  it('ALL_SECTION_KEYS covers every array section on ResumeData', () => {
    expect([...ALL_SECTION_KEYS].sort()).toEqual(arrayKeys);
  });

  it('DEFAULT_SECTION_ORDER is a permutation of ALL_SECTION_KEYS', () => {
    expect([...DEFAULT_SECTION_ORDER].sort()).toEqual([...ALL_SECTION_KEYS].sort());
  });

  it('ALL_UI_SECTION_ORDER is a permutation of ALL_SECTION_KEYS', () => {
    // The editor's own grouped list (`src/data/sections.ts`) is a third copy of
    // the same inventory and drives the empty-sections grid.
    expect([...ALL_UI_SECTION_ORDER].sort()).toEqual([...ALL_SECTION_KEYS].sort());
  });
});

describe('two-column theme defaults', () => {
  // Two assertions used to stand here and both are deleted, because the
  // thing they asserted is now checked at the definition site:
  //
  // 1. "lists exactly the themes the registry calls two-column" — there is no
  //    longer a `TWO_COLUMN_THEMES` array to compare against. `THEME_LAYOUTS`
  //    is the one declaration, and `ThemeRegistryMap` types each entry's
  //    `layout` as `(typeof THEME_LAYOUTS)[K]`, so a registry entry that
  //    disagrees with it fails `tsc -b`.
  // 2. "defines a layout for every two-column theme and nothing else" — the map
  //    below is `Record<TwoColumnThemeId, …>`, a key set derived from
  //    `THEME_LAYOUTS`. A missing key is `TS2741`, an extra one `TS2353`.
  //
  // ⚠️ That second claim is only worth making because `TwoColumnLayoutDefaults`
  // has **no index signature** — the reason `tsc` was proving nothing about the
  // palette literals. Verified by mutation, not by reading the type.
  //
  // What stays is the part no type expresses: the defaults are a partition of
  // the *section* inventory, which is a different family from the theme ids.
  //
  // ⚠️ Driven off `ALL_THEME_IDS`, **not** off `Object.keys(TWO_COLUMN_THEME_DEFAULTS)`.
  // Iterating the map under test is how a suite goes quiet instead of red — the
  // hazard `typstCompile.test.ts` calls out — and here it is reachable rather
  // than theoretical: `TwoColumnThemeId` is derived, and if `THEME_LAYOUTS` ever
  // loses `as const` its values widen to `ThemeLayout`, every conditional branch
  // resolves to `never`, and `Record<never, …>` is satisfied by `{}`. The map
  // would compile empty and this block would run **zero cases**, green. Deriving
  // the list independently makes that loud.
  const twoColumnIds = ALL_THEME_IDS.filter(isTwoColumnThemeId);

  it('has some two-column themes to check', () => {
    expect(twoColumnIds.length).toBeGreaterThan(0);
  });

  it.each(twoColumnIds)('%s places every section exactly once', (theme) => {
    const { main, sidebar } = TWO_COLUMN_THEME_DEFAULTS[theme];
    const placed = [...main, ...sidebar];

    expect(new Set(placed).size).toBe(placed.length);
    expect([...placed].sort()).toEqual([...ALL_SECTION_KEYS].sort());
  });
});

describe('theme predicates', () => {
  it('answers from the exact stored id', () => {
    expect(isTwoColumnTheme('lunar')).toBe(true);
    expect(isTwoColumnTheme('swiss_grid')).toBe(true);
    expect(isTwoColumnTheme('plain')).toBe(false);
    expect(isTwoColumnTheme('timeless')).toBe(false);
  });

  /**
   * ⚠️ **Not "an unknown theme is one-column" any more, and that sentence was
   * the bug.** An unrecognised name does not render a one-column
   * theme — it renders `DEFAULT_THEME`, which is two-column. Answering `false`
   * here while lunar was on screen is what made `getTwoColumnSections` return
   * two empty columns and the CV render with no sections at all.
   *
   * The case-insensitivity this used to assert went the same way: `'Lunar'`
   * lowercased to a two-column id and *also* fell back to a two-column theme,
   * so it agreed by luck, while `'Timeless'` lowercased to a one-column id and
   * fell back to two-column lunar, and rendered nothing. The agreement is
   * pinned universally in
   * `components/preview/__tests__/themeNameResolution.test.ts`.
   */
  it.each([['Lunar'], ['Timeless'], ['swiss-grid'], ['not-a-theme'], ['']])(
    'answers for the theme %o actually resolves to, not for the string',
    (name) => {
      expect(isTwoColumnTheme(name)).toBe(true);
    },
  );

  it('treats a missing theme name as the default theme, which is two-column', () => {
    expect(isTwoColumnTheme(undefined)).toBe(true);
  });
});

describe('sectionExists / sectionHasRenderableContent', () => {
  it('is false for an empty section and true once it has an item', () => {
    const data = resume({ filled: ['work'] });

    expect(sectionExists('work', data)).toBe(true);
    expect(sectionExists('awards', data)).toBe(false);
  });

  /**
   * ⚠️ **This replaces "treats basics as always present", and the inversion is
   * deliberate.** Both predicates opened with
   * `if ((sectionKey as string) === 'basics') return true` — a branch that can
   * only fire for a value the parameter type forbids, reachable because the seven
   * callers that read the persisted order all *cast* a raw string to get there.
   * Those casts are `isSectionKey` narrowings now, so `'basics'` cannot arrive and
   * the branch is gone.
   *
   * ⚠️ **`'basics'` is the only member of `NON_SECTION_ORDER_KEYS` this guard can
   * fail on, and that is the whole point of listing the others.** Every other
   * stale key is already rejected by the length check on `data[key]` — measured
   * on `main`: an order of `['profiles', 'work', '__proto__', 'not_a_section',
   * 'basics', 'constructor']` filtered to `['work', 'basics']`. So a guard built
   * only from prototype keys or invented names passes *identically* with the
   * narrowing removed and proves nothing. The others are here as the negative
   * control for `'basics'`, not as coverage.
   *
   * ⚠️ **Rejecting it fixes a LIVE, user-visible defect, and the first write-up
   * called it latent.** The reasoning was that injecting `'basics'` into the
   * orders gives byte-identical Typst markup and `renderToStaticMarkup` output on
   * all twelve themes. That measurement is correct and it is the wrong oracle:
   * `getSortedSectionsForOneColumn` also feeds `getFirstRenderedSection`, so
   * `'basics'` at the head of a stored order became "the first rendered section"
   * and the page break on the genuinely first one **survived** sanitization — a
   * `#pagebreak()` before the first section, persisted. Asserted in
   * `store/resume/__tests__/pageBreaks.test.ts`; both reviewer passes found it.
   *
   * ⚠️ This is the same trap the `about`/`contact` block at the bottom of this
   * file already documents about this same oracle — *"the measurement rules
   * out the other half"*. It was three hundred lines below the docblock that
   * repeated the mistake.
   *
   * It also broke the claim the three getters in `themes/shared/sections.ts` and
   * the serializer docblocks make — that they "can only yield the twelve
   * `ResumeData` sections". That was false for exactly this value, and is now
   * true. ⚠️ "Twelve serializer docblocks" was itself wrong: eleven carried the
   * comment, and swiss-grid carried neither it nor the `SectionKey` narrowing it
   * describes. Narrowed here too, so twelve is now accurate.
   */
  const NON_SECTION_ORDER_KEYS = [
    'basics',
    'profiles',
    'about',
    'contact',
    'not_a_section',
    '__proto__',
    'constructor',
  ] as const;

  it('rejects every key the persisted order can hold that is not a section', () => {
    const data = resume({ filled: ['work'] });

    for (const key of NON_SECTION_ORDER_KEYS) {
      expect(sectionExists(key as SectionKey, data)).toBe(false);
      expect(sectionHasRenderableContent(key as SectionKey, data, data.meta)).toBe(false);
    }

    // The control: both predicates must be able to say yes, or the loop above is
    // satisfied by a pair of functions that always return false.
    expect(sectionExists('work', data)).toBe(true);
    expect(sectionHasRenderableContent('work', data, data.meta)).toBe(true);
  });

  /**
   * The predicate above is the fact; these are the three places a raw order
   * string reaches it. Asserting **set equality** rather than
   * `not.toContain('basics')` is the round-fifteen lesson: a single
   * `toHaveProperty`-style absence check is existential over the one name it
   * spells, and the surviving set is computable here.
   *
   * ⚠️ **`withStaleArray` is what makes this hold the `isSectionKey` narrowings
   * rather than just the `'basics'` arm.** Every other key in
   * `NON_SECTION_ORDER_KEYS` has no array on `ResumeData`, so `sectionExists`'s
   * length check drops it whether the call site narrows or casts — measured, with
   * all four narrowings reverted to `as SectionKey` the whole suite stayed green,
   * and `tsc` caught only an unused import. Both reviewer passes found that
   * independently; the first draft of this file documented the two-column half of
   * it and missed that the one-column filter was equally unheld. A stale key with
   * a **non-empty array** behind it can only be stopped by the narrowing.
   */
  const withStaleArray = (data: ResumeData): ResumeData => {
    (data as unknown as Record<string, unknown>).not_a_section = [{ name: 'x' }];
    return data;
  };

  it('drops non-section keys from every path that filters the stored order', () => {
    const oneColumn = withStaleArray(
      resume({
        theme: 'plain',
        filled: ['work', 'skills'],
        oneColumn: [...NON_SECTION_ORDER_KEYS, 'work', 'skills'],
      }),
    );

    // ⚠️ `getSortedSectionsForOneColumn` *appends* the sections that have data
    // rather than only filtering, so assert the set — the order of the appended
    // tail is `getEffectiveSectionOrder`'s business, tested separately.
    expect([...getSortedSectionsForOneColumn(oneColumn.meta, oneColumn)].sort()).toEqual(
      ['skills', 'work'].sort(),
    );

    const twoColumn = withStaleArray(
      resume({
        theme: 'lunar',
        filled: ['work', 'skills'],
        twoColumn: {
          main: [...NON_SECTION_ORDER_KEYS, 'work'],
          sidebar: [...NON_SECTION_ORDER_KEYS, 'skills'],
        },
      }),
    );
    const filtered = getRenderableTwoColumnSections(twoColumn.meta, twoColumn);

    expect(filtered.main).toEqual(['work']);
    expect(filtered.sidebar).toEqual(['skills']);
  });

  it('excludes a section the user hid wholesale', () => {
    const data = resume({ filled: ['work', 'awards'], hiddenSections: ['awards'] });

    expect(sectionHasRenderableContent('work', data, data.meta)).toBe(true);
    expect(sectionHasRenderableContent('awards', data, data.meta)).toBe(false);
  });
});

describe('getDefaultTwoColumnLayout', () => {
  /**
   * ⚠️ **`'swiss-grid'` no longer resolves to swiss_grid, and that is the fix.**
   * This asserted the opposite — it was the pin on the second of the
   * three normalisations, `themeName.toLowerCase().replace(/-/g, '_')`. The
   * hyphenated form is the *folder* name; the id is `swiss_grid`, and
   * `getThemeMeta('swiss-grid')` renders `DEFAULT_THEME`. Handing back
   * swiss_grid's column split for a résumé rendering lunar is a disagreement,
   * not a convenience.
   */
  it('gives a hyphenated theme name the default theme layout it actually renders', () => {
    expect(getDefaultTwoColumnLayout('swiss-grid')).toEqual(getDefaultTwoColumnLayout('lunar'));
    expect(getDefaultTwoColumnLayout('swiss-grid')).not.toEqual(
      getDefaultTwoColumnLayout('swiss_grid'),
    );
  });

  it('completes an unknown theme with every remaining section', () => {
    const { main, sidebar } = getDefaultTwoColumnLayout('not-a-theme');

    expect([...main, ...sidebar].sort()).toEqual([...ALL_SECTION_KEYS].sort());
  });

  it('leaves every exact theme id alone', () => {
    for (const id of ALL_THEME_IDS) {
      expect(getDefaultTwoColumnLayout(id)).toEqual(getDefaultTwoColumnLayout(id));
      expect(Object.hasOwn(THEME_LAYOUTS, id)).toBe(true);
    }
    expect(getDefaultTwoColumnLayout('plain')).not.toEqual(getDefaultTwoColumnLayout('lunar'));
  });

  // ⚠️ The stored theme name is an arbitrary string, so it can be a key of
  // `Object.prototype`. Two of them survived the old `toLowerCase()`
  // normalisation — `constructor` and `__proto__` — and the truthiness check on
  // the lookup (`TWO_COLUMN_THEME_DEFAULTS[name]`) took the theme branch on
  // both, then *threw* `defaults.main is not iterable` before this was
  // `Object.hasOwn`. Same shape as `createEmptyItem` once had.
  //
  // ⚠️ The name is now resolved to a `ThemeId` first, so all five are
  // `DEFAULT_THEME` before the lookup and `isTwoColumnTheme` says so — it used
  // to say `false` for every one of them while the renderer showed lunar. The
  // case is kept because the guarantee is about not throwing on arbitrary JSON,
  // and it is `resolveThemeId`'s `Object.hasOwn` that holds it now.
  it.each(['constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty'])(
    'falls back rather than throwing for a stored theme name of %s',
    (name) => {
      const { main, sidebar } = getDefaultTwoColumnLayout(name);

      expect([...main, ...sidebar].sort()).toEqual([...ALL_SECTION_KEYS].sort());
      expect(getDefaultTwoColumnLayout(name)).toEqual(getDefaultTwoColumnLayout('lunar'));
      expect(isTwoColumnTheme(name)).toBe(true);
    },
  );

  it('flattens to main-then-sidebar for a two-column theme asked for one column', () => {
    const defaults = getDefaultTwoColumnLayout('lunar');

    expect(getDefaultOneColumnLayout('lunar')).toEqual([...defaults.main, ...defaults.sidebar]);
    expect(getDefaultOneColumnLayout('plain')).toEqual(DEFAULT_SECTION_ORDER);
  });
});

describe('dedupeSections / resolveSectionConflicts', () => {
  it('keeps the first occurrence and its order', () => {
    expect(dedupeSections(['work', 'skills', 'work', 'awards', 'skills'])).toEqual([
      'work',
      'skills',
      'awards',
    ]);
  });

  it('lets the main column win a section claimed by both', () => {
    expect(resolveSectionConflicts(['work', 'skills'], ['skills', 'awards'])).toEqual({
      main: ['work', 'skills'],
      sidebar: ['awards'],
    });
  });
});

describe('normalizeTwoColumnLayout', () => {
  it('appends a filled section that is in neither column, to its default column', () => {
    const data = resume({ theme: 'lunar', filled: ['work', 'skills'] });

    const normalized = normalizeTwoColumnLayout({ main: ['work'], sidebar: [] }, data, data.meta);

    // `skills` sits in lunar's sidebar default, so that is where it lands.
    expect(normalized.main).toEqual(['work']);
    expect(normalized.sidebar).toEqual(['skills']);
  });

  it('never adds an empty section', () => {
    const data = resume({ theme: 'lunar', filled: ['work'] });

    const normalized = normalizeTwoColumnLayout({ main: ['work'], sidebar: [] }, data, data.meta);

    expect(normalized.sidebar).toEqual([]);
  });

  it('drops duplicates and sidebar entries already in main', () => {
    const data = resume({ theme: 'lunar', filled: ['work', 'skills'] });

    const normalized = normalizeTwoColumnLayout(
      { main: ['work', 'work', 'skills'], sidebar: ['skills'] },
      data,
      data.meta,
    );

    expect(normalized.main).toEqual(['work', 'skills']);
    expect(normalized.sidebar).toEqual([]);
  });
});

describe('getEffectiveSectionOrder', () => {
  it('keeps the custom order first and appends the rest in default order', () => {
    expect(getEffectiveSectionOrder(['skills', 'work'], DEFAULT_SECTION_ORDER)).toEqual([
      'skills',
      'work',
      'education',
      'languages',
      'awards',
      'certificates',
      'publications',
      'projects',
      'volunteer',
      'privateProjects',
      'interests',
      'references',
    ]);
  });

  it('falls back to the default order when there is no custom one', () => {
    expect(getEffectiveSectionOrder(undefined, DEFAULT_SECTION_ORDER)).toEqual(
      DEFAULT_SECTION_ORDER,
    );
    expect(getEffectiveSectionOrder([], DEFAULT_SECTION_ORDER)).toEqual(DEFAULT_SECTION_ORDER);
  });

  it('still reaches every section when the default order is partial', () => {
    const effective = getEffectiveSectionOrder(['skills'], ['work']);

    expect(effective.slice(0, 2)).toEqual(['skills', 'work']);
    expect([...effective].sort()).toEqual([...ALL_SECTION_KEYS].sort());
  });
});

describe('getSortedSectionsForOneColumn', () => {
  it('honours the stored order and skips empty sections', () => {
    const data = resume({
      filled: ['work', 'skills'],
      oneColumn: ['skills', 'awards', 'work'],
    });

    expect(getSortedSectionsForOneColumn(data.meta, data)).toEqual(['skills', 'work']);
  });

  it('falls back to the default order when nothing is stored', () => {
    const data = resume({ filled: ['work', 'education'] });

    expect(getSortedSectionsForOneColumn(data.meta, data)).toEqual(['work', 'education']);
  });

  /**
   * Regression: `OneColumnLayoutEditor` persists only the sections that had
   * data when the user dragged (`OneColumnLayoutEditor.tsx:56` filters by
   * `sectionExists` before `:114` writes the order). A section filled in
   * afterwards is therefore absent from the stored order and used to be
   * dropped from the preview and the PDF entirely.
   */
  it('renders a section that was filled in after the order was stored', () => {
    const data = resume({
      filled: ['work', 'education', 'skills'],
      oneColumn: ['education', 'work'],
    });

    expect(getSortedSectionsForOneColumn(data.meta, data)).toEqual(['education', 'work', 'skills']);
  });

  it('appends in the theme default order for a two-column theme', () => {
    const data = resume({
      theme: 'lunar',
      filled: ['work', 'skills', 'certificates'],
      oneColumn: ['skills'],
    });

    // lunar's flattened default is main-then-sidebar: work, certificates, …
    expect(getSortedSectionsForOneColumn(data.meta, data)).toEqual([
      'skills',
      'work',
      'certificates',
    ]);
  });
});

describe('migrateToNewLayoutStructure', () => {
  it('moves a legacy sectionOrder onto oneColumn and drops the old field', () => {
    const data = resume({});
    const content = data.meta.content as unknown as Record<string, unknown>;
    content.sectionOrder = ['skills', 'work'];

    const migrated = migrateToNewLayoutStructure(data.meta);

    expect(migrated.content.order.oneColumn).toEqual(['skills', 'work']);
    expect(migrated.content).not.toHaveProperty('sectionOrder');
  });

  it('keeps an existing oneColumn order over the legacy field', () => {
    const data = resume({ oneColumn: ['work'] });
    const content = data.meta.content as unknown as Record<string, unknown>;
    content.sectionOrder = ['skills'];

    expect(migrateToNewLayoutStructure(data.meta).content.order.oneColumn).toEqual(['work']);
  });

  it('seeds a whole content block for data that has none', () => {
    const meta = structuredClone(initialResumeState.meta);
    delete (meta as unknown as Record<string, unknown>).content;

    const migrated = migrateToNewLayoutStructure(meta);

    expect(migrated.content.order).toEqual({ oneColumn: [], twoColumn: { main: [], sidebar: [] } });
    expect(migrated.content.hiddenIds).toEqual([]);
  });

  it('does not mutate the meta it is given', () => {
    const data = resume({ oneColumn: ['work'] });

    migrateToNewLayoutStructure(data.meta);

    expect(data.meta.content.order.oneColumn).toEqual(['work']);
  });
});

describe('clearUnusedLayoutMetadata', () => {
  it('repairs non-array order fields', () => {
    const data = resume({});
    const order = data.meta.content.order as unknown as Record<string, unknown>;
    order.oneColumn = 'nonsense';
    order.twoColumn = { main: null, sidebar: undefined };

    const cleared = clearUnusedLayoutMetadata(data.meta);

    expect(cleared.content.order.oneColumn).toEqual([]);
    expect(cleared.content.order.twoColumn).toEqual({ main: [], sidebar: [] });
  });
});

describe('validateLayoutMetadata', () => {
  it('accepts well-formed metadata for either layout mode', () => {
    const oneCol = resume({ theme: 'plain', oneColumn: ['work'] });
    const twoCol = resume({ theme: 'lunar', twoColumn: { main: ['work'], sidebar: ['skills'] } });

    expect(validateLayoutMetadata(oneCol.meta, oneCol)).toEqual([]);
    expect(validateLayoutMetadata(twoCol.meta, twoCol)).toEqual([]);
  });

  it('reports a structurally broken order', () => {
    const data = resume({ theme: 'lunar' });
    (data.meta.content.order as unknown as Record<string, unknown>).twoColumn = {
      main: 'nope',
      sidebar: [],
    };

    expect(validateLayoutMetadata(data.meta, data)).toEqual([
      'Invalid twoColumn layout structure.',
    ]);
  });
});

describe('sanitizeLayoutMetadata', () => {
  it('fills an empty two-column order from the theme defaults', () => {
    const data = resume({ theme: 'misty', filled: ['work', 'skills', 'education'] });

    const sanitized = sanitizeLayoutMetadata(data.meta, data);
    const { main, sidebar } = sanitized.content.order.twoColumn;

    expect([...main, ...sidebar].sort()).toEqual(['education', 'skills', 'work']);
    expect(main).toContain('work');
    expect(sidebar).toContain('education');
  });

  it('resolves a section claimed by both columns in favour of main', () => {
    const data = resume({
      theme: 'misty',
      filled: ['work', 'skills'],
      twoColumn: { main: ['work', 'skills'], sidebar: ['skills'] },
    });

    const { main, sidebar } = sanitizeLayoutMetadata(data.meta, data).content.order.twoColumn;

    expect(main).toEqual(['work', 'skills']);
    expect(sidebar).toEqual([]);
  });
});

describe('getRenderableTwoColumnSections', () => {
  it('removes empty and hidden sections from a two-column order', () => {
    const data = resume({
      theme: 'lunar',
      filled: ['work', 'skills'],
      twoColumn: { main: ['work', 'awards'], sidebar: ['skills', 'interests'] },
      hiddenSections: ['skills'],
    });

    const { main, sidebar } = getRenderableTwoColumnSections(data.meta, data);

    expect(main).toEqual(['work']);
    expect(sidebar).toEqual([]);
  });

  /**
   * ⚠️ **The one-column case that used to live here is deleted with the function
   * it tested.** `filterLayoutMetadataByData` had an `isOneColumnTheme`
   * branch, and it was asserted here — but its only production callers were
   * `getMainSections` / `getSideSections` (now one
   * `getTwoColumnSections`), which return `[]` unless `isTwoColumnLayout(meta)`, so a one-column
   * theme never reached that branch.
   * The live one-column path is `getSortedSectionsForOneColumn`, which gates on
   * `sectionExists` rather than `sectionHasRenderableContent` and is asserted
   * above. Keeping a case for behaviour nothing calls is how a dead branch reads
   * as covered.
   */
  it('does not mutate the meta it is given', () => {
    const data = resume({
      theme: 'lunar',
      filled: ['work'],
      twoColumn: { main: ['work', 'awards'], sidebar: [] },
    });

    getRenderableTwoColumnSections(data.meta, data);

    expect(data.meta.content.order.twoColumn.main).toEqual(['work', 'awards']);
  });
});

describe('migrateLayoutMetadata', () => {
  it('sets the new theme name', () => {
    const data = resume({ theme: 'plain', filled: ['work'] });

    expect(migrateLayoutMetadata(data.meta, 'lunar', data).theme.name).toBe('lunar');
  });

  it('seeds the full theme default when moving from a one-column theme without one', () => {
    const data = resume({ theme: 'plain', filled: ['work', 'skills'] });

    const { main, sidebar } = migrateLayoutMetadata(data.meta, 'lunar', data).content.order
      .twoColumn;

    // Empty sections stay in the stored order; `getRenderableTwoColumnSections`
    // prunes them at render time.
    expect({ main, sidebar }).toEqual(getDefaultTwoColumnLayout('lunar'));
  });

  it('keeps a valid two-column order across a two-column theme change', () => {
    const data = resume({
      theme: 'lunar',
      filled: ['work', 'skills'],
      twoColumn: { main: ['skills'], sidebar: ['work'] },
    });

    const { main, sidebar } = migrateLayoutMetadata(data.meta, 'misty', data).content.order
      .twoColumn;

    expect(main).toEqual(['skills']);
    expect(sidebar).toEqual(['work']);
  });

  it('seeds a one-column order when leaving a two-column theme without one', () => {
    const data = resume({
      theme: 'lunar',
      filled: ['work'],
      twoColumn: { main: ['work'], sidebar: [] },
    });

    expect(migrateLayoutMetadata(data.meta, 'plain', data).content.order.oneColumn).toEqual(
      DEFAULT_SECTION_ORDER,
    );
  });
});

/**
 * `about` and `contact` are label-only, and every section switch that carried an
 * arm for them was dead code.
 *
 * They are in `themes/shared/sections.ts`'s `SectionKey` because six themes put
 * a *header* on a synthesised block — the basics summary and the contact details
 * — and those headers need a translated label like any other. ⚠️ Not "the
 * two-column sidebars", which is what this said first and what
 * `sections.ts` had said for two rounds: soft emits both in its *main* column,
 * swiss-grid puts `about` in the main column, and timeless is *one-column*.
 *
 * They are **not** sections: `ResumeData` has no `about` or `contact` array, so
 * `sectionExists` — a length check on `data[key]` — rejects them.
 *
 * ⚠️ `sanitizeResumeData` also filters a stored order against
 * `ALL_SECTION_KEYS`, but it is **not** a second gate on the common path: it
 * runs only inside `setResume` (import, AI import, cloud restore). `persist`
 * rehydration does not call it, so for a store loaded from `localStorage`
 * `sectionExists` is the sole gate — which is why this file pins that function
 * directly below rather than resting on defence in depth.
 *
 * ⚠️ This is what made ten `case 'about':` / `case 'contact':` arms across six
 * serializers, and two of misty's sidebar components, unreachable. Only misty's
 * two components were first reported; the rest came from re-deriving the scope.
 *
 * ⚠️ **The byte-identical markup measurement is entailed by this premise, not
 * independent of it**, and the commit that shipped it called it "measured rather
 * than reasoned", which is backwards. Seed `data.about` with a non-empty array
 * as well as the order, and every one of those arms fires — the markup differs
 * on all six themes. What makes the deletion safe is the reachability audit
 * (nothing can write such an array: `sanitizeResumeData` whitelists the twelve,
 * `applyCvSuggestion` bails unless the key already holds an array or an object, and
 * `applyReorgSuggestion` throws on `undefined` before its write), and that is
 * reasoning. The measurement rules out the *other* half — that some theme reads
 * the order without filtering it.
 *
 * Asserted here rather than left to the deletion, because the deletion is not
 * self-describing: the next person to write a section switch has no way to know
 * these two do not belong in it. ⚠️ Do **not** answer a future "my Contact
 * section does not render" by adding them to `ALL_SECTION_KEYS` — that list is
 * the canonical twelve and a thirteenth member is a build error in **ten** files
 * by design. ⚠️ Eight was the figure this docblock shipped with, carried
 * forward from an earlier census; re-running it here (append a key, `tsc -b
 * --force`, count distinct files) gives ten — three source, seven test. It was
 * already stale before this change touched it. Give them a content source instead, or leave them as labels.
 */
describe('about and contact are labels, not sections', () => {
  const twoColumn = ALL_THEME_IDS.filter(isTwoColumnTheme);

  // ⚠️ `toBeGreaterThan(0)`, not `toHaveLength(6)`, matching the idiom this file
  // established for `twoColumnIds` above. The count is derived from
  // `THEME_LAYOUTS`; pinning it means legitimately making a theme one-column
  // fails here with nothing to say but "change 6 to 5". What must not happen
  // silently is `it.each([])`, which vitest runs as **zero** tests, green.
  it('covers every two-column theme', () => {
    expect(twoColumn.length).toBeGreaterThan(0);
  });

  /**
   * ⚠️ The single fact everything above rests on, pinned once instead of six
   * times through one of its consequences.
   *
   * The block below asserts a property of `getRenderableTwoColumnSections`. That is
   * one consumer of `sectionExists`; `getEffectiveSectionOrder` is another, and
   * it *appends* `ALL_SECTION_KEYS` rather than filtering by it, so a stored
   * one-column order naming `about` is gated by `sectionExists` alone. Pinning
   * the predicate covers both paths and every future one.
   */
  it('has no data behind either key', () => {
    const data = resume({ filled: ['work'] });

    expect(sectionExists('about' as SectionKey, data)).toBe(false);
    expect(sectionExists('contact' as SectionKey, data)).toBe(false);
    // The control: the predicate must be able to say yes, or the two above are
    // satisfied by a function that always returns false.
    expect(sectionExists('work', data)).toBe(true);
  });

  it.each(twoColumn)('%s drops both keys from both columns', (themeId) => {
    // ⚠️ The order is seeded explicitly. `resume()` defaults `twoColumn` to two
    // empty arrays and nothing downstream populates them, so a fixture that
    // injected only `about`/`contact` would filter down to `[]` and satisfy
    // "neither key survives" vacuously — the vacuous-fixture trap, and the control below is
    // what caught it here.
    const data = resume({
      theme: themeId,
      filled: ['work', 'skills'],
      twoColumn: { main: ['about', 'contact', 'work'], sidebar: ['about', 'contact', 'skills'] },
    });

    const filtered = getRenderableTwoColumnSections(data.meta, data);

    expect(filtered.main).not.toContain('about');
    expect(filtered.main).not.toContain('contact');
    expect(filtered.sidebar).not.toContain('about');
    expect(filtered.sidebar).not.toContain('contact');
    // The control: the filter must keep the sections that do have data, or
    // "neither key survives" is satisfied by a filter that drops everything.
    expect([...filtered.main, ...filtered.sidebar]).toEqual(
      expect.arrayContaining(['work', 'skills']),
    );
  });
});
