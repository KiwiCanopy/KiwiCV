import { buildExportArtifacts } from '@/hooks/export/buildExportArtifacts';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { constructBackupFilename, getCleanProjectName } from '@/utils/export';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `buildExportArtifacts` is the single acquisition point for an export package.
 * Its whole reason to exist is that the PDF compile, the HTML render and the
 * JSON serialization used to live in three places behind one Typst worker — so
 * the interesting assertions are about *how often* each dependency is called,
 * not about their output.
 */

const compileTypstPdf = vi.fn(async () => new Uint8Array([1, 2, 3]));
vi.mock('@/hooks/useTypst', () => ({
  compileTypstPdf: (...args: unknown[]) => compileTypstPdf(...(args as [])),
}));

const generateThemedHTML = vi.fn(async () => '<html></html>');
vi.mock('@/utils/html-generator', () => ({
  generateThemedHTML: (...args: unknown[]) => generateThemedHTML(...(args as [])),
}));

const serializers: Record<string, ((resume: ResumeData) => string) | undefined> = {
  default: () => '#let x = 1',
};
vi.mock('@/components/preview/ThemeSerializers', () => ({
  get SERIALIZERS() {
    return serializers;
  },
}));

vi.mock('@/components/preview/ThemeRegistry', () => ({
  getThemeMeta: (name: string) => ({ id: name, layout: 'single-column' }),
  paletteIconFills: () => ({}),
}));

// The icon serializer is deliberately left real: mocking it would name
// `serializeIconsMap` in this file, and `iconFillIsShared.test.ts` pins the set
// of files that mention it.
vi.mock('@/utils/placeholder-fallback', () => ({
  enrichResumeWithPlaceholders: (resume: ResumeData) => resume,
}));

function resumeWithTheme(themeName: string): ResumeData {
  return {
    ...initialResumeState,
    meta: {
      ...initialResumeState.meta,
      theme: { ...initialResumeState.meta.theme, name: themeName },
    },
  } as ResumeData;
}

describe('buildExportArtifacts', () => {
  beforeEach(() => {
    compileTypstPdf.mockClear();
    generateThemedHTML.mockClear();
  });

  it('builds the PDF, the HTML and the snapshot exactly once', async () => {
    const artifacts = await buildExportArtifacts({ resume: resumeWithTheme('default') });

    expect(compileTypstPdf).toHaveBeenCalledTimes(1);
    expect(generateThemedHTML).toHaveBeenCalledTimes(1);
    expect(artifacts.pdf).not.toBeNull();
    expect(artifacts.html).toBe('<html></html>');
    expect(JSON.parse(artifacts.json).meta.theme.name).toBe('default');
  });

  it('writes pass-through blocks at the top level of the snapshot', async () => {
    const resume = { ...resumeWithTheme('default'), passthrough: { kiwitalents: { a: 1 } } };
    const json = JSON.parse((await buildExportArtifacts({ resume })).json);

    expect(json.kiwitalents).toEqual({ a: 1 });
    expect(json).not.toHaveProperty('passthrough');
  });

  it('throws when the active theme has no Typst serializer', async () => {
    await expect(buildExportArtifacts({ resume: resumeWithTheme('nonexistent') })).rejects.toThrow(
      /Serializer not found/,
    );
  });

  it('omits the PDF, and never compiles, when the format is switched off', async () => {
    const artifacts = await buildExportArtifacts({
      resume: resumeWithTheme('default'),
      formats: { pdf: false },
    });

    expect(artifacts.pdf).toBeNull();
    expect(compileTypstPdf).not.toHaveBeenCalled();
  });

  it('omits the HTML, and never renders, when the format is switched off', async () => {
    const artifacts = await buildExportArtifacts({
      resume: resumeWithTheme('default'),
      formats: { html: false },
    });

    expect(artifacts.html).toBeNull();
    expect(generateThemedHTML).not.toHaveBeenCalled();
  });

  it('names the folder the way every destination already names it', async () => {
    const projectName = constructBackupFilename('Ada_Lovelace', 'Figma', 'Product_Designer');
    const artifacts = await buildExportArtifacts({
      resume: resumeWithTheme('default'),
      projectName,
    });

    expect(artifacts.backupFileName).toBe(projectName);
    expect(artifacts.folderName).toBe(getCleanProjectName(projectName));
    // The folder name is what the HTML document is titled with, so the ZIP, the
    // Drive folder and the repo folder all carry the same string.
    expect(generateThemedHTML).toHaveBeenCalledWith(expect.anything(), artifacts.folderName);
  });

  // The compiler receives the photo only while it is shown; one store,
  // `basics:image` in `hiddenIds`.
  it('hands the compiler no photo while the photo is hidden', async () => {
    const resume = resumeWithTheme('default');
    resume.basics = { ...resume.basics, name: 'Ada', image: 'data:image/png;base64,AAAA' };
    const withHidden = (hiddenIds: string[]) => ({
      ...resume,
      meta: { ...resume.meta, content: { ...resume.meta.content, hiddenIds } },
    });

    await buildExportArtifacts({ resume: withHidden(['basics:image']) });
    expect((compileTypstPdf.mock.lastCall as unknown[] | undefined)?.[2]).toBeUndefined();

    await buildExportArtifacts({ resume: withHidden([]) });
    expect((compileTypstPdf.mock.lastCall as unknown[] | undefined)?.[2]).toBe(
      'data:image/png;base64,AAAA',
    );
  });
});
