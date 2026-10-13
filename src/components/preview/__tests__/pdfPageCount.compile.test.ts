import { paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { buildPlaceholderResume } from '@/test/placeholderResume';
import {
  TYPST_INIT_TIMEOUT_MS,
  compileToPdf,
  initTypstCompiler,
  isPdf,
  mapIcons,
  mapProfileImage,
} from '@/test/typstCompile';
import { readPdfPageCount } from '@/utils/pdf-page-count';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * **The guard that matters for the page-count chip.**
 *
 * `readPdfPageCount` reads a byte format nobody promised us: Typst 0.14.2 writes
 * an uncompressed page tree as the first object, and a regex over the header
 * finds it. `pdfPageCount.test.ts` pins the parser against hand-written bytes,
 * which is exactly the test that stays green forever while the real compiler
 * moves underneath it — a Typst upgrade to object streams would leave the parser
 * correct and the feature dead.
 *
 * So this compiles a real fixture through the **same WASM the app ships** and
 * cross-checks the parsed count against the page tree's own `/Kids` length,
 * which is an independent reading of the same document.
 *
 * ⚠️ A silent `null` is a failure here even though it is the correct *runtime*
 * behaviour. Rendering nothing is the right thing for a user; discovering that
 * the chip has quietly stopped working is the right thing for this suite.
 */

const THEME_ID = 'lunar';

const countKids = (bytes: Uint8Array): number => {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 8192));
  const pagesObject = head.split(/\bendobj\b/).find((object) => /\/Type\s*\/Pages\b/.test(object));

  expect(pagesObject, 'the compiled PDF has no uncompressed /Type /Pages object').toBeTruthy();

  const kids = /\/Kids\s*\[([^\]]*)\]/.exec(pagesObject as string);

  expect(kids, 'the page tree carries no /Kids array').toBeTruthy();

  return ((kids as RegExpExecArray)[1].match(/\d+\s+\d+\s+R/g) ?? []).length;
};

describe('the page count survives the real compiler', () => {
  beforeAll(() => initTypstCompiler(), TYPST_INIT_TIMEOUT_MS);

  it('reads a count that matches the page tree of a compiled document', async () => {
    const resume = buildPlaceholderResume(THEME_ID);
    await mapIcons(
      serializeIconsMap(resume, paletteIconFills(THEME_ID, resume.meta.theme.params?.palette)),
    );
    // The fixture sets a photo, and an unmapped one is "failed to load file
    // (access denied)" — a hard compile failure, not a missing picture.
    await mapProfileImage(resume.basics.image);

    const bytes = await compileToPdf(SERIALIZERS[THEME_ID](resume));
    expect(isPdf(bytes)).toBe(true);

    const parsed = readPdfPageCount(bytes);

    expect(
      parsed,
      'readPdfPageCount found no page tree — the Typst PDF layout has changed and the preview chip is now dead',
    ).not.toBeNull();
    expect(parsed).toBe(countKids(bytes));
    expect(parsed).toBeGreaterThan(0);
  }, 60_000);
});
