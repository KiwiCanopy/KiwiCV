const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const LOCALES = require('../../scripts/languages.cjs');
const ROOT = path.join(__dirname, '..', '..');
const REGISTRY = path.join(ROOT, 'src', 'data', 'changelog.ts');
const LOCALES_DIR = path.join(ROOT, 'src', 'locales');

/**
 * Every version in the registry, in source order.
 *
 * Read by regex rather than by importing the module: this is a `.cjs` test and
 * the registry is TypeScript. The shape is a flat object literal per entry, so
 * a regex over `id:` is sufficient and does not need a parser.
 */
function registryIds() {
  const source = fs.readFileSync(REGISTRY, 'utf8');
  return [...source.matchAll(/id:\s*'(v_\d{3}_\d{3}_\d{3})'/g)].map((m) => m[1]);
}

/**
 * 4.2.3 shipped a registry entry whose locale files did not exist.
 *
 * `changelog:deps` could only append to a file `changelog:sync` had already
 * created, and a release whose sole content is dependency updates has an empty
 * `CHANGELOG_UPDATES` — so sync created nothing, deps wrote nothing, and
 * `release.cjs` added the registry entry regardless. `t` returns the key path
 * on a miss, so What's New would have rendered the raw `v_004_002_003` string.
 *
 * Nothing failed: the build succeeded, `npm test` passed, and `i18n:check`
 * passed, because every check looked at the locale files or the registry, never
 * at the relationship between them. That relationship is what this asserts.
 */
test('every registry version has locale content in all 15 locales', () => {
  const ids = registryIds();
  assert.ok(ids.length > 0, 'parsed no versions out of src/data/changelog.ts — check the regex');

  const missing = [];
  for (const id of ids) {
    for (const locale of LOCALES) {
      const file = path.join(LOCALES_DIR, locale, 'changelog', `${id}.ts`);
      if (!fs.existsSync(file)) missing.push(`${locale}/${id}.ts`);
    }
  }

  assert.deepStrictEqual(
    missing,
    [],
    'A version in src/data/changelog.ts has no changelog content. Run `npm run changelog:deps` ' +
      '(it bootstraps the file for a dependency-only release) or stage an entry with ' +
      '`npm run changelog:add`. Do not delete the registry entry to make this pass.',
  );
});

test('every registry version is imported by its locale index', () => {
  const ids = registryIds();
  const unregistered = [];

  for (const locale of LOCALES) {
    const indexPath = path.join(LOCALES_DIR, locale, 'changelog', 'index.ts');
    if (!fs.existsSync(indexPath)) {
      unregistered.push(`${locale}/index.ts (missing)`);
      continue;
    }
    const index = fs.readFileSync(indexPath, 'utf8');
    for (const id of ids) {
      // Both halves matter: the import brings the object in, the entry in
      // `changelog_entries` is what the app actually reads.
      if (!index.includes(`from './${id}'`) || !new RegExp(`^\\s*${id},$`, 'm').test(index)) {
        unregistered.push(`${locale}/index.ts → ${id}`);
      }
    }
  }

  assert.deepStrictEqual(
    unregistered,
    [],
    'A changelog version exists on disk but no index imports it, so the app cannot see it. ' +
      'The indexes are regenerated from the directory listing by ' +
      '`scripts/changelog-index.cjs` — rerun `npm run changelog:sync`.',
  );
});
