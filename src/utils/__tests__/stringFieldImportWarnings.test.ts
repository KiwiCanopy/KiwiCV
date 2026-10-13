import { sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * A résumé string field coerced away on import must not be silent — the
 * string-branch sibling of `arrayFieldImportWarnings`. `basics.url = 42` blanked
 * the field on 12/12 HTML previews and 12/12 Typst serializers with nothing
 * said, while the list branch beside it already warns. Same site, same notice.
 */

const importBasics = (field: string, value: unknown) =>
  sanitizeResumeData({ basics: { [field]: value } } as Record<string, unknown>);

describe('a coerced-away string value raises an import warning', () => {
  it('warns when a résumé string field carries a non-string it must clear', () => {
    expect(importBasics('url', 42).warnings).toEqual([
      {
        section: 'basics',
        item: undefined,
        field: 'url',
        message: 'editor.errors.invalid_text_value',
      },
    ]);

    // An array-section item field, not just basics — same branch, real title.
    const { warnings } = sanitizeResumeData({
      work: [{ name: 'ZQ Item', summary: { any: 'object' } }],
    } as Record<string, unknown>);
    expect(warnings).toEqual([
      {
        section: 'work',
        item: 'ZQ Item',
        field: 'summary',
        message: 'editor.errors.invalid_text_value',
      },
    ]);
  });

  /**
   * ⚠️ Half two, the half an "always warn" version fails: a string that was a
   * string, and the two ways a third party or an LLM writes "no value", carried
   * nothing away, so they say nothing. Mirrors the array branch's `null`/absent
   * cases exactly.
   */
  it('stays silent for a real string, null, undefined, or an absent field', () => {
    expect(importBasics('url', 'https://example.dev').warnings).toEqual([]);
    expect(importBasics('url', null).warnings).toEqual([]);
    expect(importBasics('url', undefined).warnings).toEqual([]);
    expect(
      sanitizeResumeData({ basics: { name: 'ZQ Item' } } as Record<string, unknown>).warnings,
    ).toEqual([]);
  });

  /**
   * ⚠️ The gate that distinguishes a blanked résumé field from a narrowed
   * setting. `meta`'s string defaults are real values, not `''` (`theme.name`
   * `'lunar'`), and its section is unlabelable — so coercing one is a narrowing
   * the user need not hear about, and a warning there would head a modal row
   * with a key the UI cannot render. Both `defaultValue === ''` and the label
   * gate keep it silent; assert the result rather than the reason.
   */
  it('stays silent when a meta string setting is coerced to its non-empty default', () => {
    const { sanitized, warnings } = sanitizeResumeData({
      meta: { theme: { name: 42 } },
    } as Record<string, unknown>);

    expect(typeof sanitized.meta.theme.name).toBe('string');
    expect(sanitized.meta.theme.name).not.toBe(42 as unknown as string);
    expect(warnings).toEqual([]);
  });
});
