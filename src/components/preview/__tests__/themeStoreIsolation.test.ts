import { sourceFiles } from '@/test/sourceFiles';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * No file under `themes/` may depend on global résumé state, **however it
 * reaches it**. The forward guard for the site written tomorrow; the sites that
 * exist today are covered behaviourally in `addressSchemaFallback.test.tsx`
 * (the render-then-scan rule, `.claude/rules/testing.md`).
 *
 * ⚠️ **This file imports nothing from the application, and that is load-bearing,
 * not tidiness.** The scan started life inside `addressSchemaFallback.test.tsx`,
 * which imports `ThemeRegistry`. Mutating a theme file to `import { useTranslation }
 * from '@/hooks/useTranslation'` — one of the very defeats the scan exists to
 * catch — pulled `useUIStore` into the module graph, which touches `localStorage`
 * at import time under the node environment and **took the whole file down before
 * a single test ran**. Loud, but the wrong failure, and the assertion that was
 * supposed to name the offender never executed. A scan must not be able to be
 * killed by the code it scans.
 *
 * ⚠️ **The first version was defeated three ways, each found independently by a
 * reviewer, and all three are the same mistake in a new costume — scoping by a
 * spelling instead of by the property.** It matched `@/store/` on comment-stripped
 * source, and stayed green while a theme file:
 *
 * 1. imported `'../../../../../store/resume/useResumeStore'`. AGENTS.md §7 bans
 *    relative paths in **prose only**: `eslint.config.js`'s `no-restricted-imports`
 *    is a `paths` list with no `patterns`, so nothing enforced the alias. Both
 *    spellings are matched now.
 * 2. imported `@/hooks/useTranslation`, which imports the store itself and returns
 *    a `cvLocale`. That reintroduces **both** halves of the store leak at once — the store's
 *    résumé picks the locale, and `addressSchema` is permanently `default`. Zero
 *    theme files use it today, so forbidding it costs nothing.
 * 3. imported a one-hop helper elsewhere in `src` that imports the store. The walk
 *    is rooted at `themes/`, so it now also reads every `@/`-aliased module a theme
 *    file imports, one hop out.
 *
 * ⚠️ Comments are stripped first, in both directions. `address.ts`'s own doc block
 * names `useResumeStore.getState()` as the thing it stopped doing, and a raw text
 * scan flagged the file that documents the fix. Prose must be able neither to fail
 * this test nor to pass it.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const THEMES_DIR = join(SRC_DIR, 'components/preview/themes');

/** `@/store/…`, any number of `../` hops into a `store/`, or the store-backed hook. */
const FORBIDDEN = /@\/store\/|(?:\.\.?\/)+store\/|@\/hooks\/useTranslation/;

const walk = (dir: string): string[] => sourceFiles(dir, { extensions: ['.ts', '.tsx'], skip: [] });

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

/** Every `@/`-aliased module a theme file imports that is not itself a theme file. */
const oneHopImports = (sources: string[]): string[] => {
  const hopped = new Set<string>();
  for (const source of sources) {
    for (const match of source.matchAll(/from '@\/([^']+)'/g)) {
      if (match[1].startsWith('components/preview/themes/')) continue;
      for (const extension of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
        const candidate = join(SRC_DIR, match[1] + extension);
        if (existsSync(candidate)) {
          hopped.add(candidate);
          break;
        }
      }
    }
  }
  return [...hopped];
};

describe('theme rendering is isolated from the global résumé store', () => {
  const themeFiles = walk(THEMES_DIR);
  const themeSources = themeFiles.map((path) => stripComments(readFileSync(path, 'utf8')));
  const hopped = oneHopImports(themeSources);

  /**
   * ⚠️ The anti-vacuity pins, and there are three because the walk has three ways
   * to silently see nothing: a wrong root, a glob matching no extension, and a
   * one-hop closure that resolves no module. A scan that opened nothing would
   * report zero offenders forever at full green.
   */
  it('actually opened the tree it claims to scan', () => {
    expect(themeFiles.length).toBeGreaterThan(100);
    expect(
      themeFiles.filter((path) => readFileSync(path, 'utf8').includes('formatFullAddress')).length,
    ).toBeGreaterThanOrEqual(26);
    expect(hopped.length).toBeGreaterThan(5);
  });

  /** The control for the matcher itself, since the corpus is expected to be empty. */
  it('recognises every forbidden spelling', () => {
    expect(FORBIDDEN.test("import { x } from '@/store/resume/useResumeStore';")).toBe(true);
    expect(FORBIDDEN.test("import { x } from '../../../store/resume/useResumeStore';")).toBe(true);
    expect(FORBIDDEN.test("import { x } from './store/resume/useResumeStore';")).toBe(true);
    expect(FORBIDDEN.test("import { useTranslation } from '@/hooks/useTranslation';")).toBe(true);
    expect(
      FORBIDDEN.test("import { getVisibleData } from '@/components/preview/themes/shared';"),
    ).toBe(false);
  });

  it('has no theme file, and no module a theme file imports, reaching the store', () => {
    const offenders = [
      ...themeFiles.filter((_, index) => FORBIDDEN.test(themeSources[index])),
      ...hopped.filter((path) => FORBIDDEN.test(stripComments(readFileSync(path, 'utf8')))),
    ].map((path) => path.slice(SRC_DIR.length + 1));

    expect(offenders).toEqual([]);
  });
});
