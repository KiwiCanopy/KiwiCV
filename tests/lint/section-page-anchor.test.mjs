import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceFiles as listSourceFiles, named } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * `SectionPage` renders `#editor-section-heading`, the last rung of the AI
 * proposal flow's focus handoff (`code/UI_PATTERNS.md`). An id is only an
 * address while exactly one element carries it, and the thing that makes that
 * true is a convention, not a type: the editor rail mounts one `variant="page"`
 * Section at a time. `variant` is a public prop on a shared primitive, and the
 * other `Section` consumers — the legal pages, the extras tabs — render a STACK
 * whose author would read "page" as "this is a page section". A second one
 * mounted at once is legal DOM: `getElementById` returns whichever came first
 * and focus lands on the wrong heading, with nothing failing.
 */
const PAGE_VARIANT_FILES = new Set([
  // The rail's one-section-at-a-time panel. This is the invariant's home.
  'src/features/dashboard/editor/EditorSectionPanel.tsx',
  // Not a `Section` at all — `AuthView` has a `variant` prop of its own, and
  // the identical spelling is exactly the confusion this test exists to catch.
  'src/pages/Login.tsx',
]);

const sourceFiles = listSourceFiles(path.join(ROOT, 'src'), {
  extensions: ['.ts', '.tsx'],
  skip: [named('__tests__')],
});

test('only the editor rail mounts a page-variant Section', () => {
  const found = sourceFiles
    .filter((file) => fs.readFileSync(file, 'utf8').includes('variant="page"'))
    .map((file) => path.relative(ROOT, file))
    .sort();

  assert.deepEqual(
    found,
    [...PAGE_VARIANT_FILES].sort(),
    'A new `variant="page"` mounts a second `#editor-section-heading` when the rail already has one. ' +
      'Mount it through `EditorSectionPanel`, or give the heading anchor a different addressing scheme.',
  );
});

/**
 * Every id `focusAnchors.ts` lists as a singleton, and the one file that renders
 * it. Counted per occurrence, so a second render inside the same file fails too.
 */
const SINGLETON_ANCHORS = {
  SECTION_HEADING_ANCHOR_ID: 'src/components/ui/section/SectionPage.tsx',
  REVIEW_NEXT_ANCHOR_ID: 'src/features/dashboard/editor/proposals/PendingProposalsBar.tsx',
  COMPOSER_RUN_ANCHOR_ID: 'src/features/dashboard/editor/composer/AIComposerBar.tsx',
};

for (const [name, owner] of Object.entries(SINGLETON_ANCHORS)) {
  test(`${name} is rendered in exactly one place`, () => {
    const pattern = new RegExp(`\\bid=\\{${name}\\}`, 'g');
    const renders = sourceFiles.flatMap((file) =>
      (fs.readFileSync(file, 'utf8').match(pattern) ?? []).map(() => path.relative(ROOT, file)),
    );

    assert.deepEqual(
      renders,
      [owner],
      'Two elements carrying the same id makes `getElementById` pick one arbitrarily.',
    );
  });
}
