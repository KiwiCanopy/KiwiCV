import { type ResumeData, initialResumeState } from '@/types/resume';
import { generateFilename } from '@/utils/filename';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `generateFilename` expands the export filename pattern the user edits in
 * Settings. It had no direct tests; this pins every token, the two date paths,
 * and the substitution bug found while sweeping `src/utils/` for untested files.
 */

function resumeWith(overrides: { name?: string; theme?: string; locale?: string }): ResumeData {
  return {
    ...initialResumeState,
    basics: { ...initialResumeState.basics, name: overrides.name ?? '' },
    meta: {
      ...initialResumeState.meta,
      theme: {
        ...initialResumeState.meta.theme,
        name: overrides.theme ?? initialResumeState.meta.theme.name,
        locale: overrides.locale ?? initialResumeState.meta.theme.locale,
      },
    },
  };
}

describe('generateFilename — tokens', () => {
  it('replaces {name} and collapses whitespace into underscores', () => {
    expect(generateFilename('{name}', resumeWith({ name: 'Max  Mustermann' }))).toBe(
      'Max_Mustermann',
    );
  });

  it('falls back to Resume when basics.name is empty', () => {
    expect(generateFilename('{name}', resumeWith({}))).toBe('Resume');
  });

  it('replaces {theme} and {lang} from meta.theme', () => {
    const resume = resumeWith({ theme: 'swiss_grid', locale: 'de' });

    expect(generateFilename('{theme}-{lang}', resume)).toBe('swiss_grid-de');
  });

  it('replaces every occurrence of a token, not only the first', () => {
    expect(generateFilename('{name}_{name}', resumeWith({ name: 'Ada' }))).toBe('Ada_Ada');
  });

  it('leaves an unknown token untouched', () => {
    expect(generateFilename('{nope}_{name}', resumeWith({ name: 'Ada' }))).toBe('{nope}_Ada');
  });

  it('uses the default pattern when the pattern is empty or whitespace', () => {
    const resume = resumeWith({ name: 'Ada' });

    // Default is `{date-YYYYMMDD}_{name}`.
    expect(generateFilename('   ', resume)).toMatch(/^\d{8}_Ada$/);
    expect(generateFilename('', resume)).toMatch(/^\d{8}_Ada$/);
  });
});

/**
 * `String.replace` with a *string* replacement expands `$&`, `` $` ``, `$'` and
 * `$$`. `basics.name` is free user text and arrives from imported JSON as well
 * as the editor, so it must be inserted literally — a name of `A$&B` used to
 * re-insert the very `{name}` token it was replacing.
 */
describe('generateFilename — user text is inserted literally', () => {
  it.each([
    ['A$&B', 'A$&B'],
    ["A$'B", "A$'B"],
    ['A$`B', 'A$`B'],
    ['A$$B', 'A$$B'],
  ])('does not expand %s as a replacement pattern', (name, expected) => {
    expect(generateFilename('{name}', resumeWith({ name }))).toBe(expected);
  });

  it('does not expand a replacement pattern in the middle of a longer filename', () => {
    expect(generateFilename('cv_{name}_final', resumeWith({ name: 'A$&B' }))).toBe('cv_A$&B_final');
  });
});

describe('generateFilename — dates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Local time on purpose: the implementation reads getFullYear/getMonth/etc.
    vi.setSystemTime(new Date(2026, 6, 24, 9, 5, 3));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('substitutes every {date-FORMAT} field, zero padded', () => {
    const resume = resumeWith({});

    expect(generateFilename('{date-YYYY-MM-DD}', resume)).toBe('2026-07-24');
    expect(generateFilename('{date-HH:mm:ss}', resume)).toBe('09:05:03');
    expect(generateFilename('{date-DD.MM.YYYY}', resume)).toBe('24.07.2026');
  });

  it('substitutes multiple {date-FORMAT} tokens independently', () => {
    expect(generateFilename('{date-YYYY}_{date-MM}', resumeWith({}))).toBe('2026_07');
  });

  it('supports the legacy bare {date} token', () => {
    expect(generateFilename('{date}_{name}', resumeWith({ name: 'Ada' }))).toBe('20260724_Ada');
  });

  it('substitutes format fields inside surrounding literal text', () => {
    expect(generateFilename('{date-YYYY_backup}', resumeWith({}))).toBe('2026_backup');
  });

  /**
   * A documented wart, not a contract: the format string is run through a chain
   * of unanchored replaces, so literal text is only safe when it contains none
   * of YYYY/MM/DD/HH/mm/ss. `backup` above is safe by accident; `summary` is
   * not — its `mm` becomes the minutes. Recorded so a future change to the
   * format handling is a visible decision rather than a silent one.
   */
  it('mangles literal text that happens to contain a format field', () => {
    expect(generateFilename('{date-summary}', resumeWith({}))).toBe('su05ary');
  });
});

/**
 * Tokens are expanded in one pass. A chain of passes re-scans what earlier ones
 * wrote, so a `basics.name` of `{lang}` came out as the locale — the same bug
 * class as the `$&` expansion above, and reachable the same way: imported JSON.
 */
describe('generateFilename — a substituted value is not re-scanned', () => {
  it.each(['{lang}', '{theme}', '{date-YYYY}', '{date}'])(
    'leaves a name of %s as literal text',
    (name) => {
      expect(generateFilename('{name}', resumeWith({ name }))).toBe(name);
    },
  );

  it('still expands the other tokens around it', () => {
    expect(generateFilename('{name}_{lang}', resumeWith({ name: '{lang}', locale: 'de' }))).toBe(
      '{lang}_de',
    );
  });
});
