import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import * as typstFooter from '@/components/preview/themes/shared/typstFooter';
import { renderTypstSignatureFooter } from '@/components/preview/themes/shared/typstFooter';
import { applyThemeLayout } from '@/test/fixtureLayout';
import { FOOTER_THEMES } from '@/test/footerThemes';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { named, sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The signature footer's `#v(topGap)` and the `#block` under it are one
 * unbreakable unit, so `topGap + textToLineGap + lineInsetTop` is not styling —
 * it is the amount of remaining page flow the footer *demands*. Fall short of
 * it and the entire unit relocates to a new page, taking its gap along, which
 * is why an affected export shows a final page carrying only the date line and
 * the signature rule while the real last page keeps a large empty bottom and no
 * footer at all. Measured at the old 40/20/10 defaults: ~91pt of demand against
 * a ~780pt body, so ≈12% of arbitrary résumé lengths landed in the band.
 *
 * ⚠️ **The two numbers this file pins are the same numbers, written twice.**
 * skyline and foggy have always passed `topGap: 24, textToLineGap: 12,
 * lineInsetTop: 8` explicitly; the shared defaults were 40/20/10 and served
 * lunar, misty, soft, swiss_grid and the cover letter. The fix resolved the
 * disagreement by adopting the values already in production rather than
 * inventing new ones — which leaves two independent literals that agree today
 * and nothing making them agree tomorrow. That is what this file is for.
 *
 * It deliberately does *not* assert "the footer fits", because that is a
 * property of a rendered PDF at a particular content height, not of the markup,
 * and the WASM compiler is not byte-deterministic. It asserts the inputs to the
 * geometry, which is the thing an author can silently change.
 */

const SERIALIZERS_WITH_EXPLICIT_GEOMETRY = [
  'src/components/preview/themes/twoColumn/skyline/SkylineSerializer.ts',
  'src/components/preview/themes/twoColumn/foggy/FoggySerializer.ts',
] as const;

const GEOMETRY_KEYS = ['topGap', 'textToLineGap', 'lineInsetTop'] as const;

/**
 * Pull the geometry the shared defaults actually emit, rather than restating
 * them as literals here — a literal copied out of the implementation agrees
 * with it by construction and would pass after any edit to it.
 *
 * At `fontScale: 1` the emitted markup carries `topGap` as the leading `#v()`,
 * `textToLineGap` as the second, and `lineInsetTop` inside the rule box's
 * `inset: (top: …)`.
 */
function emittedDefaultGeometry(): Record<(typeof GEOMETRY_KEYS)[number], number> {
  const markup = renderTypstSignatureFooter({
    parts: ['London, GB', 'July 26, 2026'],
    name: 'Ada Lovelace',
    fontScale: 1,
  });

  const verticalGaps = [...markup.matchAll(/#v\((\d+(?:\.\d+)?)pt\)/g)].map((m) => Number(m[1]));
  const insetTop = markup.match(/inset:\s*\(top:\s*(\d+(?:\.\d+)?)pt\)/);

  expect(verticalGaps).toHaveLength(2);
  expect(insetTop).not.toBeNull();

  return {
    topGap: verticalGaps[0],
    textToLineGap: verticalGaps[1],
    lineInsetTop: Number(insetTop?.[1]),
  };
}

function explicitGeometry(relativePath: string): Record<string, number> {
  const source = readFileSync(relativePath, 'utf8');
  const geometry: Record<string, number> = {};

  for (const key of GEOMETRY_KEYS) {
    const match = source.match(new RegExp(`\\b${key}:\\s*(\\d+(?:\\.\\d+)?)\\b`));
    if (match) geometry[key] = Number(match[1]);
  }

  return geometry;
}

describe('signature footer geometry', () => {
  it('emits the same three gaps whether a theme takes the defaults or passes its own', () => {
    const defaults = emittedDefaultGeometry();

    for (const path of SERIALIZERS_WITH_EXPLICIT_GEOMETRY) {
      // Fails loudly if a serializer stops passing these rather than silently
      // reporting agreement about a value it no longer sets.
      expect(explicitGeometry(path), `${path} no longer passes explicit footer geometry`).toEqual(
        defaults,
      );
    }
  });

  it('keeps the footer inside the measured flow budget', () => {
    const { topGap, textToLineGap, lineInsetTop } = emittedDefaultGeometry();

    // The unbreakable unit is the gap plus the block; the block is the two text
    // lines, `textToLineGap` between them and `lineInsetTop` under the rule.
    // The budget is the demand at the adopted **28/24/6**, and exists so that
    // raising any one of the three is a test failure rather than a silent
    // re-widening of the band.
    //
    // ⚠️ This comment once said "the adopted 16/36/6". 16/36/6 is the
    // design proposal `typstFooter.ts` records as **overruled**; the adopted
    // values are 28/24/6, which is what the assertion has always measured.
    // ⚠️ And the ~91pt in this file's header is the demand at 40/20/10 *plus*
    // the two 9pt text lines the block contains; the 70pt figure is the three
    // gaps alone. Two figures for the same defaults, both correct, neither
    // saying which it was counting.
    expect(topGap + textToLineGap + lineInsetTop).toBeLessThanOrEqual(58);
  });

  it('keeps enough room above the rule to sign in', () => {
    // ⚠️ The opposite direction from the budget above, and the reason this file
    // has two bounds pushing against each other. The rule is a signature line;
    // `textToLineGap` is the space a hand writes in. The first fix shrank it
    // to 12pt — one line of 9pt text — purely to buy page-break headroom, and
    // the footer became unsignable. This floor exists so the budget above can
    // never again be paid for out of this value.
    //
    // ⚠️ **20, not the 28 design review asked for.** That figure came from a
    // signature's physical height (~1cm); reviewed against rendered output the
    // owner found even 24 generous, so a floor of 28 would forbid the shipped
    // value's own neighbourhood. 20 is what the theme shipped with before the fix
    // (40/20/10) — an owner-reviewed lower bound rather than an estimated one.
    const { textToLineGap } = emittedDefaultGeometry();

    expect(textToLineGap).toBeGreaterThanOrEqual(20);
  });
});

/**
 * ⚠️ **Everything above reads the two serializers that pass options as SOURCE
 * TEXT, and could not see a theme that never calls the renderer at all — three
 * did.** timeless, stackoverflow and javascript hand-rolled the whole
 * block at 40/30/10, 40/30/10 and 40/20/10, so the budget reached six
 * two-column themes plus the cover letter and stopped, with this file green
 * throughout: a hand-rolled literal is not a `topGap:`.
 *
 * ⚠️ **The first replacement was markup regexes over every theme's output, and
 * a reviewer walked a fresh hand-rolled copy past it three ways** — a colour it
 * did not whitelist (`luma(204)`), an inset whose first key was not `top`, and
 * simply not being on the theme list, since a block the regex cannot parse
 * leaves the sweep silently and a short sweep looks exactly like a full one.
 * Scoping a guard by a spelling, one more time.
 *
 * So this block tests **provenance**: spy on the renderer and ask which themes
 * called it. That is universal over all twelve and immune to every spelling
 * question. Geometry is then asserted on the *received options*, so there is no
 * markup pattern left to evade.
 *
 * ⚠️ Two things provenance cannot see, both covered below and neither perfectly:
 * a serializer emitting its own gap *before* the call — which spends the same
 * page-flow budget and never reaches the renderer — and a **tenth** producer in
 * a theme that is not on the list. The first is exact; the second is a source
 * scan and inherits a source scan's limits.
 *
 * ⚠️ `renderTypstPageRightFooter` was deleted in the same change and that is
 * part of why this works: a pure alias re-exporting the same function is a
 * second door, and a same-module call through it never reaches a namespace spy.
 */

function serialize(themeId: ThemeId): string {
  const data = buildSingleItemResume(themeId);
  data.coverLetter.enabled = false;
  data.meta.theme.name = themeId;
  applyThemeLayout(data, themeId);
  return SERIALIZERS[themeId](data);
}

/**
 * stackoverflow is the only theme with a block inset, and `insetTop` is 20pt on
 * top of the 58pt budget — a per-theme look that costs real page flow. Named so
 * it cannot grow silently and a second theme acquiring one is a failure.
 */
const BLOCK_INSET_BY_THEME: Partial<Record<ThemeId, { insetTop: number; insetLeft: number }>> = {
  stackoverflow: { insetTop: 20, insetLeft: 30 },
};

describe('every footer goes through the one renderer', () => {
  let spy: MockInstance<typeof renderTypstSignatureFooter>;

  beforeEach(() => {
    // Not `mockImplementation` — the real renderer still runs, so every
    // assertion here is about real output and the spy only answers "who".
    spy = vi.spyOn(typstFooter, 'renderTypstSignatureFooter');
  });
  afterEach(() => spy.mockRestore());

  /** The options a theme handed the renderer, with defaults resolved as it resolves them. */
  const resolvedOptions = (themeId: ThemeId) => {
    spy.mockClear();
    serialize(themeId);
    expect(spy, `${themeId} did not call the shared renderer`).toHaveBeenCalledTimes(1);

    const options = spy.mock.calls[0][0];
    const defaults = emittedDefaultGeometry();

    return {
      topGap: options.topGap ?? defaults.topGap,
      textToLineGap: options.textToLineGap ?? defaults.textToLineGap,
      lineInsetTop: options.lineInsetTop ?? defaults.lineInsetTop,
      insetTop: options.insetTop ?? 0,
      insetLeft: options.insetLeft ?? 0,
    };
  };

  it('is called exactly once by every theme, and its output reaches the markup', () => {
    // ⚠️ **The complement test is gone, not silently dropped.** It asserted the
    // renderer is never called by the themes that emit no footer — and there are
    // none now, so `for (const t of NO_FOOTER_THEMES)` would have run zero
    // iterations and passed while measuring nothing. `FOOTER_THEMES` is
    // `ALL_THEME_IDS`, which makes this assertion strictly stronger than the pair
    // it replaces: every theme, not a list someone maintains.
    const callers = ALL_THEME_IDS.filter((themeId) => {
      spy.mockClear();
      serialize(themeId);
      return spy.mock.calls.length > 0;
    });

    expect(callers).toEqual([...FOOTER_THEMES]);

    // Called is not emitted — a serializer could call the renderer and drop the
    // string on the floor.
    //
    // ⚠️ **The non-empty assertion is what makes the `toContain` mean anything.**
    // `renderTypstSignatureFooter` returns `''` for `showFooter === false` and
    // for "no parts and no name", and `'anything'.includes('')` is `true` — so a
    // theme that calls the renderer and gets nothing back satisfied both halves.
    // Measured: hardcoding `showFooter: false` in `ElegantSerializer` left this
    // file 8/8 green while elegant emitted no footer at all. That is the same
    // vacuity as iterating an empty set, relocated rather than removed.
    for (const themeId of FOOTER_THEMES) {
      spy.mockClear();
      const markup = serialize(themeId);
      const rendered = spy.mock.results[0].value as string;

      expect(rendered, `${themeId} rendered an empty footer`).not.toBe('');
      expect(markup, `${themeId} discards the footer it rendered`).toContain(rendered);
    }
  });

  it('hands the renderer the shared geometry in every theme, not only where options are passed', () => {
    const defaults = emittedDefaultGeometry();

    for (const themeId of FOOTER_THEMES) {
      const { topGap, textToLineGap, lineInsetTop } = resolvedOptions(themeId);
      expect({ topGap, textToLineGap, lineInsetTop }, `${themeId} footer geometry`).toEqual(
        defaults,
      );
    }
  });

  it('keeps the block inset to the one theme that has one', () => {
    for (const themeId of FOOTER_THEMES) {
      const { insetTop, insetLeft } = resolvedOptions(themeId);
      expect({ insetTop, insetLeft }, `${themeId} block inset`).toEqual(
        BLOCK_INSET_BY_THEME[themeId] ?? { insetTop: 0, insetLeft: 0 },
      );
    }
  });

  it('lets no serializer add a gap of its own in front of the footer', () => {
    // ⚠️ Provenance cannot see this, and it is the same defect class one line
    // over: a `#v(40pt)` emitted immediately before the call spends the same
    // page-flow budget without ever reaching the renderer. Measured on a
    // mutation — prefixing timeless's return with one raised its demand to 98pt
    // against a 58pt budget with the whole suite green.
    //
    // The footer's position is taken from the spy's own return value, so there
    // is no marker to keep in step with the renderer and no chance of matching
    // a section macro that happens to share its opening.
    for (const themeId of FOOTER_THEMES) {
      spy.mockClear();
      const markup = serialize(themeId);
      const footer = spy.mock.results[0].value as string;

      const at = markup.indexOf(footer);
      expect(at, `${themeId}: the renderer's output is not in the markup verbatim`).toBeGreaterThan(
        -1,
      );

      const before = markup.slice(0, at).trimEnd();
      expect(
        /#v\([\d.]+pt\)$/.test(before),
        `${themeId} emits a gap immediately before the footer, which spends the same budget`,
      ).toBe(false);
    }
  });

  it('emits the signature rule from exactly one module', () => {
    // ⚠️ The complement of provenance, and the weaker half: provenance proves
    // the twelve go through the renderer and says nothing about a **thirteenth**
    // producer in a theme that is not on the list. This is a source scan and
    // inherits a source scan's limits — a copy spelled with `#line(length:)`
    // rather than a bordered `#box` is invisible to it. What it catches is the
    // shape all four historical copies had.
    //
    // ⚠️ `#box(width:` rather than `stroke: (top:` alone: foggy's contact bar is
    // `#block(width: 100%, stroke: (top: 1pt + brand-border))`, a legitimate
    // non-footer rule, so the discriminator is the fixed-width box.
    const offenders = sourceFiles('src/components/preview/themes', {
      extensions: ['.ts', '.tsx'],
      skip: [named('__tests__')],
    })
      .filter((full) => !full.endsWith('shared/typstFooter.ts'))
      .filter((full) => /#box\(width:[^)]*stroke: \(top:/.test(readFileSync(full, 'utf8')));

    expect(offenders).toEqual([]);
  });
});
