import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceFiles as listSourceFiles, named } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const UI_DIR = path.join(ROOT, 'src/components/ui');

// Primitives with no production consumer today. Phase 7.5b recorded
// `Field.required` as having "53 references" and `Button.disabledReason` as
// having "18 consumers"; the real numbers were 0 and 1, and that wrong count is
// what set the work order. This test makes the count checkable instead of
// asserted. Delete an entry when a real surface adopts the primitive; add one
// only with a reason.
const KNOWN_UNUSED = new Set([
  'Field', // Adopted by 7.6 forms; TagField renders an injected FieldComponent.
  // `UploadWebhostButton` was here, and this was the follow-up its entry asked
  // for: the export redesign took its only consumer when the export dialog turned publishing
  // into a destination row, and the component, its `sync.upload_webhost` key in
  // all 15 locales, and its three raw `emerald-*` literals are gone together
  // `GitHubSyncModal` stays — `MainLayoutOverlays` renders it.
]);

const sourceFiles = listSourceFiles(path.join(ROOT, 'src'), {
  extensions: ['.ts', '.tsx'],
  skip: [named('__tests__')],
});

function consumersOf(primitive) {
  // The specifier must end at the primitive's name. A plain substring match
  // counts `@/components/ui/FieldLabel` as a consumer of `Field`.
  const specifier = new RegExp(`@/components/ui/${primitive}(?![A-Za-z0-9_-])`);
  return sourceFiles.filter((file) => {
    if (path.basename(file, path.extname(file)) === primitive) return false;
    return specifier.test(fs.readFileSync(file, 'utf8'));
  });
}

const primitives = fs
  .readdirSync(UI_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
  .map((entry) => path.basename(entry.name, path.extname(entry.name)));

test('no primitive is silently unused', () => {
  const unused = primitives.filter((name) => consumersOf(name).length === 0);
  const unexpected = unused.filter((name) => !KNOWN_UNUSED.has(name));

  assert.deepEqual(
    unexpected,
    [],
    `these primitives have no production consumer and are not on the known list: ${unexpected.join(', ')}`,
  );
});

test('the known-unused list has no stale entries', () => {
  for (const name of KNOWN_UNUSED) {
    const consumers = consumersOf(name);
    assert.equal(
      consumers.length,
      0,
      `${name} is listed as unused but is imported by ${consumers.length} file(s); remove it from KNOWN_UNUSED`,
    );
  }
});
