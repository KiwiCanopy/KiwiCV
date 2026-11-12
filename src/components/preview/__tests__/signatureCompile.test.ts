import { paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS } from '@/components/preview/themeIds';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { NO_SIGNATURE, SIGNATURE_FACES } from '@/components/preview/themes/shared/signature';
import { type StoredSignature, signatureCompileInputs } from '@/store/signature/useSignatureStore';
import { buildPlaceholderResume } from '@/test/placeholderResume';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { REPO_ROOT } from '@/test/sourceFiles';
import {
  TYPST_INIT_TIMEOUT_MS,
  compileToPdf,
  initTypstCompiler,
  isPdf,
  mapIcons,
  mapImages,
  mapProfileImage,
} from '@/test/typstCompile';
import type { ResumeData } from '@/types/resume';
import { readPdfPageCount } from '@/utils/pdf-page-count';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * The device-only signature (#103) in the real compiler: every theme's CV and
 * cover letter, typed in each face and as an image. Markup substrings cannot
 * show either the embedded face or the image, so the PDF bytes are read.
 */
const IMAGE: StoredSignature = {
  kind: 'image',
  id: 'compile-test',
  dataUrl: `data:image/png;base64,${readFileSync(
    resolve(REPO_ROOT, 'src/test/fixtures/signature-sample.png'),
  ).toString('base64')}`,
  source: 'upload',
};

const latin1 = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes);
const postscriptName = (family: string) => `${family.replace(/\s+/g, '')}-Regular`;

async function compile(
  themeId: (typeof ALL_THEME_IDS)[number],
  resume: ResumeData,
  signature: StoredSignature | null,
) {
  await mapIcons(
    serializeIconsMap(resume, paletteIconFills(themeId, resume.meta.theme.params?.palette)),
  );
  await mapProfileImage(resume.basics.image);
  const inputs = signatureCompileInputs(signature);
  await mapImages(inputs.images);
  const markup = SERIALIZERS[themeId](resume, signature ? inputs.ctx : NO_SIGNATURE);
  const pdf = await compileToPdf(markup);
  expect(isPdf(pdf)).toBe(true);
  return { pdf, markup };
}

describe('the signature in the compiled PDF', () => {
  beforeAll(() => initTypstCompiler({ signatureFaces: true }), TYPST_INIT_TIMEOUT_MS);

  it.each(ALL_THEME_IDS)(
    '%s: each face embeds in the CV and the letter footer, and an image draws',
    async (themeId) => {
      const resume = buildSingleItemResume(themeId);
      resume.coverLetter.layout.showFooter = true;

      for (const face of SIGNATURE_FACES) {
        const { pdf, markup } = await compile(themeId, resume, {
          kind: 'typed',
          id: 'compile-test',
          faceId: face.id,
          text: 'Jane Doe',
        });
        // Twice: the fixture's letter is on, so the CV footer and the letter footer.
        expect(markup.split(`font: "${face.family}"`).length - 1).toBe(2);
        expect(latin1(pdf), face.family).toContain(postscriptName(face.family));
      }

      const { pdf } = await compile(themeId, resume, IMAGE);
      expect(latin1(pdf)).toMatch(/\/Subtype\s*\/Image/);
    },
    120_000,
  );

  it('a signature costs no page: the placeholder CV keeps its page count', async () => {
    // Measured once: a signature with a height of its own pushed this CV from
    // one page to two. The mark is placed over the signing gap instead.
    const resume = buildPlaceholderResume('lunar');
    const without = readPdfPageCount((await compile('lunar', resume, null)).pdf);
    const withImage = readPdfPageCount((await compile('lunar', resume, IMAGE)).pdf);
    const typed = readPdfPageCount(
      (
        await compile('lunar', resume, {
          kind: 'typed',
          id: 'compile-test',
          faceId: 'herr-von-muellerhoff',
          text: 'Max Mustermann',
        })
      ).pdf,
    );
    expect([withImage, typed]).toEqual([without, without]);
  }, 60_000);

  it('no signature leaves no trace in the markup', async () => {
    const { markup } = await compile('elegant', buildSingleItemResume('elegant'), null);
    expect(markup).not.toContain('/signature/');
    for (const face of SIGNATURE_FACES) expect(markup).not.toContain(face.family);
  });
});
