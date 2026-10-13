import { named, sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * `src/utils/visibility.ts` is the one rule for what the CV shows. A
 * reader that restates the item check inline drifts from it — the drag
 * overlays checked the entry's hash and forgot its section. Only the
 * rule itself and the store's toggles, which write `hiddenIds`, read it raw.
 */
const ALLOWED = new Set(['src/utils/visibility.ts', 'src/store/resume/slices/visibilitySlice.ts']);

/**
 * A raw read of the array: a direct call, through a `||`/`??` default, or as a
 * Set. An alias (`const ids = content.hiddenIds; ids.includes(…)`) is out of a
 * text scan's reach.
 */
const RAW_READ = [
  /hiddenIds[!?]*\.(includes|indexOf|some|find|has)\(/,
  /hiddenIds\s*(\|\||\?\?)[^)]*\)\s*\.(includes|indexOf|some|find)\(/,
  /new Set\([^)]*hiddenIds[^)]*\)\.has\(/,
];

describe('visibility readers', () => {
  it('read hiddenIds only through utils/visibility', () => {
    const files = sourceFiles('src', { extensions: ['.ts', '.tsx'], skip: [named('__tests__')] });
    expect(files.length).toBeGreaterThan(100);

    const offenders = files
      .map((file) => path.relative(process.cwd(), file).split(path.sep).join('/'))
      .filter((file) => !ALLOWED.has(file))
      .filter((file) => RAW_READ.some((pattern) => pattern.test(readFileSync(file, 'utf8'))));
    expect(offenders).toEqual([]);
  });
});
