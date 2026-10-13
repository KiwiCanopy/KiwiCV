import { TYPST_CV_UPPER } from '@/components/preview/themes/shared/typstUtils';
import { named, sourceFiles } from '@/test/sourceFiles';
import { TYPST_INIT_TIMEOUT_MS, compileToPdf, initTypstCompiler, isPdf } from '@/test/typstCompile';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Typst's `upper` is not locale-aware — measured 2026-10-06: under
 * `lang: "tr"`, `upper("i")` is `I` — so every theme uppercases through
 * `cv-upper`. Both branches are asserted inside Typst: a failed
 * `assert.eq` fails the compile.
 */
describe('cv-upper', () => {
  beforeAll(() => initTypstCompiler(), TYPST_INIT_TIMEOUT_MS);

  it('uppercases a dotted i to İ in Turkish and Azerbaijani only', async () => {
    const markup = `${TYPST_CV_UPPER}
#assert.eq(cv-upper-str("eğitim, iletişim", "tr"), "EĞİTİM, İLETİŞİM")
#assert.eq(cv-upper-str("ılık", "tr"), "ILIK")
#assert.eq(cv-upper-str("bilgi", "az"), "BİLGİ")
#assert.eq(cv-upper-str("bildung", "de"), "BILDUNG")
#set text(lang: "tr")
#cv-upper("eğitim") #cv-upper([*iletişim*])
`;
    expect(isPdf(await compileToPdf(markup))).toBe(true);
  }, 60000);

  // Content — a name, a bolded title — takes the show-rule branch. Each İ the
  // page ends up with is counted, so a branch that drops the dot fails.
  const dottedCapitals = (call: string) =>
    compileToPdf(`${TYPST_CV_UPPER}
#set text(lang: "tr")
#let dotted = counter("dotted")
#show "İ": it => { dotted.step(); it }
${call}
#context assert.eq(dotted.final().first(), 3)
`);

  it('uppercases content the Turkish way too', async () => {
    expect(isPdf(await dottedCapitals('#cv-upper[*iletişim*]'))).toBe(true);
    await expect(dottedCapitals('#upper[*iletişim*]')).rejects.toThrow();
  }, 60000);

  it('the assertion harness fails a compile when an assertion does not hold', async () => {
    await expect(
      compileToPdf(`${TYPST_CV_UPPER}\n#assert.eq(upper("i"), "İ")\nx`),
    ).rejects.toThrow();
  }, 60000);

  it('no theme serializer calls upper directly', async () => {
    const { readFileSync } = await import('node:fs');
    const files = sourceFiles('src/components/preview/themes', {
      extensions: ['.ts'],
      skip: [named('__tests__')],
    }).filter((file) => !file.endsWith('typstUtils.ts'));
    expect(files.length).toBeGreaterThan(10);
    // Both call forms: `upper(x)` and the content form `#upper[x]`.
    const DIRECT_UPPER = /(?<![-\w])upper\s*[[(]/;
    expect(['#upper[x]', 'upper(x)', '[#upper(t)]'].every((call) => DIRECT_UPPER.test(call))).toBe(
      true,
    );
    expect(DIRECT_UPPER.test('#cv-upper[x]')).toBe(false);

    const offenders = files.filter((file) => DIRECT_UPPER.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });

  // `cv-upper` reads `text.lang`: a theme that never sets it stays English (Misty did).
  it('every theme serializer sets the document language', async () => {
    const { readFileSync } = await import('node:fs');
    const serializers = sourceFiles('src/components/preview/themes', {
      extensions: ['Serializer.ts'],
      skip: [],
    }).filter((file) => !file.endsWith('iconSerializer.ts'));
    expect(serializers.length).toBeGreaterThan(10);
    expect(
      serializers.filter(
        (file) => !readFileSync(file, 'utf8').includes('lang: "${cvLocale.code}"'),
      ),
    ).toEqual([]);
  });
});
