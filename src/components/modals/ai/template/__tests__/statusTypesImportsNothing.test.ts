import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * **`statusTypes.ts` must import nothing.**
 *
 * That is the whole property the module exists for, and it is
 * the only line of defence. Under `verbatimModuleSyntax` an `import { type A }`
 * compiles to `import {}` — a live runtime edge — so when these declarations sat
 * beside the component, `edit/types.ts` dragged a React component and its
 * `lucide-react`, `StatePanel` and `analytics` imports into every consumer, and
 * closed a cycle the moment anything in `template/` imported `edit/`.
 *
 * ⚠️ **The escape hatch is gone.** Consumers used to import from here type-only,
 * so a bad import added here was still erased downstream. `coverLetterPresentation`
 * is a value, so `AIStatusView` and `AIStatusOutcomeCards` now hold imports that
 * survive emit: this file is a permanent runtime node, and one import declaration
 * added to it is enough. The count is zero, so the assertion needs no allowlist.
 *
 * ⚠️ **This test imports nothing from the application** — a scan that imports the
 * code it scans can be taken down by the mutation it exists to catch. `typescript`
 * is already a build dependency.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const SELF = fileURLToPath(import.meta.url);
const STATUS_TYPES = resolve(dirname(SELF), '..', 'statusTypes.ts');

const declarations = (file: string): string[] => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const specifiers: string[] = [];
  source.forEachChild((node) => {
    // `export ... from` re-exports a module too, and erases the same way an
    // `import { type A }` does not.
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
  });
  return specifiers;
};

describe('statusTypes.ts', () => {
  it('reaches no other module', () => {
    expect(declarations(STATUS_TYPES)).toEqual([]);
  });

  /** The scan is only worth anything if it can see an import at all. */
  it('would see one if it were added', () => {
    const sibling = join(dirname(STATUS_TYPES), 'AIStatusOutcomeCards.tsx');
    expect(declarations(sibling).length).toBeGreaterThan(0);
  });
});
