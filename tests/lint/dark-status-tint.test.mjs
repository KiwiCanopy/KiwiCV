import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { PRODUCT_SOURCE_SKIP, sourceFiles } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'src');

/**
 * In dark, every status tint is the raised surface, not its colour at low alpha.
 * Tailwind cannot carry that from a token, so each resting `bg-<status>/N` states
 * `dark:bg-secondary` beside it (`code/DESIGN_LANGUAGE.md` § "Grüne Haarlinie").
 */
const RESTING_TINT = /(?<![:\w-])bg-(?:success|warning|danger|destructive|info)\/\d+/;

test('every resting status tint takes the raised surface in dark', () => {
  const offenders = sourceFiles(SRC, {
    extensions: ['.ts', '.tsx'],
    skip: PRODUCT_SOURCE_SKIP,
  }).flatMap((file) =>
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((line, index) => ({ line, at: `${path.relative(ROOT, file)}:${index + 1}` }))
      .filter(({ line }) => RESTING_TINT.test(line) && !line.includes('dark:bg-secondary'))
      .map(({ at }) => at),
  );

  assert.deepEqual(
    offenders,
    [],
    `${offenders.length} status tint(s) keep their colour in dark. Add \`dark:bg-secondary\`.`,
  );
});
