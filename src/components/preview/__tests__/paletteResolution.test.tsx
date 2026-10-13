import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  ThemeRegistry,
  getActivePalette,
  paletteNameKey,
} from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { resolvePalette } from '@/components/preview/themes/shared/palette';
import { en as translations } from '@/locales/en';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { sourceFiles } from '@/test/sourceFiles';
import type { ResumeData } from '@/types/resume';
import { lookupTranslation } from '@/utils/translationLookup';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * How a stored palette id becomes a palette — the **lookup**, not the
 * inventory.
 *
 * ⚠️ The inventory used to be `palettes.test.ts`, since deleted: the registry's
 * palette ids and each theme's colour-map keys are now one key set at compile
 * time (`ThemeRegistry.ts`'s `paletteMetas`), so both drift directions are build
 * errors and there is nothing left for a runtime assertion to add.
 *
 * There are **two** lookups over that one key set, and they are not the same
 * function: `resolvePalette` reads a theme's colour **map** (the text and
 * backgrounds), and `getActivePalette` reads the registry **array** (the picker
 * swatch, and the icon fill the PDF is drawn with). They resolve a stored id
 * independently and must land on the same palette, or a résumé's icons take one
 * palette's colour while its text takes another's. Both are asserted below.
 *
 * `meta.theme.params.palette` is `palette?: string` (`types/resume.ts`) and is
 * never narrowed in `utils/validation.ts`, so it arrives off persisted state
 * and imported JSON as an arbitrary string. Every one of **24**
 * sites — one per theme in each of `*Serializer.ts` and `*HTML.tsx` — once wrote the
 * lookup out by hand as `map[id] || map.default`, which reaches
 * `Object.prototype`: for `constructor` and `__proto__` the index returns an
 * inherited, **truthy** value, so the `||` never fires and every colour read
 * off it is `undefined`.
 *
 * Measured on `main`: **all twelve** HTML previews rendered differently, eleven
 * of them with literal `undefined` in the emitted markup, and on the PDF side
 * javascript emitted 119 `undefined`s into its Typst while elegant, javascript,
 * misty, stackoverflow and timeless **failed to compile outright**. So a
 * miscoloured preview on every theme and a dead PDF export on five, from one
 * bad string in persisted state.
 *
 * The 24 sites are now one `resolvePalette`, so the property is stated once and
 * asserted on both outputs. Four parts, because they fail independently:
 *
 * 1. The resolver falls back — for a prototype key **and** for an ordinary
 *    unknown id. The second is what already worked and is the easy casualty of
 *    fixing the first (the both-halves rule, `.claude/rules/testing.md`).
 * 2. Every **serializer** routes through it, asserted on emitted Typst.
 * 3. Every **HTML component** routes through it, asserted on rendered markup.
 *    ⚠️ Not redundant with 2: the twelve components are a separate set of call
 *    sites, and javascript's is the one site in the repo whose fallback id is
 *    not `default`. Dropping that third argument returns `undefined` typed as a
 *    palette — which `tsc -b` cannot see, because `resolvePalette` is declared
 *    to return `T`.
 * 4. No theme file indexes a palette map directly.
 *
 * Parts 2 and 3 share a positive control: a **declared** palette must still
 * change the output. Without it, a resolver that always returned the fallback
 * would pass both outright.
 *
 * ⚠️ **Part 4 is a source scan and proves nothing about behaviour** — parts 2
 * and 3 are what prove the code works. It is kept for the one thing they cannot
 * cover: a *new* site written in the old idiom, before it is wired to a theme.
 * It is narrow in ways worth knowing — rooted at `themes/`, and its pattern
 * wants an identifier starting with `PALETTES` indexed on one line, so an
 * aliased import or a lookup in `src/utils/` slips past it.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const THEMES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'themes');

/**
 * Every key a raw index resolves to on `Object.prototype`.
 *
 * ⚠️ This said "the two keys" and listed `constructor` and `__proto__` until
 * it was measured: there are **twelve**, and all twelve are truthy, so all
 * twelve defeat a `map[id] || map.default`. The two-key figure is true only
 * where the id is `toLowerCase()`d first (the theme-id lookups), which this
 * path does not do. Derived rather than restated so it cannot drift again.
 */
const PROTOTYPE_KEYS = Object.getOwnPropertyNames(Object.prototype);

/**
 * Every id that must land on the theme's own fallback palette.
 *
 * Two prototype representatives rather than all twelve: `resolvePalette`'s
 * `Object.hasOwn` treats them identically by construction — the unit block
 * below covers the full set — and this list is multiplied by twelve themes and
 * two outputs, each a full serialize or render.
 */
const FALLING_BACK = ['constructor', '__proto__', 'nonexistent', undefined];

/**
 * The picker's own list for a theme. Its first entry is the id that theme falls
 * back to — `default` everywhere except javascript, which declares no `default`
 * palette — so the fallback is read off the registry rather than restated here.
 *
 * No `?? []` and no non-empty assertion at the use sites: `ThemeMeta['palettes']`
 * is a required non-empty tuple, and `paletteMetas` — its only
 * producer — cannot return an empty list.
 */
const palettesFor = (themeId: ThemeId) => ThemeRegistry[themeId].palettes;

const withPalette = (themeId: ThemeId, palette: string | undefined): ResumeData => {
  const data = buildSingleItemResume(themeId);
  data.meta.theme.params = { ...data.meta.theme.params, palette };
  return data;
};

/** The same three props `ResumeHTML.tsx` passes, with the formatters stubbed. */
const renderTheme = (themeId: ThemeId, palette: string | undefined): string =>
  renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data: withPalette(themeId, palette),
      formatCVDate: (value?: string) => value || '',
      formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
    }),
  );

const serializeTheme = (themeId: ThemeId, palette: string | undefined): string =>
  SERIALIZERS[themeId](withPalette(themeId, palette));

describe('resolvePalette', () => {
  const map = { default: 'D', light: 'L', ocean: 'O' };

  it('returns the declared palette for a declared id', () => {
    expect(resolvePalette(map, 'ocean')).toBe('O');
  });

  it('falls back for an ordinary unknown id, and for no id at all', () => {
    expect(resolvePalette(map, 'nonexistent')).toBe('D');
    expect(resolvePalette(map, '')).toBe('D');
    expect(resolvePalette(map, undefined)).toBe('D');
  });

  // The original shape. `map['constructor']` is `Object` — truthy — so the `||`
  // form these 24 sites used returned it instead of falling back. All twelve
  // inherited names behave the same way; see `PROTOTYPE_KEYS` above.
  it.each(PROTOTYPE_KEYS)('falls back for the prototype key %s', (key) => {
    expect(resolvePalette(map, key)).toBe('D');
  });

  it('honours a theme-specific fallback id', () => {
    expect(resolvePalette(map, 'constructor', 'light')).toBe('L');
    expect(resolvePalette(map, 'nonexistent', 'light')).toBe('L');
  });
});

/**
 * `fallbackId` used to be a plain `string` that nothing checked, so
 * javascript — the one theme with no `default` palette — could lose its `'light'`
 * argument at both of its sites and produce a palette full of `undefined` with
 * `tsc` clean. `resolvePalette`'s `FallbackArg` now makes the argument optional
 * on a map that has a `default` and **required and typed** on one that does not.
 *
 * ⚠️ **`tsc -b` is what runs these, not vitest.** Each `@ts-expect-error` below
 * is a compile-time assertion that the line *does* fail to type-check; a
 * directive that stops erroring is itself `TS2578`, so the guard cannot rot
 * quietly. `tsconfig.app.json` includes all of `src`, which is why a test file
 * can hold it — and `npx tsc --noEmit` would check none of it, since the root
 * tsconfig is `files: []` plus references. Use `npx tsc -b`.
 *
 * The runtime assertions on the suppressed lines are real (a bad fallback
 * genuinely resolves `undefined`), but they are not the point and they are
 * inside the suppression, so do not rely on them alone.
 */
describe('resolvePalette — the fallbackId type guard', () => {
  const withDefault = { default: 'D', ocean: 'O' };
  const noDefault = { light: 'L', dark: 'K' };
  /** The old declaration form: an annotation, so `keyof` is `string`. */
  const widened: Record<string, string> = { light: 'L' };

  it('leaves the argument optional on a map that has a default', () => {
    expect(resolvePalette(withDefault, 'ocean')).toBe('O');
    expect(resolvePalette(withDefault, 'unknown')).toBe('D');
    // Optional, not unconstrained: an explicit key of the map is still fine.
    expect(resolvePalette(withDefault, 'unknown', 'ocean')).toBe('O');
  });

  it('requires the argument on a map that has none — javascript’s shape', () => {
    expect(resolvePalette(noDefault, 'unknown', 'light')).toBe('L');

    // @ts-expect-error TS2554 — a map with no `default` must name its fallback.
    expect(resolvePalette(noDefault, 'unknown')).toBeUndefined();
  });

  it('rejects a fallback key the map does not hold', () => {
    // @ts-expect-error TS2345 — `lite` is not a key of `noDefault`.
    expect(resolvePalette(noDefault, 'unknown', 'lite')).toBeUndefined();

    // @ts-expect-error TS2345 — having a `default` does not license a foreign key.
    expect(resolvePalette(withDefault, 'unknown', 'lite')).toBeUndefined();
  });

  /**
   * ⚠️ The degenerate arm, and the one a `never`-only guard would miss. If a
   * palette map is declared `: Record<string, XPalette>` instead of
   * `satisfies`, `K` widens to `string` and `'default' extends string` is
   * **true** — so without `FallbackArg`'s first arm this call would compile and
   * javascript's guard would vanish silently. Measured: reverting
   * `plain/helpers/shared/constants.ts` to that form fails `PlainHTML.tsx:33`
   * and `PlainSerializer.ts:42` with TS2554.
   */
  it('cannot be called at all on a map that publishes no literal keys', () => {
    // @ts-expect-error TS2554 — `FallbackArg<string>` is `[fallbackId: never]`.
    expect(resolvePalette(widened, 'light')).toBe('L');

    // ⚠️ The three-argument form needs its own directive, and until the review
    // it had none — which mattered, because it was the only form that compiled.
    // `K` is inferred from the rest tuple at higher priority than from
    // `palettes`, so an explicit fallback simply *became* `K` and the arm never
    // fired. `NoInfer` in the signature is what makes this line an error.
    // @ts-expect-error TS2345 — `[string]` is not assignable to `[fallbackId: never]`.
    expect(resolvePalette(widened, 'light', 'totallyBogusKeyNoMapHas')).toBe('L');
  });
});

/**
 * Output equality rather than a colour assertion: it needs no knowledge of which
 * fields a theme reads, and it does not drift when a theme changes its colours.
 *
 * ⚠️ The `undefined` assertion is **not** implied by the equality one, and it is
 * the half that catches a wrong `fallbackId`. `resolvePalette(map, id)` on
 * javascript resolves `map.default`, which does not exist, so *both* arms come
 * back full of `undefined` and compare equal — the original defect's output reintroduced,
 * passing an equality-only test.
 */
describe.each([
  ['serializer', serializeTheme],
  ['HTML component', renderTheme],
] as const)('every %s resolves a stored palette id safely', (_kind, render) => {
  it.each(ALL_THEME_IDS)('%s falls back for a prototype key and an unknown id', (themeId) => {
    const palettes = palettesFor(themeId);
    const fallback = render(themeId, palettes[0].id);

    for (const paletteId of FALLING_BACK) {
      expect(render(themeId, paletteId)).toBe(fallback);
      expect(render(themeId, paletteId)).not.toContain('undefined');
    }
  });

  /**
   * The positive control, and the reason the test above is not vacuous: a
   * resolver that returned the fallback for *every* id would satisfy it.
   *
   * ⚠️ Nine themes, not twelve — elegant, plain and plain2 declare a single
   * palette, so there is no second id to distinguish and nothing here can tell
   * a working lookup from a constant one on those three. The count is asserted
   * so that a registry change which quietly collapses this set fails rather
   * than silently narrowing the control.
   */
  const MULTI_PALETTE_IDS = ALL_THEME_IDS.filter((themeId) => palettesFor(themeId).length > 1);

  it('has nine themes offering more than one palette', () => {
    expect(MULTI_PALETTE_IDS).toHaveLength(9);
  });

  it.each(MULTI_PALETTE_IDS)('%s renders a declared palette differently', (themeId) => {
    const palettes = palettesFor(themeId);
    const fallback = render(themeId, palettes[0].id);

    const indistinguishable = palettes
      .slice(1)
      .filter(({ id }) => render(themeId, id) === fallback)
      .map(({ id }) => id);

    expect(indistinguishable).toEqual([]);
  });
});

/**
 * The registry-array lookup, and the reason it needs its own block: it is the
 * source of the **icon fill** the PDF is drawn with, and it was once six
 * hand-written copies of `palettes?.find(…) || palettes?.[0]` followed by
 * `?.ui?.[0] || '#718096'`.
 *
 * ⚠️ The assertion that matters is the **cross-check** against the colour-map
 * lookup, not either one alone. Both are total functions that always return a
 * palette, so each is individually satisfiable by a constant; what cannot be
 * faked is that they pick the *same* entry for the same stored id, on every
 * theme, for declared ids and for the ids that fall back alike. javascript is
 * why: it declares no `default`, so its map lookup is the repo's one site whose
 * fallback argument is `'light'`, and the registry side has to reach the same
 * palette by listing `light` first.
 *
 * The two are chained rather than compared directly, because they return
 * different things (a colour object vs. a metadata entry): `getActivePalette`
 * names an id, and the block above has already asserted that rendering *that* id
 * is byte-identical to rendering the falling-back one, on both outputs.
 */
describe('getActivePalette', () => {
  it.each(ALL_THEME_IDS)('%s resolves every declared id to itself', (themeId) => {
    const unresolved = palettesFor(themeId)
      .filter(({ id }) => getActivePalette(themeId, id).id !== id)
      .map(({ id }) => id);

    expect(unresolved).toEqual([]);
  });

  it.each(ALL_THEME_IDS)('%s falls back to the id the colour map falls back to', (themeId) => {
    const first = palettesFor(themeId)[0].id;

    for (const paletteId of [...PROTOTYPE_KEYS, 'nonexistent', '', undefined]) {
      expect(getActivePalette(themeId, paletteId).id).toBe(first);
    }
  });

  /**
   * The positive control: a lookup that ignored its argument would satisfy
   * everything above by returning the first palette every time.
   *
   * ⚠️ **On `ui`, the swatch — and it used to read the icon fill, which no
   * longer distinguishes the palettes.** Every palette's swatch is
   * distinct because that is what the picker draws; the icon fill is not, and is
   * not meant to be. lunar's seven all state `#ffffff` and timeless's seven
   * `#1a1a1a`, deliberately, so a distinctness control pointed at `iconUi` would
   * fail on two themes for a correct reason. Previously those three themes'
   * fills were overridden downstream in `serializeIconsMap` instead, which is
   * why this control could read the fill and still pass: it was reading the
   * *discarded* value.
   *
   * ⚠️ **This asserts the helper, not the drawn icons**, and the difference is
   * worth stating because the first version of this comment did not. What ties
   * the resolved palette to the emitted SVGs is `iconFillsAreDeclared.test.ts`.
   *
   * ⚠️ Nine themes, not twelve: elegant, plain and plain2 declare a single
   * palette, so nothing can distinguish a working lookup from a constant one on
   * those three. The count is pinned so a registry change that quietly collapses
   * the set fails here rather than narrowing the control in silence.
   */
  const MULTI_PALETTE_IDS = ALL_THEME_IDS.filter((themeId) => palettesFor(themeId).length > 1);

  it('has nine themes offering more than one palette', () => {
    expect(MULTI_PALETTE_IDS).toHaveLength(9);
  });

  it.each(MULTI_PALETTE_IDS)('%s resolves a distinct swatch for each palette', (themeId) => {
    const swatches = palettesFor(themeId).map(({ id }) => getActivePalette(themeId, id).ui);

    expect(new Set(swatches).size).toBe(swatches.length);
  });
});

/**
 * Every palette's display name resolves — all forty, through the very helper the
 * picker calls.
 *
 * ⚠️ **This is what the i18n checker cannot do here.** `t(paletteNameKey(…))` is
 * a dynamic lookup through a function, so `check-usage.cjs` sees no literal key
 * and the two call sites are registered in `DYNAMIC_CALL_ALLOWLIST` — a hole by
 * construction, the same one `themes.names` sits in. `locales/en/themes.ts`'s
 * `satisfies` closes the *table* side (a palette without a name is a build
 * error); this closes the *path* side, which no type can see: a misspelt segment
 * in `paletteNameKey` compiles perfectly and shows the raw key in the picker, in
 * all fifteen locales at once. That is exactly the failure it replaced.
 *
 * English only, deliberately: `checkLocales` enforces key-for-key parity against
 * it, so a key present here is present in all fifteen.
 */
describe('paletteNameKey', () => {
  /** What `t()` renders — a miss is `null`. */
  const lookup = (key: string) => lookupTranslation(translations, key);

  // The control: the walk must be able to miss, or every assertion below passes
  // on a resolver that returns something for anything.
  it('reports a missing key as missing', () => {
    expect(lookup('themes.palettes.lunar.nonexistent')).toBeNull();
    expect(lookup('themes.palettes.nonexistent.default')).toBeNull();
    expect(lookup('themes.names.lunar')).toBe('Lunar');
  });

  it.each(ALL_THEME_IDS)('%s has a name for every palette it offers', (themeId) => {
    const unnamed = palettesFor(themeId)
      .filter(({ id }) => typeof lookup(paletteNameKey(themeId, id)) !== 'string')
      .map(({ id }) => id);

    expect(unnamed).toEqual([]);
  });

  it('names all forty palettes', () => {
    const named = ALL_THEME_IDS.flatMap((themeId) =>
      palettesFor(themeId).map(({ id }) => lookup(paletteNameKey(themeId, id))),
    );

    expect(named).toHaveLength(40);
    expect(named.every((name) => typeof name === 'string' && name.length > 0)).toBe(true);
  });
});

describe('the palette lookup exists once', () => {
  /**
   * `PALETTES[…]`, `PALETTES_HTML[…]`, `PALETTES_PDF[…]` — a direct index of a
   * palette map. `resolvePalette` is the only legitimate one, and it takes the
   * map as a parameter, so it does not match this pattern at all.
   */
  const DIRECT_INDEX = /\bPALETTES(?:_[A-Z]+)?\s*\[/;

  it('has no theme file indexing a palette map directly', () => {
    const files = sourceFiles(THEMES_DIR, { extensions: ['.ts', '.tsx'], skip: [] }).map((file) =>
      relative(THEMES_DIR, file),
    );

    // The scan is worthless if the walk stops matching — the same lesson, one
    // level down. Twelve themes' serializers and components alone clear this.
    expect(files.length).toBeGreaterThan(100);

    const offenders = files.filter((file) =>
      readFileSync(join(THEMES_DIR, file), 'utf8')
        .split('\n')
        .some((line) => DIRECT_INDEX.test(line)),
    );

    expect(offenders).toEqual([]);
  });
});
