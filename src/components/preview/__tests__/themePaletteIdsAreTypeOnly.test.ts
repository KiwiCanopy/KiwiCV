import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * **`themePaletteIds.ts` contributes nothing to the runtime module graph, and
 * `@/locales` does not reach the preview tree.**
 *
 * `locales/en/themes.ts` owes a display name for each of the forty palettes and
 * checks that against `ThemePaletteIds` — so a locale file imports the preview
 * tree. That is safe only because the import is erased: under
 * `verbatimModuleSyntax` an `import type` emits nothing, so `themePaletteIds.ts`
 * and its thirteen imports are absent from `dist/` entirely. Nothing once
 * enforced it. There is no `madge` and no `import/no-cycle` — the latter needs
 * `eslint-plugin-import`, which this repo does not depend on, and the walk below
 * answers the same question without adding one.
 *
 * ⚠️ **"One `import type` → `import` flip closes a real cycle" is wrong. It is
 * two to stop being erasable, and THREE for an actual cycle.** A single flip
 * erases nothing on its own: the shortest route is `themePaletteIds.ts` → any
 * `constants.ts` → `themes/shared`, which value-imports `@/locales` at
 * `levels.ts:1` and `translations.ts:1`. Only foggy imports `themes/shared`
 * directly; the other eleven reach it one hop further on through their
 * `helpers/shared/types.ts`. ⚠️ An earlier draft of this comment said "foggy,
 * misty and skyline", which was state **this branch created** and has since
 * undone — the aliases now import `themes/shared/palette`, a module with zero
 * imports, precisely so they do not shorten the distance.
 *
 * ⚠️ After those two flips the surviving path runs `themePaletteIds.ts` → … →
 * `src/locales/index.ts` and **stops**: the edge back from `locales/en/themes.ts`
 * is still `import type`, so there is no loop and no locale chunk drags the
 * preview tree in. The genuinely bad state needs a third flip, in
 * `locales/en/themes.ts` itself — which the fourth assertion below is what
 * catches. Both corrections came from the architect pass; the count of two is
 * right for the property this file's title names, and wrong for the word
 * "cycle".
 *
 * ⚠️ **This file imports nothing from the application**: a scan that
 * imports the code it scans can be taken down by the very mutation it exists to
 * catch. `typescript` is a build dependency, so the AST costs no new edge.
 *
 * ⚠️ **Scoped by reachability, not by a path or a hand-written file list**
 * The thirteen one-hop modules are read out of `themePaletteIds.ts`'s
 * own import list, so a thirteenth theme joins the scan by existing;
 * `EXPECTED_ONE_HOP` pins the **set** so it names itself when it does. And
 * `import type` is not the only erased spelling — `import { type A, type B }`
 * and `export type * from` erase too, so the edge test asks whether the
 * declaration survives emit rather than matching the words `import type`.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const SELF = fileURLToPath(import.meta.url);
const SRC = resolve(dirname(SELF), '..', '..', '..');
const REPO = resolve(SRC, '..');

const rel = (file: string): string => relative(REPO, file).split(sep).join('/');

const THEME_PALETTE_IDS = join(SRC, 'components', 'preview', 'themePaletteIds.ts');
const THEME_IDS = join(SRC, 'components', 'preview', 'themeIds.ts');
const LOCALES = join(SRC, 'locales', 'index.ts');

const resolveSpecifier = (spec: string, fromFile: string): string | null => {
  let base: string;
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec);
  else return null; // a bare package specifier is never part of this graph

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ];
  return (
    candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null
  );
};

interface Edge {
  readonly target: string;
  /** True when the whole declaration is erased at emit, so it is not a runtime edge. */
  readonly erased: boolean;
}

/**
 * The one implementation, taking the source as a string so the positive controls
 * can drive the real parser over synthetic modules (a count pin is not a
 * positive control, and both assertions below pass a walk that has gone blind).
 */
const edgesIn = (fileName: string, source: string): Edge[] => {
  const tree = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const edges: Edge[] = [];

  for (const statement of tree.statements) {
    let specifier: ts.Expression | undefined;
    let erased = false;

    if (ts.isImportDeclaration(statement)) {
      specifier = statement.moduleSpecifier;
      const clause = statement.importClause;
      erased = !!clause?.isTypeOnly;
      const bindings = clause?.namedBindings;
      // `import { type A, type B } from 'x'` erases too, and carries no `isTypeOnly`.
      if (
        !erased &&
        !clause?.name &&
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.length > 0
      ) {
        erased = bindings.elements.every((element) => element.isTypeOnly);
      }
    } else if (ts.isExportDeclaration(statement) && statement.moduleSpecifier) {
      specifier = statement.moduleSpecifier;
      erased = statement.isTypeOnly;
      const clause = statement.exportClause;
      if (!erased && clause && ts.isNamedExports(clause) && clause.elements.length > 0) {
        erased = clause.elements.every((element) => element.isTypeOnly);
      }
    }

    if (!specifier || !ts.isStringLiteral(specifier)) continue;
    const target = resolveSpecifier(specifier.text, fileName);
    if (target) edges.push({ target, erased });
  }

  /**
   * ⚠️ **`import('x')` survives emit and is not a statement**, so the loop above
   * cannot see it — found by both review passes. It is the cheapest way to make
   * exactly the edge this file forbids: one `void import('@/components/preview/themes/shared')`
   * appended to `themePaletteIds.ts` left the whole file green, while creating a
   * real runtime path into a module whose own closure is over a thousand
   * modules. Not hypothetical here — `main.tsx` and every route in
   * `AppRoutes.tsx` use this form.
   *
   * A dynamic import is code-split, so it does not close the *static* cycle; it
   * does defeat the assertion's own wording, which is "no import that survives
   * emit". Counted as surviving.
   */
  const visitDynamic = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0
    ) {
      const [argument] = node.arguments;
      if (ts.isStringLiteral(argument)) {
        const target = resolveSpecifier(argument.text, fileName);
        if (target) edges.push({ target, erased: false });
      }
    }
    ts.forEachChild(node, visitDynamic);
  };
  visitDynamic(tree);

  return edges;
};

const edgesOf = (file: string): Edge[] => edgesIn(file, readFileSync(file, 'utf8'));

/** Every module reachable from `root` by edges that survive emit, `root` included. */
const valueClosure = (root: string): Set<string> => {
  const seen = new Set([root]);
  const queue = [root];
  while (queue.length > 0) {
    for (const { target, erased } of edgesOf(queue.pop()!)) {
      if (erased || seen.has(target)) continue;
      seen.add(target);
      queue.push(target);
    }
  }
  return seen;
};

/**
 * ⚠️ Read out of the module, not written down: a thirteenth theme extends the
 * scan by existing, and the pin below is what makes it say so.
 */
const ONE_HOP = edgesOf(THEME_PALETTE_IDS)
  .map(({ target }) => rel(target))
  .sort();

const EXPECTED_ONE_HOP = [
  'src/components/preview/themeIds.ts',
  'src/components/preview/themes/oneColumn/elegant/helpers/shared/constants.ts',
  'src/components/preview/themes/oneColumn/javascript/helpers/shared/constants.ts',
  'src/components/preview/themes/oneColumn/plain/helpers/shared/constants.ts',
  'src/components/preview/themes/oneColumn/plain2/helpers/shared/constants.ts',
  'src/components/preview/themes/oneColumn/stackoverflow/helpers/shared/constants.ts',
  'src/components/preview/themes/oneColumn/timeless/helpers/shared/constants.ts',
  'src/components/preview/themes/twoColumn/foggy/helpers/shared/constants.ts',
  'src/components/preview/themes/twoColumn/lunar/helpers/shared/constants.ts',
  'src/components/preview/themes/twoColumn/misty/helpers/shared/constants.ts',
  'src/components/preview/themes/twoColumn/skyline/helpers/shared/constants.ts',
  'src/components/preview/themes/twoColumn/soft/helpers/shared/constants.ts',
  'src/components/preview/themes/twoColumn/swiss-grid/helpers/shared/constants.ts',
];

describe('themePaletteIds.ts stays erasable', () => {
  it('imports the twelve palette id modules and themeIds.ts, and nothing else', () => {
    expect(ONE_HOP).toEqual(EXPECTED_ONE_HOP);
  });

  /**
   * The fence. It fires the moment the last flip lands, whichever file that is
   * and however many hops away — but not before, which is what the tripwire
   * below is for.
   */
  it.each([
    ['themePaletteIds.ts', THEME_PALETTE_IDS],
    ['themeIds.ts', THEME_IDS],
  ] as const)('%s survives emit as nothing but itself', (_name, root) => {
    expect([...valueClosure(root)].map(rel)).toEqual([rel(root)]);
  });

  /**
   * The tripwire, one hop up from the fence: none of the thirteen has any reason
   * to hold a runtime dependency, and forbidding one there means the cycle costs
   * two deliberate violations rather than one quiet edit in a file whose author
   * has no reason to know a locale bundle depends on it.
   */
  it.each(ONE_HOP)('%s has no import that survives emit', (file) => {
    const surviving = edgesOf(join(REPO, file))
      .filter(({ erased }) => !erased)
      .map(({ target }) => rel(target));

    expect(surviving).toEqual([]);
  });

  /**
   * The cycle itself, asserted from the other end so a route rooted anywhere
   * else is still caught — a locale bundle importing a preview module directly,
   * for instance, which no walk starting at `themePaletteIds.ts` can see.
   */
  it('is not reachable at runtime from the locales barrel', () => {
    const reached = [...valueClosure(LOCALES)]
      .map(rel)
      .filter((file) => file.includes('/components/preview/'));

    expect(reached).toEqual([]);
  });
});

/**
 * An earlier change shipped a narrowing — `themes/shared/layout.ts` off the
 * `@/utils/layoutMetadata` barrel and onto `utils/layout/predicates` — with no
 * guard, on the argument that any scan would have to permit `sections.ts`, which
 * imports the same barrel legitimately, and would therefore be an allowlist
 * rather than a guard.
 *
 * ⚠️ **That reasoning is only true of a scan rooted at the DIRECTORY, and the
 * architect pass pointed out that the machinery for the other formulation was
 * two commits old in this same branch.** Rooting `valueClosure` at the narrowed
 * module pins *that module's runtime footprint* — the property the change was
 * actually about — and never mentions `sections.ts` or the barrel at all, so it
 * forgives nothing. It fires the moment anyone re-broadens the import: the
 * closure goes straight back to the eleven modules it was before.
 */
describe('themes/shared/layout.ts keeps its narrowed footprint', () => {
  it('pulls four modules at runtime, not the whole utils/layout barrel', () => {
    const root = join(SRC, 'components', 'preview', 'themes', 'shared', 'layout.ts');

    expect([...valueClosure(root)].map(rel).sort()).toEqual([
      'src/components/preview/themeIds.ts',
      'src/components/preview/themes/shared/layout.ts',
      'src/utils/layout/constants.ts',
      'src/utils/layout/predicates.ts',
    ]);
  });
});

describe('the edge test itself', () => {
  // A real module path, so `resolveSpecifier` resolves against a real directory.
  const HOST = THEME_PALETTE_IDS;
  const classify = (source: string): Array<[string, boolean]> =>
    edgesIn(HOST, source).map(({ target, erased }) => [rel(target), erased]);

  it('reads a plain value import as surviving', () => {
    expect(
      classify(
        `import { PALETTES } from '@/components/preview/themes/twoColumn/soft/helpers/shared/constants';`,
      ),
    ).toEqual([
      ['src/components/preview/themes/twoColumn/soft/helpers/shared/constants.ts', false],
    ]);
  });

  it('reads the three erased spellings as erased', () => {
    const soft = 'src/components/preview/themes/twoColumn/soft/helpers/shared/constants.ts';
    expect(
      classify(
        `import type { SoftPaletteId } from '@/components/preview/themes/twoColumn/soft/helpers/shared/constants';`,
      ),
    ).toEqual([[soft, true]]);
    expect(
      classify(
        `import { type SoftPaletteId } from '@/components/preview/themes/twoColumn/soft/helpers/shared/constants';`,
      ),
    ).toEqual([[soft, true]]);
    expect(
      classify(
        `export type * from '@/components/preview/themes/twoColumn/soft/helpers/shared/constants';`,
      ),
    ).toEqual([[soft, true]]);
  });

  /**
   * ⚠️ The two spellings that look erased and are not. A default binding is a
   * value however the named ones are marked, and a bare side-effect import has
   * no clause at all — `!!undefined?.isTypeOnly` is `false`, which is right, and
   * is the arm most easily broken by "simplifying" the clause handling.
   */
  it('reads a mixed default import and a side-effect import as surviving', () => {
    const soft = 'src/components/preview/themes/twoColumn/soft/helpers/shared/constants';
    expect(
      classify(
        `import PALETTES, { type SoftPaletteId } from '@/${soft.replace('src/', '')}';`,
      )[0][1],
    ).toBe(false);
    expect(classify(`import '@/${soft.replace('src/', '')}';`)[0][1]).toBe(false);
  });

  it('ignores bare package specifiers and unresolvable paths', () => {
    expect(classify(`import ts from 'typescript'; import x from './nope-does-not-exist';`)).toEqual(
      [],
    );
  });
});
