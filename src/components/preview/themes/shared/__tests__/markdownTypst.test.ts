import { markdownToTypst } from '@/components/preview/themes/shared/markdownTypst';
import { describe, expect, it } from 'vitest';

describe('markdownToTypst', () => {
  describe('empty input', () => {
    it('returns empty string for null/undefined/empty', () => {
      expect(markdownToTypst(null)).toBe('');
      expect(markdownToTypst(undefined)).toBe('');
      expect(markdownToTypst('')).toBe('');
    });
  });

  describe('plain text', () => {
    it('routes plain text through escapeTypst', () => {
      expect(markdownToTypst('Hello world')).toBe('Hello world');
    });

    it('escapes Typst-special characters in plain runs', () => {
      // # $ [ ] < > @ / all neutralized; ( ) are not special in Typst markup.
      expect(markdownToTypst('cost $5 (see #3) a/b <x>')).toBe(
        'cost \\$5 (see \\#3) a\\/b \\<x\\>',
      );
    });

    it('converts newlines to space-padded newlines', () => {
      expect(markdownToTypst('a\nb')).toBe('a \n b');
    });
  });

  describe('single constructs', () => {
    it('converts **bold** to #strong[]', () => {
      expect(markdownToTypst('**bold**')).toBe('#strong[bold]');
    });

    it('converts _italic_ to #emph[]', () => {
      expect(markdownToTypst('_italic_')).toBe('#emph[italic]');
    });

    it('converts [text](url) to #link()[]', () => {
      expect(markdownToTypst('[KiwiCV](https://kiwicv.com)')).toBe(
        '#link("https://kiwicv.com")[KiwiCV]',
      );
    });

    it('keeps surrounding text and escapes it', () => {
      expect(markdownToTypst('see **the** a/b')).toBe('see #strong[the] a\\/b');
    });

    it('handles several constructs in sequence', () => {
      expect(markdownToTypst('**a** and _b_')).toBe('#strong[a] and #emph[b]');
    });
  });

  describe('nesting', () => {
    it('nests italic inside bold', () => {
      expect(markdownToTypst('**a _b_**')).toBe('#strong[a #emph[b]]');
    });

    it('nests bold inside link text', () => {
      expect(markdownToTypst('[**x**](https://e.com)')).toBe('#link("https://e.com")[#strong[x]]');
    });

    it('escapes text runs inside a construct', () => {
      expect(markdownToTypst('**c$d**')).toBe('#strong[c\\$d]');
    });
  });

  describe('malformed markers stay literal', () => {
    it('leaves an unclosed bold marker as escaped text', () => {
      expect(markdownToTypst('**oops')).toBe('\\*\\*oops');
    });

    it('leaves an unclosed italic marker as escaped text', () => {
      expect(markdownToTypst('_oops')).toBe('\\_oops');
    });

    it('leaves an empty bold body as escaped text', () => {
      expect(markdownToTypst('****')).toBe('\\*\\*\\*\\*');
    });

    it('leaves a link missing its closing paren as escaped text', () => {
      // [ ] are escaped; ( is not special in Typst markup.
      expect(markdownToTypst('[text](url')).toBe('\\[text\\](url');
    });
  });

  describe('URL sanitization', () => {
    it('rejects a javascript: scheme by prefixing https://', () => {
      expect(markdownToTypst('[bad](javascript:alert)')).toBe(
        '#link("https://javascript:alert")[bad]',
      );
    });

    it('preserves an allowlisted mailto: scheme', () => {
      expect(markdownToTypst('[mail](mailto:a@b.com)')).toBe('#link("mailto:a@b.com")[mail]');
    });

    it('escapes quotes in the URL so it cannot break out of the Typst string', () => {
      expect(markdownToTypst('[x](https://e.com/a"b)')).toBe('#link("https://e.com/a\\"b")[x]');
    });

    it('renders an empty-URL link as plain text (Typst rejects #link(""))', () => {
      // `[label]()` would emit `#link("")`, which fails to compile ("URL must
      // not be empty") and kills the whole PDF. Fall back to the label.
      expect(markdownToTypst('[click here]()')).toBe('click here');
      expect(markdownToTypst('see [**docs**]() now')).toBe('see #strong[docs] now');
    });
  });

  describe('recursion depth cap', () => {
    it('flattens pathologically nested markers to literal text without overflowing', () => {
      // Deeply nested bold: `**`×N + x + `**`×N. Each level strips one pair, so
      // without a cap this recurses N deep. N well past MAX_DEPTH must not throw.
      const n = 5000;
      const input = '**'.repeat(n) + 'x' + '**'.repeat(n);
      let out = '';
      expect(() => {
        out = markdownToTypst(input);
      }).not.toThrow();
      expect(out).toContain('x');
    });

    it('leaves normal nesting untouched (cap is well above real content)', () => {
      expect(markdownToTypst('**a _b_**')).toBe('#strong[a #emph[b]]');
    });
  });
});
