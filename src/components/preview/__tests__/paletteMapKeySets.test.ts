import { sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * **Every palette map declared in one file offers the same palette ids.**
 *
 * The forward guard for palette-id drift. Three themes — foggy, skyline and misty — declare
 * a second, PDF-only palette map, keyed to the first with a
 * hand-written `Record<XPaletteId, XPalettePDF>`. The sites that exist today are
 * held by the compiler: that annotation, plus the `_X…OfferTheSameIds` alias now
 * beside each pair (see `PaletteIdDrift` in `themes/shared/palette.ts` for the
 * spelling-by-spelling measurement of what each one catches). This file is for
 * the **fourth** pair, written tomorrow with neither.
 *
 * ⚠️ **It imports nothing from the application**, which is load-bearing rather
 * than tidy: a scan that imports the code it scans can be taken down by the very
 * mutation it exists to catch, and is then loud and useless. `typescript`
 * is a build dependency, so reaching for the AST keeps that rule intact.
 *
 * ⚠️ **Scoped by the property, not by a name and not by a path** — the
 * scope-by-property rule (`.claude/rules/testing.md`). `PALETTES_PDF` is a
 * spelling — a fourth map could be called anything, and the eleven-of-twelve
 * `helpers/shared/constants.ts` convention is exactly the glob that let foggy's
 * interfaces slip past the first `paletteInterfaces.test.ts`. The selector here is
 * structural: an object literal of object literals holding *at least one* colour
 * leaf. Measured, that admits the sixteen palette maps in twelve files.
 * ⚠️ `components/ui/InfoCard.tsx`'s `COLOR_CONFIG` is a map of the same shape,
 * out of scope only because it is outside the walk root. This used to cite
 * `themes/shared/fonts.ts`'s `THEME_FONTS` as the in-scope example instead —
 * that map is now one family per theme rather than an object per theme,
 * so it no longer reaches the leaf rule at all and the nesting test rejects it
 * one step earlier. The discriminator the example illustrated is unaffected and
 * is pinned directly by the synthetic fixture at the foot of this file, which is
 * a string literal and so cannot go stale the same way.
 *
 * ⚠️ **A file that parses to nothing is indistinguishable from a file with no
 * maps**, so the inventory below is pinned with `toEqual` rather than counted
 * (the pin-the-set rule): a map the walk stops recognising drops out and fails,
 * and a thirteenth theme fails until it is listed. `EXPECTED` carries a **per-map
 * key count** and not just a set of names, because a scan that yields zero keys
 * for a declaration would otherwise satisfy the equality property vacuously.
 *
 * ⚠️ **lunar is in scope and has no type-level alias, deliberately.** Its
 * `BASE`/`PALETTES` pair is the same shape one level down — `PALETTES` spreads
 * `BASE.*` — but half of it is already a build error: an id in `PALETTES` that
 * `BASE` lacks fails at the spread. The other half is what this file adds, and
 * it is worth less than foggy's: a `BASE` entry no palette spreads is a dead
 * colour set, not a palette the user can select and not have exported. That
 * asymmetry is why the alias went on three files and the scan covers four.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const SELF = fileURLToPath(import.meta.url);
const THEMES_DIR = join(dirname(SELF), '..', 'themes');

const walk = (dir: string): string[] => sourceFiles(dir, { extensions: ['.ts', '.tsx'], skip: [] });

/**
 * What counts as a colour: `#abc` through `#aabbccdd`, the `rgb`/`hsl` function
 * forms, and the three CSS keywords a palette could plausibly hold.
 *
 * ⚠️ **A non-match does NOT disqualify the map, and the first version of this
 * file had that backwards.** It required *every* leaf to match, which is a
 * silent forward hole rather than a strict guard: a map the selector does not
 * recognise never enters `EXPECTED` either, so for the fourth pair — the one
 * this file exists for — invisible reads as green. Measured by the review pass
 * on a synthetic drifted pair: `bgGradient: 'linear-gradient(#fff, #eee)'`,
 * `bg: 'white'`, `bg: 'var(--bg)'`, `opacity: 0.5`, a template literal, and a
 * nested `text: { main: '#000' }` group each turned the whole guard off, seven
 * of eight spellings tried. Every one is an ordinary thing to put in a palette,
 * and a single numeric leaf anywhere did it.
 *
 * So the rule is now **at least one colour leaf**, with anything else in the
 * subtree tolerated. A font map fails it — leaves like `Inter` and `Lora` score
 * zero — which is the discriminator doing the work rather than the strictness.
 * The fixture at the foot of this file is what holds that, deliberately: it is a
 * string literal, so it keeps testing the rule no matter what the real
 * `THEME_FONTS` is shaped like this month.
 */
const COLOUR = /^(#[0-9a-fA-F]{3,8}|rgba?\(.*\)|hsla?\(.*\)|transparent|currentColor|none)$/;

/** `x satisfies T` and `x as T` both wrap the literal we care about. */
const unwrap = (node: ts.Expression): ts.Expression => {
  let current = node;
  while (ts.isSatisfiesExpression(current) || ts.isAsExpression(current))
    current = current.expression;
  return current;
};

interface PaletteMap {
  readonly name: string;
  readonly keys: readonly string[];
  /**
   * The map is palette-shaped but its key set cannot be read off the literal —
   * a map-level spread (`{ ...OVERRIDES, ocean: {…} }`) or a shorthand entry.
   *
   * ⚠️ **Recorded rather than skipped, and that is the whole point.** Silently
   * dropping such a map is the silent-miss hole: a file that produces no match is
   * indistinguishable from a file that has nothing to match. The review pass
   * mutated `PALETTES_PDF` to an entry-level spread and the suite did fail — but
   * for the wrong reason, flagging the helper it spread from while the real map
   * was never read at all.
   */
  readonly unreadable: boolean;
}

/**
 * Every palette map declared in one source file, in declaration order.
 *
 * Exported shape rather than a bare assertion so the positive controls below can
 * drive it over synthetic sources — the observation channel has to be shown to
 * work, and a count pin is not a positive control.
 */
const paletteMapsIn = (fileName: string, source: string): PaletteMap[] => {
  const tree = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const maps: PaletteMap[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const literal = unwrap(node.initializer);
      if (ts.isObjectLiteralExpression(literal) && literal.properties.length > 0) {
        let colourLeaves = 0;

        // Counts colours anywhere beneath one palette entry, including a nested
        // group. Everything that is not a colour is simply not counted — see
        // `COLOUR` for why tolerating it is the point.
        const countColours = (group: ts.ObjectLiteralExpression): void => {
          for (const leaf of group.properties) {
            if (!ts.isPropertyAssignment(leaf)) continue;
            const value = unwrap(leaf.initializer);
            if (ts.isObjectLiteralExpression(value)) countColours(value);
            else if (
              (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) &&
              COLOUR.test(value.text)
            ) {
              colourLeaves += 1;
            }
          }
        };

        // A map-level spread or shorthand hides keys rather than disqualifying
        // the map; the entries that ARE readable still decide whether this is a
        // palette map at all.
        const named = literal.properties.filter(ts.isPropertyAssignment);
        const isPaletteMap =
          named.length > 0 &&
          named.every((entry) => {
            const colours = unwrap(entry.initializer);
            if (!ts.isObjectLiteralExpression(colours) || colours.properties.length === 0)
              return false;
            countColours(colours);
            return true;
          });

        if (isPaletteMap && colourLeaves > 0) {
          maps.push({
            name: node.name.getText(tree),
            keys: named.map((entry) => entry.name.getText(tree).replace(/['"]/g, '')),
            unreadable: named.length !== literal.properties.length,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(tree);
  return maps;
};

/**
 * Whether a file actually **declares** a `never`-constrained alias over
 * `PaletteIdDrift`.
 *
 * ⚠️ **`source.includes('PaletteIdDrift')` is not this test, and the first draft
 * used it.** Deleting misty's alias *and* its import left the file green,
 * because the docblock above the alias says "see `PaletteIdDrift`" — the
 * guard was satisfied by a comment about the thing it was checking for. Reading
 * the AST asks for the declaration instead, and a comment is not a node.
 */
const declaresDriftAlias = (source: string): boolean => {
  const tree = ts.createSourceFile('alias.ts', source, ts.ScriptTarget.Latest, true);

  return tree.statements.some(
    (statement) =>
      ts.isTypeAliasDeclaration(statement) &&
      (statement.typeParameters ?? []).some((parameter) => {
        const isNeverConstrained = parameter.constraint?.kind === ts.SyntaxKind.NeverKeyword;
        const usesDrift =
          !!parameter.default &&
          ts.isTypeReferenceNode(parameter.default) &&
          parameter.default.typeName.getText(tree) === 'PaletteIdDrift';
        return isNeverConstrained && usesDrift;
      }),
  );
};

const FOUND = walk(THEMES_DIR)
  .map((path) => ({
    file: relative(THEMES_DIR, path).split(sep).join('/'),
    maps: paletteMapsIn(path, readFileSync(path, 'utf8')),
  }))
  .filter(({ maps }) => maps.length > 0)
  .sort((a, b) => a.file.localeCompare(b.file));

/**
 * ⚠️ Twelve files, sixteen maps — one palette map per theme plus the four second
 * maps (foggy, misty and skyline's `PALETTES_PDF`, and lunar's `BASE`). Adding a
 * theme means adding a line here; that is the census method working, not
 * friction.
 */
const EXPECTED: Record<string, Record<string, number>> = {
  'oneColumn/elegant/helpers/shared/constants.ts': { PALETTES: 1 },
  'oneColumn/javascript/helpers/shared/constants.ts': { PALETTES: 2 },
  'oneColumn/plain/helpers/shared/constants.ts': { PALETTES: 1 },
  'oneColumn/plain2/helpers/shared/constants.ts': { PALETTES: 1 },
  'oneColumn/stackoverflow/helpers/shared/constants.ts': { PALETTES: 2 },
  'oneColumn/timeless/helpers/shared/constants.ts': { PALETTES: 7 },
  'twoColumn/foggy/helpers/shared/constants.ts': { PALETTES_HTML: 5, PALETTES_PDF: 5 },
  'twoColumn/lunar/helpers/shared/constants.ts': { BASE: 7, PALETTES: 7 },
  'twoColumn/misty/helpers/shared/constants.ts': { PALETTES_HTML: 5, PALETTES_PDF: 5 },
  'twoColumn/skyline/helpers/shared/constants.ts': { PALETTES_HTML: 3, PALETTES_PDF: 3 },
  'twoColumn/soft/helpers/shared/constants.ts': { PALETTES: 2 },
  'twoColumn/swiss-grid/helpers/shared/constants.ts': { PALETTES: 4 },
};

describe('every palette map in a file offers the same palette ids', () => {
  it('finds the sixteen palette maps, with the key count of each', () => {
    const actual = Object.fromEntries(
      FOUND.map(({ file, maps }) => [
        file,
        Object.fromEntries(maps.map(({ name, keys }) => [name, keys.length])),
      ]),
    );

    expect(actual).toEqual(EXPECTED);
  });

  /**
   * A palette map whose keys cannot be read is the same silent-miss hole: it would otherwise
   * be indistinguishable from a file with no map, and the census above would
   * happily record whatever fraction of it parsed.
   */
  it('can read the key set of every map it recognises', () => {
    const unreadable = FOUND.flatMap(({ file, maps }) =>
      maps.filter((map) => map.unreadable).map((map) => `${file} ${map.name}`),
    );

    expect(unreadable).toEqual([]);
  });

  /**
   * ⚠️ **The alias is exactly as deletable as the annotation it distrusts, and
   * nothing else observes its absence** — there is no `knip`/`ts-prune` here, so
   * a deleted `_X…OfferTheSameIds` is a silent, clean build. Found by the
   * architect pass. Pinned as a set rather than a rule over multi-map files,
   * because lunar deliberately has two maps and no alias: adding one there
   * should also fail, and make someone say why.
   */
  it('keys the three PDF pairs to their HTML map at build time as well', () => {
    const declaring = FOUND.map(({ file }) => file)
      .filter((file) => declaresDriftAlias(readFileSync(join(THEMES_DIR, file), 'utf8')))
      .sort();

    expect(declaring).toEqual([
      'twoColumn/foggy/helpers/shared/constants.ts',
      'twoColumn/misty/helpers/shared/constants.ts',
      'twoColumn/skyline/helpers/shared/constants.ts',
    ]);
  });

  it.each(
    FOUND.filter(({ maps }) => maps.length > 1).map(({ file, maps }) => [file, maps] as const),
  )('%s', (_file, maps) => {
    // ⚠️ Against the UNION, not against `maps[0]`. Comparing to the first
    // declaration assumes the canonical map is declared first, which nothing
    // guarantees — and it also reports drift against a map that may itself be
    // the one at fault. The union is order-independent and names every side.
    const everyKey = [...new Set(maps.flatMap((map) => map.keys))].sort();
    const drift = maps.flatMap((map) =>
      everyKey
        .filter((key) => !map.keys.includes(key))
        .map((key) => `${map.name} is missing ${key}`),
    );

    expect(drift).toEqual([]);
  });

  it('covers four files declaring more than one map', () => {
    expect(FOUND.filter(({ maps }) => maps.length > 1).map(({ file }) => file)).toEqual([
      'twoColumn/foggy/helpers/shared/constants.ts',
      'twoColumn/lunar/helpers/shared/constants.ts',
      'twoColumn/misty/helpers/shared/constants.ts',
      'twoColumn/skyline/helpers/shared/constants.ts',
    ]);
  });
});

/**
 * The positive controls, and they are the point of extracting `paletteMapsIn`:
 * the two assertions above both pass a file that the walk has stopped reading,
 * and neither can tell a live extractor from a dead one. Each case here drives a
 * synthetic source through the real selector.
 */
describe('the selector', () => {
  const PAIR = `
    export const PALETTES_HTML = {
      default: { primary: '#1a7a4a', bg: 'rgba(0, 0, 0, 0.05)' },
      pink: { primary: '#d946ef', bg: 'transparent' },
    } satisfies Record<string, unknown>;
    export const PALETTES_PDF: Record<string, unknown> = {
      default: { ...PALETTES_HTML.default, bg: '#ffffff' },
      pink: { ...PALETTES_HTML.pink, bg: '#ffffff' },
    };
  `;

  it('reads both maps of a pair, through `satisfies`, an annotation and spreads', () => {
    expect(paletteMapsIn('pair.ts', PAIR)).toEqual([
      { name: 'PALETTES_HTML', keys: ['default', 'pink'], unreadable: false },
      { name: 'PALETTES_PDF', keys: ['default', 'pink'], unreadable: false },
    ]);
  });

  /**
   * The six spellings the first version of this selector was blind to, every one
   * of which turned the whole guard off on a genuinely drifting new pair. Driven
   * as leaves added to an otherwise ordinary map.
   */
  it.each([
    ["bgGradient: 'linear-gradient(90deg, #fff, #000)'", 'a gradient string'],
    ["surface: 'white'", 'a named CSS colour'],
    ["surface: 'var(--bg)'", 'a var() reference'],
    ['tintOpacity: 0.6', 'a numeric leaf'],
    ['accent: `#1a7a4a`', 'a no-substitution template literal'],
    ["text: { main: '#000000', muted: '#333333' }", 'a nested colour group'],
  ])('still recognises a map carrying %s (%s)', (leaf) => {
    const source = `export const PALETTES = { default: { primary: '#111111', ${leaf} } };`;

    expect(paletteMapsIn('leaf.ts', source).map(({ keys }) => keys)).toEqual([['default']]);
  });

  /**
   * ⚠️ Recognised but flagged, not dropped — a map whose keys cannot be read is
   * the one case where silence and success look identical.
   */
  it('flags a map whose key set it cannot read', () => {
    const spread = `export const PALETTES_PDF = { ...OVERRIDES, ocean: { primary: '#196ee6' } };`;

    expect(paletteMapsIn('spread.ts', spread)).toEqual([
      { name: 'PALETTES_PDF', keys: ['ocean'], unreadable: true },
    ]);
  });

  it('reports the drift the guard exists to catch', () => {
    const withoutPdfPink = PAIR.replace("pink: { ...PALETTES_HTML.pink, bg: '#ffffff' },", '');

    expect(paletteMapsIn('drift.ts', withoutPdfPink).map(({ keys }) => keys)).toEqual([
      ['default', 'pink'],
      ['default'],
    ]);
  });

  /**
   * ⚠️ **Why the selector tests the *leaves* and not just the nesting.** Were a
   * theme-keyed font map in scope, the twelve theme ids it is keyed by would
   * have to agree with a palette id set, and every run would fail on a
   * disagreement that means nothing.
   *
   * The real `THEME_FONTS` had exactly this shape until it was flattened to one
   * family per theme. The fixture stays as it was on purpose: it is a string
   * literal, so it goes on testing the leaf rule whatever the application map
   * looks like — which is the property this file needs held, and is not the same
   * thing as the application map happening to still be an example of it.
   */
  it('rejects a map whose leaves are not colours', () => {
    expect(
      paletteMapsIn(
        'fonts.ts',
        `export const THEME_FONTS = { lunar: { heading: 'Inter', body: 'Lora' } };`,
      ),
    ).toEqual([]);
  });

  it('rejects a flat map and a map of empty entries', () => {
    expect(paletteMapsIn('flat.ts', `export const X = { a: '#fff', b: '#000' };`)).toEqual([]);
    expect(paletteMapsIn('empty.ts', `export const X = { a: {}, b: {} };`)).toEqual([]);
  });
});
