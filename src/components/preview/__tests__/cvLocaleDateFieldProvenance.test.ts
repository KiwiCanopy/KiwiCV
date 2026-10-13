import { getBoundFormatters, getThemeTranslations } from '@/components/preview/themes/shared';
import { formatDate, formatDateRange } from '@/components/preview/themes/shared/dates';
import type { CVLocaleMetadata } from '@/components/preview/themes/shared/types';
import { type LocaleCode, locales } from '@/locales';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * **`CVLocaleMetadata` carries two language fields, `code` and `bcp47`, and for
 * almost every shipped locale no output assertion can tell which one a date
 * formatter reads.** Fourteen of the fifteen bundles set `bcp47` to
 * `<code>-<REGION>` where `REGION` is exactly the region `Intl` resolves the bare
 * subtag to, so `formatDate(d, 'fr', 'fr')` and `formatDate(d, 'fr', 'fr-FR')` are
 * byte-identical. An earlier fix closed this for `getFooterDate` alone; `formatCVDate` /
 * `formatCVDateRange` are the widest surface in the repo — every date of every
 * résumé, in both outputs.
 *
 * ⚠️ **`pt` is the exception, and it makes the premise this started from wrong.**
 * The first measurement tabulated all fifteen as `same=true`; measured through
 * `formatDate`, `pt` is not. The bundle ships `pt-PT`, and CLDR's default region
 * for a bare `pt` is **BR** — so `26 de jul. de 2026` (by `code`) against
 * `26/07/2026` (by `bcp47`). That table was produced from `toLocaleDateString`
 * defaults for `getFooterDate`, and does not carry over to `month: 'short'` here.
 * So the fifteen-locale sweep is *already* non-vacuous at one locale, and the
 * suggestion to add such a locale is already satisfied by a shipped one.
 *
 * ⚠️ **Not discharged by taking the whole object.** That closed the
 * *call-site swap* — two adjacent `string` parameters being interchangeable —
 * and says nothing about which field the **body** reads. The two are
 * complementary, and conflating them is what both reviewer passes found in
 * the earlier fix's docblock. Now the synthetic cases below are the *only* way to
 * express a `code`/`bcp47` disagreement at all: no real locale has one, and the
 * signature no longer lets a caller create one by accident. That is the point —
 * it makes this file the sole remaining witness to the body-read property, so
 * deleting it would leave the property held by nothing.
 *
 * ⚠️ **The two fields are not redundant — they drive different things**, which is
 * why "just read one" is not the fix. `bcp47` is the `Intl.DateTimeFormat`
 * constructor argument (month and day ordering); `code` is read *only* by the
 * year-only branch, for the Japanese/Chinese `年` suffix. A guard observing one is
 * blind to the other, so the synthetic cases below cross them.
 *
 * Two complementary halves, because neither implies the other:
 *
 * 1. **Provenance, universal over all fifteen.** Their outputs mostly agree but
 *    the two *strings* never do — `'de'` and `'de-DE'` differ as arguments even
 *    when they format alike. Spying on the `Intl.DateTimeFormat` constructor
 *    therefore distinguishes the fields at every locale, where an output assertion
 *    can do so at `pt` only. Round sixteen's "spy on the argument", one function
 *    over.
 * 2. **Behaviour, on synthetic locales whose fields disagree in language.** Real
 *    locales cannot express `{ code: 'de', bcp47: 'ja-JP' }`, and only a
 *    disagreement in *language* makes a swap invert the output rather than degrade
 *    it invisibly.
 */

const DATE = '2026-07-26';

/**
 * A `CVLocaleMetadata` whose two language fields can be set independently.
 *
 * ⚠️ Built from `getThemeTranslations('en')` and overridden, not written out as
 * a literal: a literal here would be a fourteenth restatement of the interface
 * and would stop compiling the day a field is added — which is exactly when a
 * date guard should keep working. The fields not under test come from a real
 * bundle so nothing downstream sees a half-built object.
 */
const localeWith = (fields: Partial<CVLocaleMetadata>): CVLocaleMetadata => ({
  ...getThemeTranslations('en'),
  ...fields,
});

/** The shorthand the old signature gave for free. */
const at = (code: string, bcp47: string, present = 'Present'): CVLocaleMetadata =>
  localeWith({ code: code as LocaleCode, bcp47, present });

const resumeAt = (locale: string): ResumeData => {
  const data = structuredClone(initialResumeState) as ResumeData;
  data.meta.theme.locale = locale;
  return data;
};

const LOCALE_CODES = Object.keys(locales) as LocaleCode[];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('cvLocale.code and cvLocale.bcp47 are distinguishable at every date formatter', () => {
  /**
   * ⚠️ The premise, pinned as a **set** rather than asserted in prose. It is what
   * makes an output-based date assertion vacuous with respect to *which field* it
   * reads at fourteen locales — and it names the one where it is not.
   *
   * `toEqual(['pt'])`, not `toContain('pt')`: if another bundle takes a
   * non-default region (`en-GB`, `zh-TW`, or `pt-BR` — each one translation-import
   * correction away) this fails and names it, which is the signal that a plain
   * output assertion has started covering that locale. Existential would say
   * nothing.
   */
  it('distinguishes the two fields by output at exactly one shipped locale', () => {
    const distinguishing = LOCALE_CODES.filter((code) => {
      const { bcp47 } = getThemeTranslations(code);
      return formatDate(DATE, at(code, code)) !== formatDate(DATE, at(code, bcp47));
    });

    expect(distinguishing).toEqual(['pt']);

    // The measurement behind it, so the reason is in the file and not only in the
    // commit: `pt`'s bundle ships `pt-PT` while CLDR resolves a bare `pt` to BR.
    expect(formatDate(DATE, at('pt', 'pt'))).toBe('26 de jul. de 2026');
    expect(formatDate(DATE, at('pt', 'pt-PT'))).toBe('26/07/2026');

    // The control: the formatter must be producing localised output at all, or the
    // fourteen equalities hold because everything came out `''`.
    expect(formatDate(DATE, at('de', 'de-DE'))).not.toBe(formatDate(DATE, at('ja', 'ja-JP')));
  });

  /**
   * Half 1 — provenance. `getBoundFormatters` must hand `bcp47` to `Intl` at every
   * locale, and at fourteen of them this is the only assertion that can see it.
   *
   * ⚠️ The mock is a `function`, not an arrow. `formatDate` calls
   * `new Intl.DateTimeFormat(...)`, an arrow has no `[[Construct]]`, and the
   * resulting `TypeError` is swallowed by that function's own `try`/`catch` — so an
   * arrow-based spy records **nothing** while the test reads as passing wherever
   * the fallback format happens to match. The `seen.length` control below is what
   * caught it.
   */
  it.each(LOCALE_CODES)('formatCVDate builds Intl from bcp47, not code, at %s', (code) => {
    const { bcp47 } = getThemeTranslations(code);
    const seen: unknown[] = [];
    const real = Intl.DateTimeFormat;
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (
      tag?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ) {
      seen.push(tag);
      return new real(tag, options);
    } as never);

    const { formatCVDate, formatCVDateRange } = getBoundFormatters(resumeAt(code));
    formatCVDate(DATE);
    formatCVDateRange(DATE, DATE);

    // The positive control first: a dead spy satisfies `not.toContain` forever.
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((tag) => tag === bcp47)).toBe(true);
    expect(seen).not.toContain(code);
  });

  /**
   * Half 2 — behaviour, crossed. Each case sets the *other* field to a value that
   * would give a visibly wrong answer, so neither field can be ignored and neither
   * assertion is satisfied by the code special-casing the varied value.
   *
   * ⚠️ `ja` is the right varied language precisely *because* the year-only branch
   * special-cases it. That makes the cross meaningful: swapping the two arguments
   * does not merely change the month name, it moves the `年` between cases.
   */
  it('reads bcp47 for the month format even when code disagrees', () => {
    // Japanese formatting (from `bcp47`) despite a German `code`.
    expect(formatDate(DATE, at('de', 'ja-JP'))).toBe(formatDate(DATE, at('ja', 'ja-JP')));
    expect(formatDate(DATE, at('de', 'ja-JP'))).not.toBe(formatDate(DATE, at('de', 'de-DE')));

    // And the other way round, so this is not "ja-JP wins whatever happens".
    expect(formatDate(DATE, at('ja', 'de-DE'))).toBe(formatDate(DATE, at('de', 'de-DE')));
  });

  it('reads code for the year-only CJK suffix even when bcp47 disagrees', () => {
    expect(formatDate('2026', at('de', 'ja-JP'))).toBe('2026');
    expect(formatDate('2026', at('ja', 'de-DE'))).toBe('2026年');
    expect(formatDate('2026', at('zh', 'de-DE'))).toBe('2026年');
  });

  /**
   * ⚠️ **The case that binds the `code` half at the CALL SITE, and without it this
   * whole file was defeatable.** Half 1 observes only the `Intl.DateTimeFormat`
   * constructor argument, which `bcp47` feeds; half 2 above pins the `code`-read on
   * `formatDate` *directly*, bypassing the binding the file exists to guard. So
   * mutating `getBoundFormatters` to `formatDate(date, bcp47, bcp47)` — dropping
   * `cvLocale.code` entirely — satisfied `every(tag === bcp47)` and
   * `not.toContain(code)` and left **19/19 green**, while `ja` and `zh` résumés
   * silently lost the year suffix on every year-only date. Found independently by
   * both reviewer passes.
   *
   * The year-only branch is the only observable `code` read, so these two locales
   * are the entire surface — and `de` is the control that proves the assertion is
   * not "every locale gets 年".
   */
  it.each([
    ['ja', '2026年'],
    ['zh', '2026年'],
    ['de', '2026'],
    ['en', '2026'],
  ])('getBoundFormatters keeps reading code at %s', (locale, expected) => {
    const { formatCVDate, formatCVDateRange } = getBoundFormatters(resumeAt(locale));

    expect(formatCVDate('2026')).toBe(expected);
    expect(formatCVDateRange('2026', '2026')).toBe(`${expected} – ${expected}`);
  });

  it('carries both fields through formatDateRange', () => {
    expect(formatDateRange(DATE, DATE, at('de', 'ja-JP'))).toBe(
      formatDateRange(DATE, DATE, at('ja', 'ja-JP')),
    );
    expect(formatDateRange('2026', null, at('ja', 'de-DE', 'Heute'))).toBe('2026年 – Heute');
    expect(formatDateRange('2026', null, at('de', 'ja-JP', 'Heute'))).toBe('2026 – Heute');
  });

  /**
   * ⚠️ `present` came off the parameter list with `locale`/`bcp47`, so
   * it needs its own case: both callers passed `cvLocale.present`, and reading
   * it from the object rather than from a fourth argument is only equivalent if
   * the fallback survives. `getBoundFormatters` applied `|| 'Present'`, and
   * moving that into `formatDateRange` is what keeps a bundle with an empty
   * `present` from rendering `2026 – `.
   */
  it('reads present off the locale, with the fallback the caller used to apply', () => {
    expect(formatDateRange('2026', null, at('de', 'de-DE', 'Heute'))).toBe('2026 – Heute');
    expect(formatDateRange('2026', null, localeWith({ present: '' }))).toBe('2026 – Present');
  });
});

/**
 * The whole-object signature's own property, and one the sweep cannot state: a caller must not
 * be able to pair a locale *code* with another locale's `bcp47`.
 *
 * ⚠️ The date picker is where that was live. It derived a single `bcp47` from
 * `dataLocaleCode` and handed it to `formatDate` alongside
 * `interactionLocaleCode` at two of its three sites, so a Japanese UI over an
 * English CV formatted a year as `2026年` (from `code`) and a month in English
 * (from `bcp47`) inside one picker.
 *
 * ⚠️ Asserted on the **hook's** two locale objects rather than on rendered
 * markup: the swap is now a type error, so there is nothing left to observe in
 * the output — which is exactly what a "make it unexpressible" fix should look
 * like, and exactly why a behavioural assertion would be vacuous here.
 * What is still worth pinning is that the two objects are *internally
 * consistent*, because that is the property a future edit can break without the
 * compiler noticing.
 */
describe('every locale metadata object pairs its own code with its own bcp47', () => {
  it.each(LOCALE_CODES)('%s', (code) => {
    const locale = getThemeTranslations(code);
    expect(locale.code).toBe(code);
    expect(locale.bcp47).toBe(locales[code].theme_translations.bcp47);
  });

  /**
   * The control, and it is what makes the block above non-trivial: the pairing
   * has to be observable, i.e. two different codes must actually yield two
   * different `bcp47` values. If every bundle shipped `en-US` this would pass
   * and mean nothing.
   */
  it('yields distinct bcp47 tags across the shipped locales', () => {
    const tags = new Set(LOCALE_CODES.map((code) => getThemeTranslations(code).bcp47));
    expect(tags.size).toBe(LOCALE_CODES.length);
  });
});
