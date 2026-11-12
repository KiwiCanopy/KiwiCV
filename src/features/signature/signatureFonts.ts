import {
  SIGNATURE_FACES,
  type SignatureFace,
  type SignatureFaceId,
} from '@/components/preview/themes/shared/signature';

/**
 * Glyph coverage per signature face, decoded from the coverage tables Typst
 * uses (`lazy-font-info.json`), so the dialog and the PDF agree on which
 * letters a face has. Loaded on demand: the file also carries the CJK tables.
 */
let coveragePromise: Promise<Map<SignatureFaceId, Set<number>>> | null = null;

/** Typst's run-length coverage: alternating gap and run lengths from U+0000. */
export function decodeCoverage(runs: readonly number[]): Set<number> {
  const codepoints = new Set<number>();
  let cursor = 0;
  runs.forEach((length, index) => {
    if (index % 2 === 1) for (let i = 0; i < length; i++) codepoints.add(cursor + i);
    cursor += length;
  });
  return codepoints;
}

export function loadSignatureCoverage(): Promise<Map<SignatureFaceId, Set<number>>> {
  coveragePromise ??= import('@/workers/lazy-font-info.json')
    .then(({ default: info }) => {
      const coverage = new Map<SignatureFaceId, Set<number>>();
      for (const face of SIGNATURE_FACES) {
        const entry = info.fonts.find((font) => font.file === face.file);
        const runs = entry?.info.info[0]?.coverage;
        if (runs) coverage.set(face.id, decodeCoverage(runs));
      }
      return coverage;
    })
    .catch((error: unknown) => {
      coveragePromise = null;
      throw error;
    });
  return coveragePromise;
}

/** Whether the face has every non-space character of `text`. */
export function faceCovers(coverage: Set<number> | undefined, text: string): boolean {
  if (!coverage) return false;
  for (const char of text) {
    if (/\s/.test(char)) continue;
    if (!coverage.has(char.codePointAt(0)!)) return false;
  }
  return true;
}

const loadedFaces = new Map<SignatureFaceId, Promise<void>>();

/** Registers the face for CSS from the same self-hosted file the PDF uses. */
export function loadSignatureFace(face: SignatureFace): Promise<void> {
  // No FontFace API (jsdom, very old engines): the sample falls back to cursive.
  if (typeof FontFace === 'undefined') return Promise.resolve();
  let promise = loadedFaces.get(face.id);
  if (!promise) {
    const fontFace = new FontFace(face.family, `url(/fonts/${face.file})`);
    promise = fontFace.load().then(
      (loaded) => {
        document.fonts.add(loaded);
      },
      (error: unknown) => {
        loadedFaces.delete(face.id);
        throw error;
      },
    );
    loadedFaces.set(face.id, promise);
  }
  return promise;
}
