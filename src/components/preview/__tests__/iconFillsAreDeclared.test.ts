import {
  ThemeRegistry,
  getActivePalette,
  paletteIconFills,
} from '@/components/preview/ThemeRegistry';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { describe, expect, it } from 'vitest';

/**
 * The colour every PDF icon is drawn in comes from the **palette**, and from
 * nowhere else.
 *
 * `serializeIconsMap` used to be handed a fill and then override it, dispatching
 * on the résumé's own `meta.theme.name` for lunar, timeless and javascript — 16
 * of the 40 palettes — and resolving javascript's palette a *third* way
 * (`params?.palette || 'light'`, neither `resolvePalette` nor
 * `getActivePalette`). Both resolutions are gone: the caller resolves theme and
 * palette once and hands over two colours, and `ThemePaletteMeta.iconUi` /
 * `iconUiMuted` are where the three corrected themes state theirs.
 *
 * ⚠️ **Two independent properties, and the first does not imply the second.**
 *
 * 1. *Declared* — every emitted icon carries exactly the fill the registry
 *    declares for the selected palette, on all forty. This is what a re-added
 *    `if (themeId === 'lunar')` in the serializer would break.
 * 2. *Theme-blind* — for one résumé and one pair of fills, the icon map does not
 *    depend on `meta.theme.name` **at all**, including the boundary spellings
 *    (`'Lunar'`, `'LUNAR'`, `'constructor'`). Property 1 alone cannot
 *    see a reintroduced dispatch that happens to agree with the registry today;
 *    this one makes the whole class unexpressible rather than merely absent.
 *
 * ⚠️ `paletteResolution.test.tsx`'s distinctness control deliberately does *not*
 * cover this — it asserts the swatch (`ui`), because the icon fill is legitimately
 * constant across lunar's and timeless's seven palettes each. Its earlier version
 * read the fill and passed only because the value it read was being discarded
 * downstream.
 */

/** Every colour an emitted SVG actually paints with — `none` is not a colour. */
const paintsIn = (svg: string): Set<string> =>
  new Set(
    [...svg.matchAll(/(?:^|\s)(?:stroke|fill)="([^"]*)"/g)]
      .map((match) => match[1])
      .filter((value) => value !== 'none'),
  );

/**
 * ⚠️ Profiles are seeded so the **social** icons are in the map too. They come
 * from a different source (`SocialIcons`, via `getProfileIconPDF`) and are
 * recoloured by the same loop, so a fixture without them measures two thirds of
 * the icons this function emits.
 */
const resumeFor = (themeId: ThemeId, paletteId: string): ResumeData => {
  const resume = buildSingleItemResume(themeId);
  resume.meta.theme.params = { ...resume.meta.theme.params, palette: paletteId };
  resume.basics.profiles = [
    { _vId: 'p1', network: 'GitHub', username: 'ada', url: 'https://github.com/ada' },
    { _vId: 'p2', network: 'LinkedIn', username: 'ada', url: 'https://linkedin.com/in/ada' },
  ];
  return resume;
};

const THEME_PALETTES: [ThemeId, string][] = ALL_THEME_IDS.flatMap((themeId) =>
  ThemeRegistry[themeId].palettes.map((palette): [ThemeId, string] => [themeId, palette.id]),
);

describe('every icon is painted in its palette’s declared fill', () => {
  it('covers all forty palettes', () => {
    expect(THEME_PALETTES).toHaveLength(40);
  });

  it.each(THEME_PALETTES)('%s/%s', (themeId, paletteId) => {
    const { iconUi, iconUiMuted } = getActivePalette(themeId, paletteId);
    const iconsMap = serializeIconsMap(
      resumeFor(themeId, paletteId),
      paletteIconFills(themeId, paletteId),
    );

    // The assertion is over the whole map at once, so a name that stops being
    // emitted is a diff rather than a silently skipped case.
    const painted = Object.fromEntries(
      Object.entries(iconsMap).map(([name, svg]) => [name, [...paintsIn(svg)].sort()]),
    );
    const expected = Object.fromEntries(
      Object.keys(iconsMap).map((name) => [
        name,
        [name === 'external-link' ? iconUiMuted : iconUi],
      ]),
    );

    expect(Object.keys(iconsMap).length).toBeGreaterThan(20);
    expect(painted).toEqual(expected);
  });
});

/**
 * ⚠️ **The stored theme name reaches nothing.** This is the mutation probe recast
 * as an assertion rather than a probe: `'Lunar'` and `'LUNAR'` are the
 * spellings that used to take lunar's colour at the call site while missing
 * `isLunar` inside, and `'constructor'` is the prototype key `isThemeId` lets
 * through because it uses `Object.hasOwn` without lowercasing.
 *
 * Sentinel fills rather than real colours, so the comparison cannot be satisfied
 * by two themes happening to declare the same hex.
 */
describe('the icon map does not depend on the stored theme name', () => {
  const FILLS = { icon: 'ZQICON', muted: 'ZQMUTED' };
  const STORED_NAMES = ['lunar', 'Lunar', 'LUNAR', 'javascript', 'timeless', 'constructor', ''];

  it('renders one map for every spelling', () => {
    const maps = STORED_NAMES.map((name) => {
      const resume = resumeFor('lunar', 'default');
      resume.meta.theme.name = name;
      return JSON.stringify(serializeIconsMap(resume, FILLS));
    });

    expect(new Set(maps).size).toBe(1);
  });

  /**
   * The positive control the equality above needs: identical maps would also be
   * what a function ignoring `fills` produced. Both sentinels must land, and
   * `muted` must land on `external-link` alone — two adjacent `string`
   * parameters are interchangeable by definition, and a swap paints every
   * icon in the de-emphasised colour with the equality still green.
   */
  it('spends both fills, and the muted one only on external-link', () => {
    const iconsMap = serializeIconsMap(resumeFor('lunar', 'default'), FILLS);
    const mutedNames = Object.entries(iconsMap)
      .filter(([, svg]) => svg.includes(FILLS.muted))
      .map(([name]) => name);

    expect(mutedNames).toEqual(['external-link']);
    expect(Object.values(iconsMap).filter((svg) => svg.includes(FILLS.icon)).length).toBe(
      Object.keys(iconsMap).length - 1,
    );
  });
});

/**
 * The design decision, pinned as a set so it cannot be tidied away silently.
 *
 * A palette whose `iconUi` differs from its `ui` is saying *my swatch is a
 * background*: lunar's swatches are its dark sidebar, timeless's and
 * javascript's are the page. Collapsing `iconUi` back to `ui` on any of the three
 * reproduces the invisible-icon bug it once made reachable; adding a theme to the
 * list is a real decision that should be read, not inherited.
 */
describe('which palettes declare an icon fill of their own', () => {
  /**
   * ⚠️ **Counted per palette, not per theme, because `some()` is existential and
   * a per-theme pin has a hole exactly the size of the bug.** The first draft
   * listed the three theme *names*; collapsing lunar's `default` back to its
   * swatch — one palette of seven, the invisible-icon regression on the default
   * selection, which is the one most users see — left the other six differing,
   * so `some` stayed true and the whole file was green. Measured, not reasoned
   * about. A per-palette count fails on any single collapse.
   *
   * Themes with no differing palette are omitted rather than recorded as `0`, so
   * a thirteenth theme cannot pass by being absent from a hand-written list.
   */
  const countBy = (
    predicate: (palette: (typeof ThemeRegistry)[ThemeId]['palettes'][number]) => boolean,
  ) =>
    Object.fromEntries(
      ALL_THEME_IDS.map((themeId): [ThemeId, number] => [
        themeId,
        ThemeRegistry[themeId].palettes.filter(predicate).length,
      ]).filter(([, count]) => count > 0),
    );

  it('is every palette of the three themes whose swatch is a background', () => {
    expect(countBy((palette) => palette.iconUi !== palette.ui)).toEqual({
      lunar: 7,
      javascript: 2,
      timeless: 7,
    });
  });

  it('and lunar alone de-emphasises external-link, on all seven', () => {
    expect(countBy((palette) => palette.iconUiMuted !== palette.iconUi)).toEqual({ lunar: 7 });
  });
});
