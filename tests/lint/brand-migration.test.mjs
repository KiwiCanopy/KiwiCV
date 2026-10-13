/**
 * `brand:check` was red on `main` and nobody noticed.
 *
 * That is the finding worth guarding, not the one line it reported. AGENTS.md §6
 * lists the check among the things to run before shipping, which makes it a
 * command someone has to remember to type; `npm test` is not. A check in its
 * resting red state stops being read, and the next real former-brand leak lands
 * in a list that already has an entry in it.
 *
 * The second test is the one that would have caught the last leak *before* it was red.
 * The failing line was the **writer** of `cv_canvas_migration_ui`
 * (`src/store/resume/migrations.ts`); its **reader** (`src/store/ui/useUIStore.ts`)
 * was fine, because the allowance's path regex ended in
 * `(?:\.test\.ts|Store\.ts|Migration\.ts)` and `useUIStore.ts` happens to end in
 * `Store.ts`. One compatibility fact, two ends, one of them exempt by spelling.
 * So the key is asserted by name at both ends rather than by whichever files
 * currently hold them.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
  ALLOWED_COMPATIBILITY_REFERENCES,
  scanBrandReferences,
} = require('../../scripts/check-brand-migration.cjs');

const { matches } = scanBrandReferences();

test('brand:check is green on the tree', () => {
  const violations = matches.filter((match) => !match.allowance);
  assert.deepEqual(
    violations.map((violation) => `${violation.file}:${violation.line}: ${violation.text}`),
    [],
  );
});

test('every site of the v4 UI handoff key is allowed, not only the reader', () => {
  // Named, not counted: a `>= 2` assertion passes when both sites are the two
  // reader lines in `useUIStore.ts` and the writer has been silently dropped.
  const sites = matches.filter((match) => match.text.includes('cv_canvas_migration_ui'));
  const files = [...new Set(sites.map((site) => site.file))].sort();

  assert.deepEqual(files, ['src/store/resume/migrations.ts', 'src/store/ui/useUIStore.ts']);
  for (const site of sites) {
    assert.ok(site.allowance, `${site.file}:${site.line} is not covered by any allowance`);
  }
});

test('no allowance is stale', () => {
  // An exemption that matches nothing is an exemption nobody can see the effect
  // of removing, and it is how the list grows past what it is protecting.
  const carrying = new Set(matches.map((match) => match.allowance).filter(Boolean));
  const dead = ALLOWED_COMPATIBILITY_REFERENCES.filter((allowance) => !carrying.has(allowance)).map(
    (allowance) => `${allowance.path.source} :: ${allowance.reason}`,
  );

  assert.deepEqual(dead, []);
});
