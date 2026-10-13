import {
  escapeTypst,
  escapeTypstString,
  getEntryHeaderMarkup,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import { describe, expect, it } from 'vitest';

describe('escapeTypst', () => {
  it('returns empty string for null/undefined/empty input', () => {
    expect(escapeTypst(null)).toBe('');
    expect(escapeTypst(undefined)).toBe('');
    expect(escapeTypst('')).toBe('');
  });

  it('escapes slashes so // is not treated as a Typst line comment', () => {
    expect(escapeTypst('24/7 // on-call')).toBe('24\\/7 \\/\\/ on-call');
  });

  it('escapes backticks so an unbalanced one cannot open raw text', () => {
    expect(escapeTypst('use `npm ci')).toBe('use \\`npm ci');
  });

  it('escapes tildes so they do not become non-breaking spaces', () => {
    expect(escapeTypst('~/projects')).toBe('\\~\\/projects');
  });

  it('escapes line-start heading, list, and enum markers', () => {
    expect(escapeTypst('= Heading')).toBe('\\= Heading');
    expect(escapeTypst('- item')).toBe('\\- item');
    expect(escapeTypst('+ item')).toBe('\\+ item');
    expect(escapeTypst('1. item')).toBe('1\\. item');
  });

  it('escapes markers at the start of every line, including indented ones', () => {
    expect(escapeTypst('first\n- second')).toBe('first \n \\- second');
    expect(escapeTypst('  - indented')).toBe('  \\- indented');
  });

  it('leaves mid-line dashes, plus signs, and dots alone', () => {
    expect(escapeTypst('C++ and full-stack, v1.2')).toBe('C++ and full-stack, v1.2');
    expect(escapeTypst('2020 - 2024')).toBe('2020 - 2024');
  });

  it('still escapes the previously covered special characters', () => {
    expect(escapeTypst('a\\b #c $d [e] _f *g <h> i@j')).toBe(
      'a\\\\b \\#c \\$d \\[e\\] \\_f \\*g \\<h\\> i\\@j',
    );
  });

  it('converts newlines to space-padded newlines', () => {
    expect(escapeTypst('one\ntwo')).toBe('one \n two');
  });
});

describe('escapeTypstString', () => {
  it('only escapes backslash, quote, and newline (string context is verbatim)', () => {
    expect(escapeTypstString('24/7 // on-call')).toBe('24/7 // on-call');
    expect(escapeTypstString('a\\b "c"')).toBe('a\\\\b \\"c\\"');
    expect(escapeTypstString('one\ntwo')).toBe('one\\ntwo');
    expect(escapeTypstString(null)).toBe('');
    expect(escapeTypstString(undefined)).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('returns empty string for null/undefined/empty input', () => {
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl('')).toBe('');
  });

  it('stays non-empty for truthy input because Typst rejects link("")', () => {
    expect(sanitizeUrl('   ')).toBe('https://');
  });

  it('passes through http, https, and mailto URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
    expect(sanitizeUrl('mailto:jane@example.com')).toBe('mailto:jane@example.com');
  });

  it('prepends https:// to scheme-less URLs', () => {
    expect(sanitizeUrl('example.com')).toBe('https://example.com');
    expect(sanitizeUrl('www.example.com/me')).toBe('https://www.example.com/me');
  });

  it('neutralizes disallowed schemes with an https:// prefix', () => {
    // Typst rejects link(""), so the result must stay non-empty; prefixing
    // https:// turns script schemes into dead-but-safe links.
    expect(sanitizeUrl('javascript:alert(1)')).toBe('https://javascript:alert(1)');
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('https://JavaScript:alert(1)');
    expect(sanitizeUrl('data:text/html,x')).toBe('https://data:text/html,x');
    expect(sanitizeUrl('file:///etc/passwd')).toBe('https://file:///etc/passwd');
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('https://vbscript:msgbox(1)');
  });

  it('never starts the result with a disallowed scheme', () => {
    for (const input of ['javascript:alert(1)', 'data:text/html,x', 'file:///x', 'ftp://x']) {
      const result = sanitizeUrl(input);
      expect(result.startsWith('https://')).toBe(true);
    }
  });

  it('escapes characters that would break out of the Typst string literal', () => {
    expect(sanitizeUrl('https://example.com/a"b')).toBe('https://example.com/a\\"b');
    expect(sanitizeUrl('https://example.com/a\\b')).toBe('https://example.com/a\\\\b');
  });
});

describe('getEntryHeaderMarkup', () => {
  it('wraps the header in a link for an allowed URL', () => {
    const markup = getEntryHeaderMarkup('Title', 'Subtitle', 'example.com');
    expect(markup).toContain('link("https://example.com")');
  });

  it('neutralizes a script-scheme URL instead of linking it directly', () => {
    const markup = getEntryHeaderMarkup('Title', undefined, 'javascript:alert(1)');
    expect(markup).toContain('link("https://javascript:alert(1)")');
    expect(markup).not.toContain('link("javascript:');
  });
});
