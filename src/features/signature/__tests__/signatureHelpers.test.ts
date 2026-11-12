import { SIGNATURE_FACES } from '@/components/preview/themes/shared/signature';
import {
  decodeCoverage,
  faceCovers,
  loadSignatureCoverage,
} from '@/features/signature/signatureFonts';
import { fitScale, keyOutPaper } from '@/features/signature/signatureImage';
import { parseStoredSignature } from '@/store/signature/useSignatureStore';
import { describe, expect, it } from 'vitest';

const rgba = (pixels: number[][]) => new Uint8ClampedArray(pixels.flat());

describe('keyOutPaper', () => {
  it('turns paper transparent, keeps ink, and boxes what remains', () => {
    // 4 × 1: paper, ink, paper, half-tone edge.
    const data = rgba([
      [250, 250, 250, 255],
      [20, 20, 20, 255],
      [255, 255, 255, 255],
      [190, 190, 190, 255],
    ]);
    const box = keyOutPaper(data, 4, 1);

    expect([data[3], data[7], data[11]]).toEqual([0, 255, 0]);
    expect(data[15]).toBeGreaterThan(0);
    expect(data[15]).toBeLessThan(255);
    expect(box).toEqual({ x: 0, y: 0, width: 4, height: 1 });
  });

  it('returns null for blank paper, so an empty upload is refused', () => {
    expect(keyOutPaper(rgba([[255, 255, 255, 255]]), 1, 1)).toBeNull();
  });

  it('keeps transparent pixels transparent, however dark their colour', () => {
    const data = rgba([[0, 0, 0, 0]]);
    expect(keyOutPaper(data, 1, 1)).toBeNull();
  });
});

describe('fitScale', () => {
  it('shrinks to fit and never enlarges', () => {
    expect(fitScale(1800, 300, 900, 300)).toBe(0.5);
    expect(fitScale(100, 50, 900, 300)).toBe(1);
  });
});

describe('glyph coverage', () => {
  it('decodes Typst run-length coverage: gaps and runs alternate from U+0000', () => {
    expect([...decodeCoverage([65, 3, 2, 1])]).toEqual([65, 66, 67, 70]);
  });

  it('per face, from the same tables Typst uses', async () => {
    const coverage = await loadSignatureCoverage();
    expect([...coverage.keys()].sort()).toEqual(SIGNATURE_FACES.map((face) => face.id).sort());

    // Both halves: a covered name passes, and a face missing a letter fails.
    expect(faceCovers(coverage.get('herr-von-muellerhoff'), 'Jane Doe')).toBe(true);
    expect(faceCovers(coverage.get('herr-von-muellerhoff'), 'Wiśniewska')).toBe(false);
    expect(faceCovers(coverage.get('great-vibes'), 'Олена Коваль')).toBe(true);
    expect(faceCovers(coverage.get('alex-brush'), 'Олена Коваль')).toBe(false);
    expect(faceCovers(undefined, 'Jane')).toBe(false);
  });
});

describe('parseStoredSignature', () => {
  it('keeps a valid image and a valid typed signature', () => {
    expect(
      parseStoredSignature({
        kind: 'image',
        id: 'a1',
        dataUrl: 'data:image/png;base64,AAAA',
        source: 'draw',
      }),
    ).toEqual({ kind: 'image', id: 'a1', dataUrl: 'data:image/png;base64,AAAA', source: 'draw' });
    expect(
      parseStoredSignature({ kind: 'typed', id: 'a1', faceId: 'great-vibes', text: ' Jane ' }),
    ).toEqual({ kind: 'typed', id: 'a1', faceId: 'great-vibes', text: 'Jane' });
  });

  it.each([
    ['a non-PNG image', { kind: 'image', id: 'a1', dataUrl: 'data:image/svg+xml;base64,AA' }],
    ['an unknown face', { kind: 'typed', id: 'a1', faceId: 'comic-sans', text: 'Jane' }],
    ['blank text', { kind: 'typed', id: 'a1', faceId: 'great-vibes', text: '  ' }],
    // The id names a virtual file path inside the compile.
    ['a path in the id', { kind: 'image', id: '../x', dataUrl: 'data:image/png;base64,AA' }],
    ['nothing', null],
  ])('drops %s', (_label, value) => {
    expect(parseStoredSignature(value)).toBeNull();
  });
});
