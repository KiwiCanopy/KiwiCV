import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { ALL_THEME_IDS } from '@/components/preview/themeIds';
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * **Every `previewImage` resolves to a file that is actually shipped, and every
 * shipped file is claimed by a theme.**
 *
 * `ThemeMiniature.tsx` renders `theme.previewImage` as a bare `src`, so the only
 * symptom of a wrong path is a broken image in the theme picker — no error, no
 * console warning, nothing a type checker or a render test can see.
 *
 * ⚠️ **This is the half worth having, and it genuinely
 * is one or the other.** `ThemeRegistryMap` binds `id`, `nameKey` and
 * `layout` to `K`, and binding `previewImage` as
 * `` `/images/previews/${K}.png` `` would make a *typo* `TS2322` at the registry
 * for free. But `previewImage` is a path to a file on disk, not an identity, and
 * pinning the string proves nothing about the file — while asserting the file
 * catches the typo too, because a typo'd path does not exist either. It also
 * catches the likelier failure by a distance: a thirteenth theme registered
 * before anyone exports its PNG.
 *
 * Both directions, because only one of them is obvious: a missing file is a
 * broken picker, and an *unclaimed* file is a rename that left its predecessor
 * behind, which nothing else in the repo would ever mention again.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const SELF = fileURLToPath(import.meta.url);
const REPO = resolve(dirname(SELF), '..', '..', '..', '..');
const PUBLIC = join(REPO, 'public');
const PREVIEWS = join(PUBLIC, 'images', 'previews');

/**
 * `public/` is served at the root, so a `previewImage` of `/images/previews/x.png`
 * is `public/images/previews/x.png` on disk and in `dist/`.
 */
const onDisk = (previewImage: string): string => join(PUBLIC, previewImage);

describe('theme preview images', () => {
  it.each(ALL_THEME_IDS)('%s ships the file its previewImage names', (themeId) => {
    const { previewImage } = ThemeRegistry[themeId];
    const file = onDisk(previewImage);

    expect({ previewImage, exists: existsSync(file) && statSync(file).isFile() }).toEqual({
      previewImage,
      exists: true,
    });
  });

  /**
   * ⚠️ **`git ls-files`, not `readdirSync` — the working tree is not the
   * shipped set, and the first version of this file used it.** The review pass
   * broke it in one move: point lunar at `lunar-new.png`, `cp` the file into
   * place without adding it, `git rm --cached` the old one. Both assertions
   * green, the pre-push hook green, and a fresh clone has no file — the exact
   * broken-picker symptom this file names, straight past the guard written for
   * it. Asking git closes it and drops the `.DS_Store` false positive for free.
   */
  it('leaves no tracked preview file unclaimed, and claims nothing untracked', () => {
    const tracked = execFileSync('git', ['ls-files', '--', 'public/images/previews'], {
      cwd: REPO,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
      .map((path) => path.split('/').pop()!)
      .sort();

    const claimed = ALL_THEME_IDS.map((themeId) => ThemeRegistry[themeId].previewImage)
      .map((previewImage) => previewImage.split('/').pop()!)
      .sort();

    expect(tracked).toEqual(claimed);
  });

  /**
   * The positive control. Both assertions above are satisfied by a resolver that
   * has stopped pointing at the real directory — `readdirSync` would throw, but
   * `existsSync` would simply answer `false` for everything, and a green run
   * proves the path arithmetic only if a wrong path is seen to fail.
   */
  it('would notice a path that is not shipped', () => {
    expect(existsSync(onDisk('/images/previews/no-such-theme.png'))).toBe(false);
    expect(existsSync(PREVIEWS)).toBe(true);
  });
});
