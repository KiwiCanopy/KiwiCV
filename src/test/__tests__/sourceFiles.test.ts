import { REPO_ROOT, named, sourceFiles } from '@/test/sourceFiles';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(REPO_ROOT, 'src');
const HELPER = 'test/sourceFiles.ts';

describe('sourceFiles', () => {
  it('requires both options, with at least one extension', () => {
    // @ts-expect-error -- `skip` is required: a suite must say what it prunes.
    expect(() => sourceFiles(SRC, { extensions: ['.ts'] })).toThrow(TypeError);
    // @ts-expect-error -- `extensions` is required.
    expect(() => sourceFiles(SRC, { skip: [] })).toThrow(TypeError);
    // @ts-expect-error -- an empty list would walk nothing, and every scan over it would pass.
    expect(() => sourceFiles(SRC, { extensions: [], skip: [] })).toThrow(TypeError);
  });

  it('prunes by repo-relative path and keeps only the named extensions', () => {
    const all = sourceFiles(SRC, { extensions: ['.ts', '.tsx'], skip: [] });
    const pruned = sourceFiles(SRC, { extensions: ['.ts'], skip: [named('__tests__')] });
    expect(all).toContain(join(SRC, 'test/__tests__/sourceFiles.test.ts'));
    expect(pruned).not.toContain(join(SRC, 'test/__tests__/sourceFiles.test.ts'));
    expect(pruned.every((file) => file.endsWith('.ts'))).toBe(true);
    expect(pruned).toContain(join(SRC, HELPER));
  });

  // Enumerated with the built-in recursion, not the helper, so a broken helper cannot empty it
  // — which makes this file the one other recursive listing. Needles are split so it is not a hit.
  it('is the only recursive walk under src', () => {
    const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' }).filter((file) =>
      /\.tsx?$/.test(file),
    );
    expect(files.length).toBeGreaterThan(100);
    const WALK = [
      // A hand-rolled walk: list a directory, then branch on what is a directory.
      (source: string) =>
        source.includes('readdir' + 'Sync(') && source.includes('isDirectory' + '()'),
      // The built-in recursions (a recursive `mkdirSync` is not a listing).
      (source: string) => new RegExp('readdir' + 'Sync\\([^)]*recursive:\\s*true').test(source),
      (source: string) => source.includes('glob' + 'Sync('),
    ];
    const walks = files.filter((file) => {
      const source = readFileSync(join(SRC, file), 'utf8');
      return WALK.some((matches) => matches(source));
    });
    expect(walks).toEqual([HELPER, 'test/__tests__/sourceFiles.test.ts']);
  });
});
