import { getIntrinsicSize } from '@/pages/Blog/utils/media';
import { describe, expect, it } from 'vitest';

const SANITY = 'https://cdn.sanity.io/images/k8d0znuy/production';

describe('getIntrinsicSize', () => {
  it('reads the intrinsic size out of a Sanity filename', () => {
    expect(getIntrinsicSize(`${SANITY}/27677dfd-926x997.jpg`)).toEqual({
      width: 926,
      height: 997,
    });
  });

  it('scales the height when ?w= serves a narrower image', () => {
    // 926×997 requested at w=1200 is unchanged — Sanity does not upscale.
    expect(getIntrinsicSize(`${SANITY}/27677dfd-926x997.jpg?w=1200`)).toEqual({
      width: 926,
      height: 997,
    });

    // Narrower request: the ratio has to follow, or the reserved box is wrong
    // and causes the shift the attributes exist to prevent.
    expect(getIntrinsicSize(`${SANITY}/27677dfd-926x997.jpg?w=463`)).toEqual({
      width: 463,
      height: 499,
    });
  });

  it('keeps the aspect ratio within a pixel across widths', () => {
    const source = 1600 / 900;
    for (const w of [1200, 800, 400, 137]) {
      const size = getIntrinsicSize(`${SANITY}/asset-1600x900.png?w=${w}`)!;
      expect(size.width).toBe(w);
      expect(Math.abs(size.width / size.height - source)).toBeLessThan(0.01);
    }
  });

  it('returns null rather than guessing for URLs without the pattern', () => {
    expect(getIntrinsicSize('https://example.com/photo.jpg')).toBeNull();
    expect(getIntrinsicSize('/logos/kiwicv/KiwiCanopy.png')).toBeNull();
    // A dimension-looking segment that is not the filename suffix.
    expect(getIntrinsicSize('https://example.com/12x34/photo.jpg')).toBeNull();
    // Zero is not a usable dimension — it would divide by zero.
    expect(getIntrinsicSize(`${SANITY}/asset-0x100.jpg`)).toBeNull();
  });

  it('survives a malformed URL instead of throwing', () => {
    expect(getIntrinsicSize('::::-100x50.jpg')).toEqual({ width: 100, height: 50 });
  });
});
