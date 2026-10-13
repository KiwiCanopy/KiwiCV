import { ThemeRegistry, paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, THEME_LAYOUTS, type ThemeId } from '@/components/preview/themeIds';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { TYPST_FONTS, getTypstFontList } from '@/components/preview/themes/shared/typstUtils';
import { themes } from '@/locales/en/themes';
import { buildPlaceholderResume } from '@/test/placeholderResume';
import { buildSingleItemResume } from '@/test/singleItemResume';
import {
  TYPST_INIT_TIMEOUT_MS,
  compileToPdf,
  initTypstCompiler,
  isPdf,
  mapIcons,
  mapProfileImage,
} from '@/test/typstCompile';
import type { ResumeData } from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { ALL_SECTION_KEYS, type SectionKey } from '@/utils/layout/constants';
import { isTwoColumnTheme } from '@/utils/layout/predicates';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Compiles every theme's Typst output, rather than asserting on the emitted
 * string.
 *
 * Three compile failures, two of them in misty, shipped through a suite that was
 * green: the serializer tests check substrings, and a one-element Typst tuple is
 * a perfectly plausible substring that happens not to compile. Each of those
 * three failed the *whole* PDF export for any CV that hit the boundary. This
 * file is the layer under those tests — it never asks what the markup says,
 * only whether the compiler accepts it.
 *
 * It found a fourth on its first run: StackOverflow emitted `#pagebreak()`
 * inside a `#block`, which Typst rejects, so one checkbox in the layout editor
 * killed that theme's export outright.
 *
 * ⚠️ One block at the bottom — `manual page breaks` — is the exception to the
 * paragraph above and does read the markup, because the failure it exists for
 * is a theme that emits *nothing*, which compiles perfectly. It needs no
 * compiler and runs in milliseconds; it lives here because it shares this
 * file's fixture and its theme × section table, not because it compiles.
 */

/**
 * Each scenario is an input shape that reaches a branch the others do not.
 *
 * Column placement matters because misty's crash was in its `isSide`
 * branch, so a two-column theme compiled only in its default layout leaves half
 * of its serializer unexercised. Both extremes are derived from the fixture's
 * own default order, never listed by hand.
 */
type Scenario = {
  name: string;
  twoColumnOnly?: boolean;
  multiPaletteOnly?: boolean;
  // ⚠️ `ThemeId`, not `string`. `CASES` only ever supplies `ALL_THEME_IDS`
  // members, and the wider parameter was the whole reason the scenario below
  // needed `ThemeRegistry[id as ThemeId]` — a cast, one file over.
  build: (themeId: ThemeId) => ResumeData;
};

const invertLayout = (data: ResumeData, into: 'main' | 'sidebar'): ResumeData => {
  const { main, sidebar, sidebarPosition } = data.meta.content.order.twoColumn;
  const all = [...main, ...sidebar];

  data.meta.content.order.twoColumn =
    into === 'main'
      ? { main: all, sidebar: [], sidebarPosition }
      : { main: [], sidebar: all, sidebarPosition };

  return data;
};

const withTwoCustomSections = (data: ResumeData): ResumeData => {
  const second = { id: 'b2c4e6f8-0000-4000-8000-000000000002', title: '', items: [] as never[] };
  data.customSections = [
    ...data.customSections,
    {
      ...second,
      items: [
        {
          name: 'Untitled entry',
          startDate: '',
          endDate: '',
          url: '',
          summary: '',
          highlights: [],
        },
      ],
    },
  ];
  // A title is free text: quotes and Typst syntax must not break the export.
  data.customSections[0].title = 'My "Side" Gigs #1 $x <y> @z';
  data.customSections[0].items.push({
    name: 'Hidden entry',
    startDate: '2020',
    endDate: '',
    url: '',
    summary: '',
    highlights: [],
    _vId: 'hidden-custom',
  });
  data.meta.content.hiddenIds = [
    ...data.meta.content.hiddenIds,
    `custom:${data.customSections[0].id}:hidden-custom`,
  ];
  data.meta.content.order.twoColumn.sidebar.push(`custom:${second.id}`);
  data.meta.content.order.oneColumn.push(`custom:${second.id}`);
  return data;
};

const SCENARIOS: Scenario[] = [
  { name: 'single item', build: (id) => buildSingleItemResume(id) },
  {
    name: 'all sections in main',
    twoColumnOnly: true,
    build: (id) => invertLayout(buildSingleItemResume(id), 'main'),
  },
  {
    name: 'all sections in sidebar',
    twoColumnOnly: true,
    build: (id) => invertLayout(buildSingleItemResume(id), 'sidebar'),
  },
  {
    // An untitled section (fallback heading) and a hidden entry, in both columns.
    name: 'two custom sections',
    build: (id) => withTwoCustomSections(buildSingleItemResume(id)),
  },
  {
    name: 'every page break set',
    build: (id) => buildSingleItemResume(id, { pageBreaks: true }),
  },
  {
    name: 'classic cover letter',
    build: (id) => buildSingleItemResume(id, { classicLetter: true }),
  },
  {
    // The signature footer is bottom-anchored with `#v(1fr)`. Every other case
    // here has a one-paragraph letter, where the anchor has room to work; this
    // is the case where it must collapse instead, and it also puts a letter
    // through a page break, which nothing else did.
    name: 'page-filling cover letter',
    build: (id) => buildSingleItemResume(id, { longLetter: true }),
  },
  {
    // ⚠️ Every case above leaves the fixture's palette alone, which is how a
    // palette bug survived this file: a palette that resolves to nothing emits literal
    // `undefined` where a colour belongs, and five themes failed to compile on
    // it. This takes the **last** id the picker offers.
    //
    // `multiPaletteOnly` for the same reason `twoColumnOnly` exists — elegant,
    // plain and plain2 declare only `default`, so their case would be a
    // byte-identical rerun of 'single item' and three of the suite's most
    // expensive operations for no coverage.
    //
    // The prototype-key ids behind that bug are not compiled here, because
    // `paletteResolution.test.tsx` asserts their markup is byte-identical to
    // the fallback palette's, which this file already compiles.
    name: 'last declared palette',
    multiPaletteOnly: true,
    build: (id) => {
      const data = buildSingleItemResume(id);
      const palettes = ThemeRegistry[id].palettes ?? [];
      data.meta.theme.params = {
        ...data.meta.theme.params,
        palette: palettes[palettes.length - 1]?.id,
      };
      return data;
    },
  },
  {
    // The placeholder resume is every new user's first PDF, and the only
    // fixture carrying a profile image. Built the way `Viewer.tsx` builds it.
    name: 'placeholder resume',
    build: buildPlaceholderResume,
  },
];

const hasSecondPalette = (themeId: ThemeId) => (ThemeRegistry[themeId].palettes ?? []).length > 1;

const CASES = ALL_THEME_IDS.flatMap((themeId) =>
  SCENARIOS.filter(
    (scenario) =>
      (!scenario.twoColumnOnly || isTwoColumnTheme(themeId)) &&
      (!scenario.multiPaletteOnly || hasSecondPalette(themeId)),
  ).map((scenario) => ({ themeId, scenario: scenario.name, build: scenario.build })),
);

const TWO_COLUMN_IDS = ALL_THEME_IDS.filter(isTwoColumnTheme);

describe('Typst compile smoke test', () => {
  beforeAll(() => initTypstCompiler(), TYPST_INIT_TIMEOUT_MS);

  // `Record<ThemeId, …>` already makes both drift directions compile errors.
  // This is the runtime half, and it is not redundant: the table above is built
  // from `ALL_THEME_IDS`, so if the registry and the serializer map ever *both*
  // lost a theme the suite would simply stop testing it and stay green.
  it('has a serializer for every registered theme and nothing else', () => {
    expect(Object.keys(SERIALIZERS).sort()).toEqual(Object.keys(ThemeRegistry).sort());
    expect(Object.keys(ThemeRegistry).sort()).toEqual([...ALL_THEME_IDS].sort());
  });

  // The preview-right/PDF-wrong shape: the two outputs resolve differently —
  // the HTML preview takes `HTMLComponent` off the entry found by **key**
  // (`ResumeHTML.tsx`), the PDF looks up `SERIALIZERS` by **`themeMeta.id`**
  // (`Viewer.tsx`) — so `foggy: { id: 'misty', … }` ships foggy's preview beside
  // misty's PDF.
  //
  // That is now a build error too: `ThemeRegistryMap` binds `id` and `nameKey`
  // to the key, where the old `Record<ThemeId, ThemeMeta>` constrained
  // the keys and said nothing about the values. This stays as the runtime half
  // for the same reason the `SERIALIZERS` set-equality test above does — the
  // type is only a guard while someone keeps the annotation on. `nameKey` is
  // checked here too, because the mapped type pins it and this is its runtime half.
  //
  // `layout` is bound to the key the same way, so it is checked here
  // for the same reason and in the same place. It would otherwise be the one
  // key-bound field with no runtime half — and it is load-bearing beyond the
  // theme picker: `components/modals/export/useExportRun.ts` and
  // `useSyncWorkflow.ts` both branch on `themeMeta.layout === 'two-column'`.
  it('keys every registry entry by its own id, name key and layout', () => {
    const mismatched = Object.entries(ThemeRegistry)
      .filter(
        ([key, meta]) =>
          meta.id !== key ||
          meta.nameKey !== `themes.names.${key}` ||
          meta.layout !== THEME_LAYOUTS[key as ThemeId],
      )
      .map(([key, meta]) => `${key} -> ${meta.id} / ${meta.nameKey} / ${meta.layout}`);

    expect(mismatched).toEqual([]);
  });

  // The runtime half of the theme-name guard, and it is not redundant for the same reason as
  // the two above: `satisfies Record<ThemeId, string>` in `locales/en/themes.ts`
  // is an **annotation**, and deleting it silently deletes the whole guard. No
  // type error, no lint rule, and `i18n:check` cannot see it either — the theme
  // picker's `t(theme.nameKey)` lookups are explicitly allowlisted in
  // `scripts/i18n/config.cjs:58-66`, which is precisely the hole this closes.
  //
  // English alone closes all fifteen locales: `checkLocales` enforces
  // key-for-key parity against it, and the other fourteen files are typed
  // `Translations['themes']`, which is derived from this object.
  it('has a display name for every theme and nothing else', () => {
    expect(Object.keys(themes.names).sort()).toEqual([...ALL_THEME_IDS].sort());
  });

  // The fixture's promise — exactly one of every array-bearing field — is what
  // makes these cases reach the bug at all, and hand-written object literals
  // cannot enforce it. Without this, adding a thirteenth section to `ResumeData`
  // leaves the fixture at `[]` for it: its serializer path is never compiled and
  // every case below stays green, which is this file's own failure mode one
  // level up. Both halves in one assertion — a missing field reads 0, a widened
  // one 2. `meta` is excluded because its arrays (section orders, page breaks)
  // are legitimately multi-element; it gets its own check next.
  it('the fixture holds exactly one of every array-bearing field', () => {
    const wrong: string[] = [];

    const walk = (value: unknown, path: string) => {
      if (Array.isArray(value)) {
        if (value.length !== 1) wrong.push(`${path} has ${value.length}`);
        value.forEach((entry, i) => walk(entry, `${path}[${i}]`));
      } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
      }
    };

    const { meta: _meta, ...content } = buildSingleItemResume('lunar');
    walk(content, 'resume');

    expect(wrong).toEqual([]);
  });

  // ⚠️ The check for the failure this file already had. A two-column serializer
  // reads the stored order directly, so an empty one emits a document with no
  // sections at all — which compiles, and asserts nothing. The first draft of
  // the fixture ordered through `migrateLayoutMetadata`, which does not
  // populate an empty order, and every two-column case was hollow while green.
  // Nothing else here notices if the layout getters start returning less.
  it.each(TWO_COLUMN_IDS)('places every section in the %s fixture', (themeId) => {
    const { main, sidebar } = buildSingleItemResume(themeId).meta.content.order.twoColumn;
    const placed = [...main, ...sidebar];

    expect(new Set(placed).size).toBe(placed.length);
    // The twelve built-ins plus the fixture's custom section.
    const custom = buildSingleItemResume(themeId).customSections.map((s) => `custom:${s.id}`);
    expect([...placed].sort()).toEqual([...ALL_SECTION_KEYS, ...custom].sort());
  });

  it.each(CASES)(
    'compiles $themeId ($scenario)',
    async ({ themeId, build }) => {
      const resume = build(themeId);

      // Same two steps the worker runs: the serializers emit
      // `image("/icons/<name>.svg")` for files that exist only at render time.
      await mapIcons(
        serializeIconsMap(resume, paletteIconFills(themeId, resume.meta.theme.params?.palette)),
      );
      await mapProfileImage(resume.basics.image);

      const markup = SERIALIZERS[themeId](resume);
      const pdf = await compileToPdf(markup);

      expect(isPdf(pdf)).toBe(true);
      // The first compile also loads the WASM compiler and fonts; 5 s timed out
      // under a loaded full run.
    },
    30_000,
  );

  it.each(ALL_THEME_IDS)(
    'compiles custom social profiles for %s theme',
    async (themeId) => {
      const resume = buildSingleItemResume(themeId);
      resume.basics.profiles = [
        { network: 'Custom Network', username: 'customuser', url: 'https://example.com/custom' },
      ];

      await mapIcons(
        serializeIconsMap(resume, paletteIconFills(themeId, resume.meta.theme.params?.palette)),
      );
      await mapProfileImage(resume.basics.image);

      const markup = SERIALIZERS[themeId](resume);
      const pdf = await compileToPdf(markup);

      expect(isPdf(pdf)).toBe(true);
    },
    30_000,
  );
});

/**
 * The compile sweep proves a page break does not *crash* a theme. It cannot
 * prove the theme honours it — a serializer that emits no break at all compiles
 * perfectly, which is exactly how `elegant` shipped ignoring the setting
 * outright: twelve breaks configured in the layout editor, three pages
 * out, against fourteen for every other one-column theme.
 *
 * So this is the string half, and it is deliberately per *section* rather than
 * per theme. Both halves of a drift guard, from one loop:
 *
 * 1. **Missing** — a theme with no break handling at all fails on all twelve.
 * 2. **Narrowed** — a theme whose break *condition* excludes a section (the
 *    `hasItems` test omitting it, the shape once found by hand) fails on
 *    exactly that section.
 *
 * Setting a break can only ever *add* markup, so "the output is byte-identical
 * to the no-break output" is the same statement as "this setting did nothing",
 * without depending on which token the theme emits — one-column themes use
 * `#pagebreak()`, two-column themes and StackOverflow use `#colbreak()`.
 *
 * ⚠️ **Half 2 reaches the break condition and stops there — on half the
 * themes.** It does *not* catch a section missing from a serializer's
 * `serializeSection` switch wherever the break is decided from `meta` alone:
 * deleting a `case` loses the section body while the break still fires, so the
 * two strings still differ and this stays green. That is the **six one-column**
 * themes, which gate on a `hasItems` flag computed from the data rather than
 * from the rendered section.
 *
 * The other six — foggy, skyline, soft and now lunar, misty and
 * swiss_grid — serialize the section first and drop the break when it comes
 * back empty, which makes them strictly better covered: deleting a `case` there
 * *does* fail this test. Verified by mutation on `LunarSerializer.ts:281`
 * (`case 'awards'`), which reports `[ 'awards' ]` as ignored.
 *
 * Those twelve switches are the largest line item of the theme census, and
 * nothing here guards the one-column six — the compile sweep cannot either,
 * since an empty Typst document compiles.
 *
 * ⚠️ **The fixture writes `meta.content.pageBreaks` directly**, so it exercises
 * the *pre-sanitize* state. `sanitizePageBreaks` (`store/resume/utils.ts:82-101`)
 * drops the break on the first rendered section, so no serializer ever sees one
 * in production. Deliberate — it keeps the assertion uniform across all twelve
 * sections — but it does mean a serializer hardened with that same first-section
 * skip would fail here rather than pass.
 */
describe('manual page breaks', () => {
  /** The fixture places all twelve in every theme — see the tests above. */
  const breakOn = (resume: ResumeData, sectionKey: string): ResumeData => {
    // Both columns, because a two-column theme checks the break list of the
    // column the section actually landed in and the fixture chooses that.
    resume.meta.content.pageBreaks = {
      oneColumn: [sectionKey],
      twoColumn: { main: [sectionKey], sidebar: [sectionKey] },
    };
    return resume;
  };

  it.each(ALL_THEME_IDS)('%s honours a break on each of the twelve sections', (themeId) => {
    const unbroken = SERIALIZERS[themeId](buildSingleItemResume(themeId));

    const ignored = ALL_SECTION_KEYS.filter(
      (sectionKey) =>
        SERIALIZERS[themeId](breakOn(buildSingleItemResume(themeId), sectionKey)) === unbroken,
    );

    expect(ignored).toEqual([]);
  });

  /**
   * The other half of the fix, and the half the test above cannot see: the emit
   * is gated on `hasItems`, because a break before a section that renders
   * nothing is a blank page in the exported PDF. The fixture carries one item in
   * every section, so `hasItems` is unconditionally true above — delete
   * `&& hasItems` from any serializer and the test above stays green.
   *
   * ⚠️ **The obvious way to write this does not work, and passes.** Emptying the
   * section (`resume.work = []`) never reaches the gate: `getOneColumnSections`
   * filters the order through `sectionHasRenderableContent` → `sectionExists`,
   * which is a length check, so an empty section is gone before the loop. The
   * first draft did exactly that and the mutation — dropping `&& hasItems` from
   * elegant — passed it. The reachable state is a section whose items are each
   * **hidden**: `sectionExists` still counts them, so the section stays in the
   * order, while `getVisibleData` filters them out and `hasItems` goes false.
   * That is a real user state — hiding entries is one click per item.
   *
   * Same oracle as above, inverted: the break must now make *no* difference.
   *
   * ⚠️ **All twelve themes, deliberately — the carve-out this started with was
   * a bug report, not a scope decision.** Lunar, misty and swiss_grid used to
   * emit `#colbreak()` from `meta` alone, with no check that the section renders
   * anything, so a section with every item hidden took a stray column break with
   * it. `sanitizePageBreaks` does not catch it either — for two-column it
   * filters on `hiddenSections` alone (`store/resume/utils.ts:93-100`). The
   * three now gate the emit on the serialized section, so this drives from
   * `ALL_THEME_IDS` and there is no list of exceptions left to drift.
   *
   * ⚠️ **The gate is narrower than foggy/skyline/soft's, deliberately.** Those
   * three drop the empty section from the output stream entirely, so its
   * inter-section spacer goes with it; this one gates only the break, leaving the
   * `#v(…)` spacer in place, because touching the `idx < length - 1` spacing
   * would churn every serializer string test for a cosmetic double gap. This
   * assertion cannot see that either way — the spacer is identical in the break
   * and no-break runs.
   */
  it.each(ALL_THEME_IDS)('%s emits no break before an all-hidden section', (themeId) => {
    const allHidden = (sectionKey: SectionKey): ResumeData => {
      const resume = buildSingleItemResume(themeId);
      const items = resume[sectionKey] as Record<string, unknown>[];
      resume.meta.content.hiddenIds = items.map((item) => getSectionItemHash(sectionKey, item));
      return resume;
    };

    const stray = ALL_SECTION_KEYS.filter(
      (sectionKey) =>
        SERIALIZERS[themeId](breakOn(allHidden(sectionKey), sectionKey)) !==
        SERIALIZERS[themeId](allHidden(sectionKey)),
    );

    expect(stray).toEqual([]);
  });
});

describe('Typst compile harness', () => {
  beforeAll(() => initTypstCompiler(), TYPST_INIT_TIMEOUT_MS);

  it('rejects with the compiler diagnostic when the markup is broken', async () => {
    // The original failing shape: a one-element parenthesised expression is grouping, not
    // an array. If this ever stops throwing, every case above is vacuous.
    await expect(
      compileToPdf('#set text(font: "Inter")\n#let xs = ("a")\n#grid(..xs)'),
    ).rejects.toThrow(/cannot spread string/);
  });

  it('names only registered families in the shared font stacks, and renders Cyrillic', async () => {
    // A plain `Noto Sans` sat in both stacks, registered in neither
    // `EAGER_FONT_FILES` nor the lazy set, so every compile logged `unknown font
    // family: noto sans`. Pin its absence, then prove the fix loses no coverage:
    // Cyrillic still compiles through the real stack (Inter and DejaVu, the two
    // eager faces the harness registers, both carry the glyphs).
    expect(TYPST_FONTS.sans).not.toContain('Noto Sans');
    expect(TYPST_FONTS.serif).not.toContain('Noto Sans');
    const pdf = await compileToPdf(
      `#set text(font: ${getTypstFontList('sans')})\nПривіт, світе — Здравствуйте, мир`,
    );
    expect(isPdf(pdf)).toBe(true);
  });
});
