import { named, sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * **Every module that reads the stored `meta.theme.name` must resolve it.**
 *
 * A fix collapsed three normalisations of that string onto `resolveThemeId`, and
 * `themeIds.ts` then claimed to be "the one normalisation". That claim was
 * **false when it was written**: the architect pass found two more readers the
 * fix never opened, and one of them was live.
 *
 * - `themes/shared/iconSerializer.ts` compared the **raw** name against four
 *   literals (`'lunar'`, `'javascript'`, `'timeless'`, `'soft'`). A résumé stored
 *   as `'swiss-grid'` renders lunar and matched none of them, so every contact
 *   and profile icon was painted with the caller's fill — `#1a1a2e`, which *is*
 *   lunar's dark sidebar. The icons disappeared. ⚠️ **That fix is what made this
 *   reachable in practice**: before it, the same résumé rendered an empty CV and
 *   nobody got as far as the icons.
 * - Three of twelve theme roots passed the raw name to `resolveHTMLFontStack`
 *   while the other nine passed their own literal id. A résumé stored as
 *   `'Elegant'` rendered the elegant component in Inter — its serif face is the
 *   theme's whole visual identity — while its PDF stayed serif.
 *
 * So routing three functions through one helper did **not** make the invariant
 * hold by construction; it held because three call sites happened to agree, and
 * `themeNameResolution.test.ts` pinned exactly those three by name. This file is
 * the guard for the fourth, scoped by the property rather than by a list of
 * functions: a file that mentions `meta.theme.name` must also mention something
 * that resolves it.
 *
 * ⚠️ **A file-level "mentions" test, deliberately** — the mention-is-not-a-call
 * rule (`.claude/rules/testing.md`). A regex keyed on a call shape is defeated
 * by an alias, a nested call, a spread or a plain literal, and a file that
 * produces no match is indistinguishable from a file that does not call the
 * function at all. Mentioning the symbol survives
 * every spelling, because an alias still leaves it in the `import`.
 *
 * ## What it does not cover, stated rather than implied
 *
 * - A file that resolves the name **somewhere** and reads it raw somewhere else
 *   passes. That is the price of a file-level rule; the behavioural pins in
 *   `themeNameResolution.test.ts` cover the readers that exist.
 * - It says nothing about *which* resolver is right for a given read.
 * - It cannot see a name read through a variable passed in from another module.
 */

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

/**
 * Anything that turns a stored name into a real theme. `getThemeMeta`,
 * `isTwoColumnTheme` and the two default-layout getters are all one expression
 * over `resolveThemeId`, so mentioning any of them is resolving.
 */
const RESOLVERS = [
  'resolveThemeId',
  'getThemeMeta',
  'isThemeId',
  'isTwoColumnTheme',
  'isTwoColumnLayout',
  'getDefaultTwoColumnLayout',
  'getDefaultOneColumnLayout',
];

/** `meta.theme.name`, but not `theme.nameKey` — a different field on `ThemeMeta`. */
const READS_THEME_NAME = /theme\??\.name(?![A-Za-z])/;

/** Block comments become their own newlines so reported lines stay navigable. */
const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ''))
    .replace(/\/\/[^\n]*/g, '');

interface Reader {
  file: string;
  lines: number[];
  resolves: boolean;
}

function scan(): Reader[] {
  const out: Reader[] = [];
  for (const full of sourceFiles(SRC, {
    extensions: ['.ts', '.tsx'],
    skip: [named('__tests__'), /\.test\.[^/]*$/],
  })) {
    const source = stripComments(readFileSync(full, 'utf8'));
    const lines = source
      .split('\n')
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => READS_THEME_NAME.test(line))
      .map(({ index }) => index + 1);
    if (!lines.length) continue;
    out.push({
      file: relative(ROOT, full),
      lines,
      resolves: RESOLVERS.some((name) => source.includes(name)),
    });
  }
  return out;
}

const READERS = scan();

/**
 * ⚠️ **A baseline of files where the raw string is the point, not a bug** — and
 * each is a *label*, never a lookup. A theme id used as filename text, as an
 * analytics dimension, or as the before/after of a theme change is not asking
 * "which theme renders this", which is the question `resolveThemeId` answers.
 *
 * Asserted with `toEqual`, so it fails in both directions: a new unresolved
 * reader fails, and so does a stale entry once one of these starts resolving.
 *
 * ⚠️ Do not add a file here to make a failure go away. A new entry means a
 * module is deciding something about the theme from a string the app may not
 * have written.
 */
const LABEL_ONLY_READERS = [
  // `{theme}` token in the export filename pattern — user-facing text.
  'src/utils/filename.ts',
  // The same token, applied to the backup filename.
  'src/components/modals/export/ExportModalBody.tsx',
  // Analytics dimension: the stored value is what we want to know about.
  'src/features/dashboard/design/helpers/ColorPicker.tsx',
  'src/hooks/usePdfSync.ts',
  // Theme-change bookkeeping: compares the outgoing stored name with the
  // incoming one to decide whether a layout migration is needed. Both sides are
  // written by the app, and resolving them would erase the difference it exists
  // to detect.
  'src/store/resume/slices/dataSlice.ts',
  // Test fixture builders — assign the name, never interpret it.
  //
  // ⚠️ `singleItemResume.ts` used to resolve and now does not, which is a
  // *relocation* rather than a weakening. All three fixtures hand
  // `themeId` to `test/fixtureLayout.ts`, which mentions `isTwoColumnTheme` and
  // both default-layout getters and so still trips the resolver check where the
  // decision is actually made. Extracting that block is what put the first two
  // files here; it is also what stopped there being three hand-copied chances
  // to omit the two-column normalisation.
  'src/test/placeholderResume.ts',
  'src/test/realExportResume.ts',
  'src/test/singleItemResume.ts',
].sort();

describe('every module that reads meta.theme.name resolves it', () => {
  it('finds readers at all — the control for the assertion below', () => {
    expect(READERS.length).toBeGreaterThan(15);
    expect(READERS.some((r) => r.file === 'src/components/preview/themes/shared/layout.ts')).toBe(
      true,
    );
  });

  it('leaves exactly the label-only files unresolved', () => {
    const unresolved = READERS.filter((r) => !r.resolves)
      .map((r) => r.file)
      .sort();

    expect(unresolved).toEqual(LABEL_ONLY_READERS);
  });

  /**
   * The two the architect pass caught, pinned by name so a revert is loud rather
   * than merely counted. `iconSerializer` is the one that was live.
   */
  it.each([
    'src/components/preview/themes/shared/iconSerializer.ts',
    'src/components/preview/themes/twoColumn/lunar/LunarHTML.tsx',
    'src/components/preview/themes/oneColumn/elegant/ElegantHTML.tsx',
    'src/components/preview/themes/oneColumn/plain2/Plain2HTML.tsx',
  ])('%s resolves the name or does not read it', (file) => {
    const reader = READERS.find((r) => r.file === file);
    if (reader) expect(reader.resolves).toBe(true);
    else expect(READERS.map((r) => r.file)).not.toContain(file);
  });
});
