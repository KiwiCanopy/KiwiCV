import { named, sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * The forward half of `blankItemSources.test.ts`.
 *
 * That file spies on `createEmptyItem` for `SkillsForm`, `LanguageForm` and
 * `ProfileList`. Each spy is a **universal** claim about its own hook and a
 * **regression pin** over the set: a fourth form that builds an item inline
 * produces no match and no failure, and that is indistinguishable from a form
 * with no inline literal. This file is the forward guard, and it does not
 * replace the three behavioural cases — a source scan never does.
 *
 * ## Scoped by the property, twice corrected
 *
 * Every résumé item carries a `_vId` — visibility tracking needs it,
 * `getSectionItemHash` short-circuits on it, `sanitizeArray` backfills it on
 * import — so `_vId` written as an **object-literal property** is the signature
 * of code constructing one. The rule: such a file must also **mention**
 * `createEmptyItem`.
 *
 * ⚠️ **The first version was scoped by a REGEX and by a PATH, and both reviewer
 * passes broke it independently.**
 *
 * - The regex required a colon (`_vId\s*:`). ES6 **shorthand** —
 *   `const _vId = generateId(); const blank = { _vId, name: '' };` — has no
 *   colon, and a file doing exactly what this guard forbids was fully green. A
 *   computed key (`{ ['_vId']: id }`) is the same defeat again. Both are closed
 *   by walking the **AST**: `ObjectLiteralExpression` properties named `_vId`,
 *   which is the property rather than a spelling of it, and which also
 *   distinguishes construction from a destructure (`const { _vId, ...rest }` is
 *   an `ObjectBindingPattern`, not an object literal) without a lookahead.
 * - The walk was rooted at `src/components/editor`. A file at
 *   `src/features/dashboard/editor/` — a directory that already exists — escaped
 *   it entirely. The docblock listed that as a stated non-goal, which is not the
 *   same as being safe: a scan scoped by a path convention reports green over
 *   the instance it was written for (the scope-by-property rule,
 *   `.claude/rules/testing.md`). Rooted at `src/` now, with the classification
 *   doing the work.
 *
 * ⚠️ **"Mentions", not "calls with this shape"** — the mention-is-not-a-call
 * rule: a call-shape scan was defeated four ways, and a file producing no match
 * is indistinguishable from one that never calls the function. An alias still
 * leaves the symbol in the `import`.
 *
 * ## What it does NOT cover, stated rather than implied
 *
 * - A file that calls `createEmptyItem` **and** hand-rolls a second literal
 *   passes. That is the price of a file-level rule; `blankItemSources.test.ts`
 *   covers the sites that exist.
 * - An item built with **no** `_vId` passes here and is caught later —
 *   `sanitizeArray` backfills one on import, a milder defect.
 * - Formatting, ordering, and whether the fields are *right*. `items.test.ts`
 *   owns the shape.
 *
 * ## Anti-vacuity
 *
 * The set the walk **found** is pinned, not the files it opened (the pin-the-set
 * rule), and the file imports **nothing** from the application — a scan that
 * imports the code it scans can be taken down by the very mutation it exists to
 * catch, before a single assertion runs. `typescript` is a build dependency, not
 * application code; `scripts/i18n/check-usage.cjs` uses it the same way.
 */

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

interface Constructor {
  file: string;
  lines: number[];
  mentionsCreateEmptyItem: boolean;
}

/** Property name of an object-literal member, covering shorthand and computed string keys. */
function propertyName(prop: ts.ObjectLiteralElementLike): string | undefined {
  if (ts.isShorthandPropertyAssignment(prop)) return prop.name.text;
  const name = prop.name;
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  if (ts.isComputedPropertyName(name) && ts.isStringLiteral(name.expression))
    return name.expression.text;
  return undefined;
}

function scan(): Constructor[] {
  const out: Constructor[] = [];

  for (const full of sourceFiles(SRC, {
    extensions: ['.ts', '.tsx'],
    skip: [named('__tests__'), /\.test\.[^/]*$/],
  })) {
    const source = readFileSync(full, 'utf8');
    const sourceFile = ts.createSourceFile(
      full,
      source,
      ts.ScriptTarget.Latest,
      true,
      full.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    const lines: number[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isObjectLiteralExpression(node)) {
        for (const prop of node.properties) {
          if (propertyName(prop) === '_vId') {
            lines.push(
              sourceFile.getLineAndCharacterOfPosition(prop.getStart(sourceFile)).line + 1,
            );
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    if (lines.length) {
      out.push({
        file: relative(ROOT, full),
        lines,
        mentionsCreateEmptyItem: source.includes('createEmptyItem'),
      });
    }
  }

  return out;
}

const CONSTRUCTORS = scan();

/**
 * ⚠️ **One file constructs a `_vId` without going through `createEmptyItem`, and
 * it is deliberate.** Named with a reason rather than skipped, and asserted with
 * `toEqual` so a second one fails and so does a stale entry.
 *
 * It was not in the original `src/components/editor` root, which is how the
 * path-scoped version reported a clean repository over it.
 *
 * ⚠️ **`src/utils/componentVariants.ts` was the second entry and is
 * gone**, at 24 sites — twelve sections × a `main` and a `side` projection, each
 * restating its item shape field by field, with `location` already missing
 * from twelve of the twenty-four. It now spreads the item instead of rebuilding
 * it, so it constructs no `_vId` at all and this walk stops seeing it. The entry
 * is not moved or relaxed; the construction it described no longer exists.
 */
const NON_SEEDING_CONSTRUCTORS = [
  // Re-stamps an id onto an item the AI proposed, rather than seeding a blank
  // one — `{ ...rest, _vId: generateId(), visible: true }`. A different and
  // milder family: the fields come from the suggestion, so there is no shape to
  // drift from `EMPTY_ITEM_FIELDS`.
  'src/store/resume/slices/ai/reorgActions.ts',
  // Carries an existing custom-section entry's id onto the volunteer shape the
  // themes render; it seeds nothing.
  'src/components/preview/themes/shared/customSections.ts',
].sort();

describe('every file that constructs a _vId goes through createEmptyItem', () => {
  it('finds the construction sites that exist', () => {
    /**
     * ⚠️ Pinned as file → count, not as `file:line`. A line pin fails on any edit
     * *above* an unrelated site in the same file, which is noise rather than
     * signal, and noise is how a pin gets updated without being read. A site in
     * a new file still fails on the key set and a second site in a listed file
     * fails on its count; the line numbers are computed and carried in the
     * failure message, which is what they are for.
     *
     * ⚠️ The census this guard started from was stale — it recorded
     * `useArrayForm.ts` as the only site. The other three editor entries arrived
     * with the change itself, which converged the non-`ArrayForm` hooks onto
     * `createEmptyItem` and left each passing `{ _vId: emptyItem._vId }` to
     * `toggleItemVisibility`. All four are visibility handles rather than items,
     * which is why the rule is "the file goes through `createEmptyItem`" and not
     * "no literal carries a `_vId`" — the latter needs an allowlist for these
     * four, and an allowlisted scan is a regression pin that gets routed around.
     */
    const byFile = Object.fromEntries(
      [...CONSTRUCTORS]
        .sort((a, b) => a.file.localeCompare(b.file))
        .map(({ file, lines }) => [file, lines.length]),
    );

    expect(byFile).toEqual({
      'src/components/editor/ArrayForm/useArrayForm.ts': 1,
      'src/components/editor/LanguageForm/useLanguageForm.ts': 1,
      'src/components/editor/ProfileList/useProfileList.ts': 1,
      'src/components/editor/SkillsForm/useSkillsForm.ts': 1,
      'src/components/preview/themes/shared/customSections.ts': 1,
      'src/store/resume/slices/ai/reorgActions.ts': 1,
      'src/utils/items.ts': 2,
      'src/utils/validation.ts': 2,
    });
  });

  it('only the one documented non-seeding file skips createEmptyItem', () => {
    const offenders = CONSTRUCTORS.filter((c) => !c.mentionsCreateEmptyItem)
      .map((c) => c.file)
      .sort();

    expect(offenders).toEqual(NON_SEEDING_CONSTRUCTORS);
  });
});

/**
 * The positive controls. "The walk found eight files" and "the walk can tell a
 * bad file from a good one" are independent properties — if the AST match
 * stopped firing, the assertion above would pass forever over an empty list
 * (and a count pin is not a control either).
 *
 * Driven through the same `propertyName` the scan uses, on synthetic sources, so
 * the classifier is exercised rather than a paraphrase of it.
 */
describe('the scan can tell a hand-rolled item from a compliant file', () => {
  const classify = (source: string) => {
    const sourceFile = ts.createSourceFile(
      'probe.ts',
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const lines: number[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isObjectLiteralExpression(node)) {
        for (const prop of node.properties) {
          if (propertyName(prop) === '_vId') {
            lines.push(
              sourceFile.getLineAndCharacterOfPosition(prop.getStart(sourceFile)).line + 1,
            );
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return { lines, mentions: source.includes('createEmptyItem') };
  };

  it.each([
    ['a hand-rolled item literal', `const item = { _vId: generateId(), name: '' };`, [1], false],
    // ⚠️ The evasion the regex version missed, found by the code-reviewer pass.
    ['ES6 shorthand', `const _vId = id();\nconst item = { _vId, name: '' };`, [2], false],
    ['a computed string key', `const item = { ['_vId']: id(), name: '' };`, [1], false],
    [
      'a compliant file',
      `import { createEmptyItem } from '@/utils/items';\nconst item = { _vId: blank._vId };`,
      [2],
      true,
    ],
    [
      'an aliased import still leaves the symbol in the file',
      `import { createEmptyItem as blank } from '@/utils/items';\nconst i = { _vId: blank('work')._vId };`,
      [2],
      true,
    ],
    ['a read of _vId', `const id = item._vId;\nconst k = other?._vId;`, [], false],
    ['an optional type member', `interface X {\n  _vId?: string;\n}`, [], false],
    ['a required type member', `interface X {\n  _vId: string;\n}`, [], false],
    ['a destructure', `const { _id, _vId, ...rest } = item;`, [], false],
  ] as const)('%s', (_label, source, expectedLines, expectedMentions) => {
    const result = classify(source);
    expect(result.lines).toEqual([...expectedLines]);
    expect(result.mentions).toBe(expectedMentions);
  });

  /**
   * ⚠️ The line-number control. The AST reports the property's own position, so
   * a docblock above it cannot shift the answer — which the regex version had to
   * hand-roll a comment stripper to achieve, and got wrong by forty lines the
   * first time it was tried in this repo.
   */
  it('reports the line the construction is actually on, after a docblock', () => {
    expect(classify(`/**\n * a\n * b\n */\nconst item = { _vId: 'x' };`).lines).toEqual([5]);
  });
});
