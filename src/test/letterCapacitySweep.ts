import { paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type LetterFurniture, furnitureBlocks } from '@/components/preview/letterCapacity';
import type { ThemeId } from '@/components/preview/themeIds';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { compileToPdf, mapIcons } from '@/test/typstCompile';
import type { ResumeData } from '@/types/resume';
import { readPdfPageCount } from '@/utils/pdf-page-count';

/**
 * The measuring method behind both capacity tables — `COVER_LETTER_PAGE_WORDS`
 * and `COVER_LETTER_PAGE_CHARS`.
 *
 * ⚠️ **Shared because the two sweeps must not drift.** They live in two files
 * only because `setCompilerInitOptions` is global and the CJK sweep needs the
 * Noto faces — that requires two `beforeAll`s, not two harnesses. Copied
 * helpers would go stale silently: the with-minus-without trick below depends
 * on every serializer emitting the letter as its own `#set page` block, and
 * whoever fixes that in one file would have no compiler reason to touch the
 * other, while the stale copy kept returning plausible numbers.
 */

/**
 * How many pages the cover letter alone takes: the document with the letter
 * minus the same document without it. The serializers emit the letter as its
 * own `#set page` block ahead of the résumé, so the difference is exact.
 */
export async function letterPages(themeId: ThemeId, withLetter: ResumeData): Promise<number> {
  const without = structuredClone(withLetter);
  without.coverLetter.enabled = false;

  await mapIcons(
    serializeIconsMap(withLetter, paletteIconFills(themeId, withLetter.meta.theme.params?.palette)),
  );
  const count = async (data: ResumeData) => {
    const pages = readPdfPageCount(await compileToPdf(SERIALIZERS[themeId](data)));
    if (pages === null) throw new Error(`no page tree read for ${themeId}`);
    return pages;
  };
  return (await count(withLetter)) - (await count(without));
}

/**
 * Largest length (to the nearest `step`) whose letter stays on one page.
 * `build` turns a candidate length into the fixture to render, so the caller
 * owns the unit — words or characters — and this owns the search.
 */
export async function largestOnePage(options: {
  themeId: ThemeId;
  step: number;
  lo: number;
  hi: number;
  build: (length: number) => ResumeData;
}): Promise<number> {
  const { themeId, step, build } = options;
  let { lo, hi } = options;
  while (hi - lo > step) {
    const mid = Math.round((lo + hi) / 2 / step) * step;
    if ((await letterPages(themeId, build(mid))) <= 1) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * The fixture with its address blocks set to one column of the capacity table.
 *
 * ⚠️ Here rather than in either sweep. `buildLetterResume` shows BOTH blocks —
 * that is the `both` column, and the reason the other three had to be measured
 * separately — so every sweep needs this, and two private copies is exactly the
 * drift this module's docstring exists to refuse.
 */
export function withFurniture<T extends ResumeData>(data: T, furniture: LetterFurniture): T {
  data.coverLetter.layout = { ...data.coverLetter.layout, ...furnitureBlocks(furniture) };
  return data;
}
