import { sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Every icon map is filled from the **shared** helper, `paletteIconFills`.
 *
 * The forward guard for the site written tomorrow. ⚠️ **The sites that exist
 * today are covered by the compiler, not by this file and not behaviourally** —
 * an earlier version of this comment claimed `paletteResolution.test.tsx` covers
 * them and that is false: it imports none of the five production modules and
 * exercises `paletteIconFills` in isolation. What actually holds those five is
 * that `serializeIconsMap`'s `fills` and `paletteIconFills`'s `paletteId` are
 * both **required** parameters, so an omission at either is `TS2554`. The
 * reviewer pass established this the hard way, by dropping the stored palette at
 * all five at once and watching `tsc`, the whole suite and lint stay clean.
 *
 * ⚠️ **This file imports nothing from the application**, which is load-bearing
 * rather than tidy: a scan that imports the code it scans can be taken down by
 * the very mutation it exists to catch, and then it is loud and useless. That is
 * what happened to the first theme-store scan; see `themeStoreIsolation.test.ts`.
 *
 * The property, and why it is worth a scan at all: `serializeIconsMap(resume,
 * fills)` builds the SVG assets the Typst compiler draws the résumé's icons
 * with, and `fills` should track the selected palette. It was once
 * computed by six hand-written copies of `palettes?.find(…) || palettes?.[0]` /
 * `?.ui?.[0] || '#718096'` — one per output path — and a seventh copy of the
 * grey sat in `serializeIconsMap`'s own default parameter, where **omitting the
 * argument** selected it. No registered theme resolves that grey; a bug report found the
 * render tool serving it to every icon it coloured.
 *
 * ⚠️ **"the icons come out of a different palette than the text" used to be true
 * for only nine of the twelve themes**, and the stronger phrasing shipped here
 * and in four other places on the same branch: `serializeIconsMap`
 * *overrode* its argument outright for lunar, timeless and javascript — 16 of
 * the 40 palettes — so on those the value reached nothing. A later fix moved that
 * override onto the palette itself (`ThemePaletteMeta.iconUi`), so the argument
 * is now the fill on all forty and the sentence holds for twelve. The scan was
 * always right to demand one source for the value; it is the consequence that
 * was overstated, and it is the *code* that has since been made to match.
 *
 * ⚠️ Scoped by the property, not by a path convention **and not by a call
 * shape** — the scope-by-property and mention-is-not-a-call rules
 * (`.claude/rules/testing.md`): it walks all of `src`, and it selects on the
 * symbol being mentioned at all rather than on how the call is written. See
 * `MENTIONS` for the four ways the call-shape version was defeated.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const SELF = fileURLToPath(import.meta.url);
const SRC_DIR = join(dirname(SELF), '..', '..', '..');

const walk = (dir: string): string[] => sourceFiles(dir, { extensions: ['.ts', '.tsx'], skip: [] });

/**
 * Comments go first, in both directions. This very doc block names the forbidden
 * idiom, and a raw text scan would flag the file that documents the rule — and,
 * the other way round, prose must not be able to satisfy the scan either.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** The one symbol that builds an icon map, and the one helper allowed to fill it. */
const SERIALIZER = 'serializeIconsMap';
const REQUIRED_CALLEE = 'paletteIconFills';

/**
 * ⚠️ **Files are selected by MENTIONING the symbol, not by matching a call
 * shape** — and the difference is the whole guard.
 *
 * The first version keyed on `serializeIconsMap\(\s*[^,()]*,\s*(identifier)`.
 * Both reviewer passes defeated it independently, with four one-line files that
 * each passed `'#718096'` — the exact grey-icon defect — while the scan stayed green:
 *
 * 1. `import { serializeIconsMap as buildIcons }` — an aliased binding, so the
 *    call never spells the identifier the regex wanted.
 * 2. `serializeIconsMap(enrich(resume), '#718096')` — a nested call in the first
 *    argument, which `[^,()]*` cannot cross.
 * 3. `serializeIconsMap(resume, '#718096')` in a **new** file — a literal is not
 *    an identifier, so the call matched nothing, so the file produced no entry,
 *    so the pinned site list never saw it.
 * 4. `serializeIconsMap(...args)` — a spread, with no comma at all.
 *
 * (3) is the one that matters most, and the old doc block claimed the opposite
 * in as many words. A pinned site list is a **regression** pin over files that
 * already match; it can say nothing about a file that produces no match, because
 * that is indistinguishable from a file that does not call the function. Round
 * twelve's rule — scope by the property, not by a spelling — and the call shape
 * was the spelling.
 *
 * So: any file whose source mentions the token at all is a site, however it
 * spells the call, and every site owes a `paletteIconFills` on the same line as
 * the call. Aliasing still leaves the token in the `import`; a spread, a nested
 * argument and a literal all leave the token in the call.
 */
const MENTIONS = new RegExp(`\\b${SERIALIZER}\\b`);
const FILLS = new RegExp(`\\b${REQUIRED_CALLEE}\\b`);

/** Where `serializeIconsMap` is declared — it mentions itself and fills nothing. */
const DECLARATION = 'components/preview/themes/shared/iconSerializer.ts';

const mentions = (source: string) => MENTIONS.test(stripComments(source));
const fills = (source: string) => FILLS.test(stripComments(source));

/**
 * Every file expected to build an icon map, pinned as a **set** rather than a
 * count.
 *
 * A count is the weaker pin, per the pin-the-set rule, and this repo has been
 * burned by one: the first `paletteInterfaces.test.ts` asserted a file count of
 * 12 while walking straight past the one declaration it existed to catch, because
 * the count was true and irrelevant. If a call site is deleted or moved, this
 * list stops matching and says which — and a **new** one now fails it too, which
 * is what the old matcher could not do.
 */
const EXPECTED_SITES = [
  'components/preview/__tests__/casingParity.test.tsx',
  'components/preview/__tests__/iconFillsAreDeclared.test.ts',
  'components/preview/__tests__/iconGeometryParity.test.ts',
  'components/preview/__tests__/pdfPageCount.compile.test.ts',
  'components/preview/__tests__/renderThemePdf.test.ts',
  'components/preview/__tests__/typstCompile.test.ts',
  'features/dashboard/preview/Viewer.tsx',
  // The three export paths (download ZIP, GitHub push, Drive push) each built
  // their own icon map; they now share one builder.
  'hooks/export/buildExportArtifacts.ts',
  // ⚠️ Both cover-letter capacity sweeps used to appear here. Their
  // shared `letterPages`/`largestOnePage` helpers moved into `test/` so the word and
  // character sweeps could not drift apart, which moved the call site with them
  // — one entry, not two, and neither test file calls it directly any more.
  'test/letterCapacitySweep.ts',
  'utils/preview-utils.tsx',
];

describe('every icon map takes the shared palette fill', () => {
  // ⚠️ This file is excluded from its own walk, and only this file: the controls
  // below need literal source naming both symbols, and the scan would otherwise
  // report itself. That is the one path-shaped exemption, and `EXPECTED_SITES`
  // is what stops it from being able to hide anything else.
  const files = walk(SRC_DIR).filter((path) => path !== SELF);
  const sites = files
    .map(
      (path) =>
        [relative(SRC_DIR, path).split('\\').join('/'), readFileSync(path, 'utf8')] as const,
    )
    .filter(([path, source]) => path !== DECLARATION && mentions(source));

  it('actually opened the tree it claims to scan', () => {
    expect(files.length).toBeGreaterThan(400);
  });

  /**
   * The matcher control, in both directions.
   *
   * "The walk found 7 sites" and "the matcher can tell a good call from a bad
   * one" are independent properties. A matcher that stopped matching altogether
   * reads as a clean scan, which is the failure mode that would matter here, so
   * the negatives are asserted alongside the positives.
   *
   * The four evasions of the previous matcher are pinned as positives — each is
   * a real defeat measured by a reviewer, and each must now be *selected* as a
   * site (and then fail the fill assertion, since none mentions the helper).
   */
  it('selects a call however it is spelt, and ignores prose', () => {
    expect(mentions('const a = serializeIconsMap(resume, paletteIconFills(id, p));')).toBe(true);
    expect(mentions("import { serializeIconsMap as buildIcons } from '…';")).toBe(true);
    expect(mentions("const a = serializeIconsMap(enrich(resume), '#718096');")).toBe(true);
    expect(mentions('const a = serializeIconsMap(...args);')).toBe(true);
    expect(mentions("const a = serializeIconsMap(resume, '#718096');")).toBe(true);

    expect(mentions('// serializeIconsMap(resume, paletteIconFills(id, p))')).toBe(false);
    expect(mentions('const a = someOtherHelper(resume, color);')).toBe(false);
  });

  it('tells a filled call from an unfilled one', () => {
    expect(fills('const a = serializeIconsMap(resume, paletteIconFills(id, p));')).toBe(true);
    expect(fills("const a = serializeIconsMap(resume, '#718096');")).toBe(false);
    expect(fills('const a = serializeIconsMap(resume, primaryColor);')).toBe(false);
    expect(fills('// paletteIconFills(id, p)')).toBe(false);
  });

  it('finds exactly the call sites it expects to', () => {
    expect(sites.map(([path]) => path).sort()).toEqual(EXPECTED_SITES);
  });

  it('has every call site filling its icons from the shared helper', () => {
    const offenders = sites.filter(([, source]) => !fills(source)).map(([path]) => path);

    expect(offenders).toEqual([]);
  });
});
