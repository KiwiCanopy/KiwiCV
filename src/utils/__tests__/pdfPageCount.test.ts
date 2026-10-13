import { readPdfPageCount } from '@/utils/pdf-page-count';
import { describe, expect, it } from 'vitest';

const bytes = (text: string) => new TextEncoder().encode(text);

const pdf = (body: string) => bytes(`%PDF-1.7\n${body}\n%%EOF\n`);

describe('readPdfPageCount', () => {
  it('reads the page tree count', () => {
    expect(
      readPdfPageCount(
        pdf(
          '1 0 obj\n<<\n  /Type /Pages\n  /Count 3\n  /Kids [197 0 R 234 0 R 246 0 R]\n>>\nendobj',
        ),
      ),
    ).toBe(3);
  });

  it('reads a single page', () => {
    expect(
      readPdfPageCount(pdf('1 0 obj\n<<\n  /Type /Pages\n  /Count 1\n  /Kids [9 0 R]\n>>\nendobj')),
    ).toBe(1);
  });

  /**
   * ⚠️ The case a bare `/Count` scan gets wrong, and the reason this is anchored
   * on `/Type /Pages`. `javascript-real.pdf` carries `/Count 1` under
   * `/Type /Outlines` — one bookmark — ahead of a three-page tree.
   */
  it('ignores the outline count that precedes the page tree', () => {
    expect(
      readPdfPageCount(
        pdf(
          [
            '4 0 obj\n<<\n  /Type /Outlines\n  /Count 1\n>>\nendobj',
            '1 0 obj\n<<\n  /Type /Pages\n  /Count 3\n  /Kids [5 0 R 6 0 R 7 0 R]\n>>\nendobj',
          ].join('\n'),
        ),
      ),
    ).toBe(3);
  });

  it('reads the count when it precedes /Type /Pages in the same dictionary', () => {
    expect(
      readPdfPageCount(
        pdf('1 0 obj\n<<\n  /Count 2\n  /Kids [5 0 R 6 0 R]\n  /Type /Pages\n>>\nendobj'),
      ),
    ).toBe(2);
  });

  it.each([
    ['garbage', bytes('not a pdf at all')],
    ['an empty buffer', new Uint8Array()],
    ['a header with no page tree', pdf('4 0 obj\n<<\n  /Type /Outlines\n  /Count 1\n>>\nendobj')],
    ['a page tree with no count', pdf('1 0 obj\n<<\n  /Type /Pages\n  /Kids [5 0 R]\n>>\nendobj')],
    ['a zero count', pdf('1 0 obj\n<<\n  /Type /Pages\n  /Count 0\n  /Kids []\n>>\nendobj')],
  ])('returns null for %s', (_name, input) => {
    expect(readPdfPageCount(input)).toBeNull();
  });

  /**
   * The silent-failure contract. If Typst ever moves the catalogue into an
   * object stream this finds nothing, and the chip must render nothing rather
   * than guess.
   */
  it('returns null rather than guessing when the page tree is past the scanned header', () => {
    const filler = 'x'.repeat(9000);
    expect(
      readPdfPageCount(pdf(`${filler}\n1 0 obj\n<<\n  /Type /Pages\n  /Count 2\n>>\nendobj`)),
    ).toBeNull();
  });
});
