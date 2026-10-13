import { sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Every theme's `*Palette` type must declare only what `ThemePalette` does
 * **not** already give it.
 *
 * ⚠️ A restatement of a field `ThemePalette` already declares identically is a
 * no-op that reads as a local requirement, and it drifts silently: make
 * `ThemePalette.text` optional tomorrow and seven declarations disagree about
 * whether it is required, with nothing able to see it. Same shape
 * `themes/shared/types.ts` documents for the deleted `id`/`nameKey`/`ui` fields.
 * A cleanup removed **24** — 12 in `PlainPalette` and `SwissGridPalette`, which
 * restated nothing else at all and are now `= ThemePalette` aliases, and 12 more
 * alongside real fields in elegant, javascript, stackoverflow, timeless, misty
 * and foggy.
 *
 * ⚠️ **Narrowing is not restating**, and that distinction is the whole test, so
 * this compares optionality as well as name and type and only an exact match is
 * dead. ⚠️ **No narrowing exists in the tree any more** — `TimelessPalette` and
 * `MistyPalette` used to redeclare `ThemePalette.textLight?` as required, and
 * the field has since moved out of `ThemePalette` altogether, so they simply declare
 * it. The comparison is kept and driven by a synthetic declaration in its own
 * positive control instead: an assertion whose corpus no longer contains the case
 * it was written for proves nothing about the case.
 *
 * ⚠️ **This is a source scan and there is no compile-time alternative.**
 * `interface X extends B { text: string }` where `B.text: string` resolves to a
 * type indistinguishable from `B`, so the restatement is erased before any
 * type-level operator can see it — an `Equal<X, ThemePalette>` assertion stays
 * true after a pure re-expansion and fails when someone adds a *real* colour,
 * i.e. it is silent on what should be caught and noisy on what should be allowed.
 * TypeScript has no `noRedundantInterfaceMembers` and typescript-eslint has no
 * equivalent rule. What proves those deletions changed nothing is not this
 * file: it is the markup hash (serialized Typst and rendered HTML byte-identical
 * for all 40 theme × palette combinations) and `TS2741` on a palette literal that
 * omits `textLight`.
 *
 * ⚠️ **The first version of this scan was itself vacuous, and this is the lesson
 * worth keeping.** It globbed `helpers/shared/types.ts` — the convention eleven
 * themes follow — and so never opened foggy's `constants.ts`, where
 * `FoggyPalette` and `FoggyPalettePDF` live. It reported green on a tree that
 * still contained `FoggyPalette.text`, a 24th dead restatement, and its
 * anti-vacuity guard asserted the *file count* (12, true and irrelevant) rather
 * than interface coverage. **Scope a scan by the property it is about, never by a
 * path convention, and pin the set it found rather than the files it opened.**
 * These are the scope-by-property and pin-the-set rules (`.claude/rules/testing.md`).
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const THEMES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'themes');

/** Every theme source file, relative to `THEMES_DIR`. */
const themeFiles = () =>
  sourceFiles(THEMES_DIR, { extensions: ['.ts', '.tsx'], skip: [] }).map((file) =>
    relative(THEMES_DIR, file),
  );

type Field = { optional: boolean; type: string };
type Declaration = { name: string; parent: string; file: string; fields: Map<string, Field> };

/**
 * Every declaration form that can inherit `ThemePalette`'s fields:
 *
 * - `interface X extends Y {` — tolerating a line break before `extends` (which
 *   is what Prettier emits past `printWidth: 100`) and further heritage clauses
 *   after it (`extends ThemePalette, Brandable`);
 * - `type X = ThemePalette & { … }` — ⚠️ the form the `PlainPalette` doc comment
 *   steers the next author toward, so the scan must see it or the advice is a
 *   trap.
 *
 * ⚠️ **The parent is captured, not hardcoded to `ThemePalette`.** A later change added
 * `SkylinePalettePDF extends SkylinePalette` — a palette type one level further
 * out — and the earlier `extends\s+ThemePalette` pattern simply did not see it.
 * Same failure as the `helpers/shared/types.ts` glob noted above, one axis over: a
 * scan scoped to the shape that happened to exist rather than to the property.
 * Chains are resolved below, so a restatement is dead whether it duplicates
 * `ThemePalette` or the theme's own base.
 */
const DECLARATIONS = [
  /export\s+interface\s+(\w*Palette\w*)\s+extends\s+(\w+)\s*(?:,[^{]*)?\{([\s\S]*?)\n\}/g,
  /export\s+type\s+(\w*Palette\w*)\s*=\s*(ThemePalette)\s*&\s*\{([\s\S]*?)\n\}/g,
];

/**
 * `name: type;` / `name?: type;`, one per line.
 *
 * ⚠️ Deliberately strict, and `expectedFieldCounts` below is what makes that
 * safe. A body this cannot parse yields **zero** fields, which is silent — the
 * first version of this file had exactly that hole for a multi-line field type, a
 * `readonly` modifier, a quoted key or two fields on one line, and its positive
 * control only checked declaration *names*, so an unparsed body passed.
 */
const parseFields = (body: string): Map<string, Field> => {
  const fields = new Map<string, Field>();
  for (const line of body.split('\n')) {
    const match = /^\s*(\w+)(\??):\s*([^;]+);\s*$/.exec(line);
    if (match) fields.set(match[1], { optional: match[2] === '?', type: match[3].trim() });
  }
  return fields;
};

const readThemePaletteFields = (): Map<string, Field> => {
  const source = readFileSync(join(THEMES_DIR, 'shared', 'types.ts'), 'utf8');
  const body = /export interface ThemePalette \{([\s\S]*?)\n\}/.exec(source);
  expect(body).not.toBeNull();
  return parseFields(body![1]);
};

/**
 * Every `.ts`/`.tsx` under `themes/` — the `paletteResolution.test.tsx` glob.
 *
 * Only declarations whose `extends` chain actually reaches `ThemePalette` are
 * returned; an unrelated `interface FooPalette extends Bar` is not this file's
 * business and would have no inherited field set to compare against.
 */
const paletteDeclarations = (): Declaration[] => {
  const files = themeFiles();

  const all = files.flatMap((file) => {
    const source = readFileSync(join(THEMES_DIR, file), 'utf8');
    return DECLARATIONS.flatMap((pattern) =>
      [...source.matchAll(pattern)].map((match) => ({
        name: match[1],
        parent: match[2],
        file,
        fields: parseFields(match[3]),
      })),
    );
  });

  const byName = new Map(all.map((declaration) => [declaration.name, declaration]));
  const reachesBase = (name: string, seen = new Set<string>()): boolean => {
    if (name === 'ThemePalette') return true;
    if (seen.has(name)) return false;
    seen.add(name);
    const parent = byName.get(name)?.parent;
    return !!parent && reachesBase(parent, seen);
  };

  return all.filter((declaration) => reachesBase(declaration.parent));
};

/**
 * Everything a declaration inherits: `ThemePalette`'s fields plus every
 * intermediate palette's own. `SkylinePalettePDF` must not restate
 * `SkylinePalette`'s colours any more than `ThemePalette`'s.
 */
const inheritedFields = (
  declaration: Declaration,
  base: Map<string, Field>,
  all: Declaration[],
): Map<string, Field> => {
  const merged = new Map(base);
  let parent = all.find((other) => other.name === declaration.parent);
  const seen = new Set<string>();
  while (parent && !seen.has(parent.name)) {
    seen.add(parent.name);
    for (const [field, value] of parent.fields) if (!merged.has(field)) merged.set(field, value);
    parent = all.find((other) => other.name === parent!.parent);
  }
  return merged;
};

/**
 * The declarations that must be found, and **how many fields each must parse**.
 *
 * ⚠️ Both halves are load-bearing, and neither is implied by the other. Without
 * the names, a walk that stopped matching would report zero offenders and pass;
 * without the counts, a body the parser cannot read contributes zero fields and
 * passes just as quietly. That second hole is what shipped in the first version.
 *
 * ⚠️ `FoggyPalette` and `FoggyPalettePDF` are in `foggy/helpers/shared/constants.ts`,
 * not a `types.ts`. That is the whole reason this list is pinned by name.
 */
const EXPECTED: Record<string, number> = {
  ElegantPalette: 1,
  FoggyPalette: 5,
  FoggyPalettePDF: 2,
  JavaScriptPalette: 17,
  LunarPalette: 10,
  MistyPalette: 6,
  SkylinePalette: 6,
  SkylinePalettePDF: 1,
  SoftPalette: 3,
  StackoverflowPalette: 2,
  TimelessPalette: 1,
};

describe('theme palette declarations', () => {
  const base = readThemePaletteFields();

  it('reads ThemePalette, and it has no optional fields', () => {
    // 7 since `primaryLight?` and `textLight?` moved onto the themes that
    // read them (9 before that, after the two with no readers at all were
    // deleted). This pin is what notices either way.
    expect(base.size).toBe(7);

    /**
     * ⚠️ **Zero optionals is the contract, and this is the only place that says
     * so at runtime.** An optional field on `ThemePalette` gives a theme neither
     * `TS2741` when its palettes omit the colour it reads nor `TS2353` when they
     * declare one nothing reads — the gap lunar shipped through and that
     * a behavioural guard existed to detect until a later change deleted both the optionals
     * and the guard. Adding one back must fail loudly here.
     *
     * ⚠️ What this **cannot** catch is a field the parser never saw: an unparsed
     * optional never enters `base`, so it never enters this list. The `base.size`
     * pin above is the other half, and it is not redundant — a dropped field plus
     * an added-but-unparsed one would cancel out only if both moved at once.
     */
    expect([...base.entries()].filter(([, field]) => field.optional).map(([name]) => name)).toEqual(
      [],
    );
    expect([...new Set([...base.values()].map((field) => field.type))]).toEqual(['string']);
  });

  it('finds every declaration that inherits ThemePalette, and parses each body', () => {
    const found = paletteDeclarations();

    expect(Object.fromEntries(found.map(({ name, fields }) => [name, fields.size]))).toEqual(
      EXPECTED,
    );

    // plain, plain2 and swiss-grid are bare `= ThemePalette` aliases: they inherit
    // nothing to restate, so they are correctly absent from EXPECTED rather than
    // missed by the walk. Asserted positively so "absent" cannot mean "unseen".
    const aliases = themeFiles()
      .flatMap((file) => [
        ...readFileSync(join(THEMES_DIR, file), 'utf8').matchAll(
          /export type (\w*Palette\w*) = ThemePalette;/g,
        ),
      ])
      .map((match) => match[1])
      .sort();

    expect(aliases).toEqual(['Plain2Palette', 'PlainPalette', 'SwissGridPalette']);
  });

  /** Shared by the scan and by its positive control below. */
  const deadRestatements = (declarations: Declaration[]) =>
    declarations.flatMap((declaration) => {
      const inheritedSet = inheritedFields(declaration, base, declarations);
      return [...declaration.fields]
        .filter(([field, declared]) => {
          const inherited = inheritedSet.get(field);
          return (
            !!inherited &&
            inherited.optional === declared.optional &&
            inherited.type === declared.type
          );
        })
        .map(([field]) => `${declaration.name}.${field}`);
    });

  const synthetic = (fields: Map<string, Field>): Declaration => ({
    name: 'Synthetic',
    parent: 'ThemePalette',
    file: 'synthetic.ts',
    fields,
  });

  it('has no declaration restating an inherited palette field identically', () => {
    expect(deadRestatements(paletteDeclarations())).toEqual([]);
  });

  /**
   * The positive control for the block above, and it had to change shape once.
   *
   * It used to assert that the scan still *saw* the two `textLight` narrowings —
   * `MistyPalette` and `TimelessPalette` redeclaring an optional as required —
   * which proved the comparison could distinguish narrowing from restating.
   * `ThemePalette` has no optionals now, so no narrowing exists to point at, and
   * "the list is empty" would prove nothing on its own.
   *
   * ⚠️ So the control drives the **predicate** rather than the corpus: a synthetic
   * declaration restating `primary` verbatim must be flagged, and one declaring a
   * genuinely new colour must not. A parser or comparison that matched nothing
   * would satisfy `dead === []` above and fail here.
   */
  it('flags a restatement and spares a real field', () => {
    expect(deadRestatements([synthetic(new Map([['primary', base.get('primary')!]]))])).toEqual([
      'Synthetic.primary',
    ]);
    expect(
      deadRestatements([
        synthetic(new Map([['sidebarHeading', { optional: false, type: 'string' }]])),
      ]),
    ).toEqual([]);
    // …and a *narrowing* of a required field to optional is not a restatement,
    // which is the distinction the whole comparison exists for.
    expect(
      deadRestatements([synthetic(new Map([['primary', { optional: true, type: 'string' }]]))]),
    ).toEqual([]);
  });

  /**
   * The other half of the parent-chain change: a restatement of a field inherited
   * from a theme's own base — not from `ThemePalette` — must be caught too.
   * `SkylinePalettePDF extends SkylinePalette` is the first such declaration in
   * the repo, and the scan was blind to the whole form until then.
   */
  it('resolves the extends chain rather than only direct ThemePalette children', () => {
    const found = paletteDeclarations();
    const pdf = found.find((declaration) => declaration.name === 'SkylinePalettePDF');
    expect(pdf?.parent).toBe('SkylinePalette');

    const chained: Declaration = {
      ...pdf!,
      fields: new Map([['primaryMesh', pdf!.fields.get('textLight')!]]),
    };
    expect(
      deadRestatements([...found.filter((d) => d.name !== 'SkylinePalettePDF'), chained]),
    ).toEqual(['SkylinePalettePDF.primaryMesh']);
  });
});
