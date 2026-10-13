import { readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The one recursive walk every source scan shares — vitest's and, imported as
 * `.ts` under Node's type stripping, `tests/lint/`'s. Both options
 * are required: a scan that silently walks less still passes. No `@/` imports
 * here; `node --test` cannot resolve them.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
export const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');

/** A `skip` pattern that prunes every directory (or file) with exactly this name. */
export const named = (name: string): RegExp => {
  if (!/^[\w-]+$/.test(name)) throw new TypeError(`named() takes a plain name, got ${name}`);
  return new RegExp(`(^|/)${name}$`);
};

/**
 * What a scan of shipped product code prunes: tests, mocks, locales, build
 * output and `src/test/` itself, by anchored path so a colocated
 * `x.test.ts` is caught and `src/features/x/test/` is not exempted by name.
 */
export const PRODUCT_SOURCE_SKIP: readonly RegExp[] = [
  /(^|\/)(locales|__tests__|__mocks__|node_modules|dist)(\/|$)|^src\/test(\/|$)/,
  /\.(test|spec|d)\.tsx?$/,
];

export interface SourceFileOptions {
  /** Matched against the end of each file name. Non-empty: `[]` would walk nothing, and pass. */
  readonly extensions: readonly [string, ...string[]];
  /** Tested against each entry's repo-relative POSIX path, file or directory; a match prunes it. */
  readonly skip: readonly RegExp[];
}

/**
 * Every file under `dir` whose name ends in one of `extensions`, spelled as
 * `join(dir, …)` — absolute when `dir` is. A symlinked directory is not
 * descended.
 */
export function sourceFiles(dir: string, { extensions, skip }: SourceFileOptions): string[] {
  if (!Array.isArray(extensions) || extensions.length === 0 || !Array.isArray(skip)) {
    throw new TypeError('sourceFiles needs explicit `extensions` (non-empty) and `skip` arrays.');
  }
  const walk = (current: string): string[] =>
    readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
      const full = join(current, entry.name);
      const repoPath = relative(REPO_ROOT, resolve(full)).split(sep).join('/');
      if (skip.some((pattern) => pattern.test(repoPath))) return [];
      if (entry.isDirectory()) return walk(full);
      return extensions.some((extension) => entry.name.endsWith(extension)) ? [full] : [];
    });
  return walk(dir);
}
