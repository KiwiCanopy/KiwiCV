import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type ThemeId } from '@/components/preview/themeIds';
import { getPlaceholderCity } from '@/components/preview/themes/shared/levels';
import { getThemeTranslations } from '@/components/preview/themes/shared/translations';
import {
  getFooterDate,
  getTypstFooterParts,
  joinFooterParts,
} from '@/components/preview/themes/shared/typstFooter';
import { type LocaleCode, locales } from '@/locales';
import { FOOTER_THEMES } from '@/test/footerThemes';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { describe, expect, it, vi } from 'vitest';

/**
 * `getCityCountry` returns `''` whenever `location.city` is blank,
 * **whatever `countryCode` says** — `if (!location?.city) return '';` is its
 * first line. Three one-column footers guarded on `city || countryCode` and
 * pushed the result unconditionally, so a location of
 * `{ city: '', countryCode: 'DE' }` passed the guard, contributed `''`, and
 * `parts.join(', ')` printed a stray **leading comma** into the PDF — the
 * stray-separator defect:
 *
 * ```
 * fill: brand-text-muted)[, July 26, 2026]
 * ```
 *
 * It is the round-twelve dangling-separator shape with the
 * separator on the *joining* side rather than inside a block, and the fix is at
 * the guard rather than at the join: the guard now tests what `getCityCountry`
 * can actually produce. Filtering at the join would have hidden the comma and
 * left the mismatch — and would not have fixed javascript at all, whose
 * `else`-branch placeholder was being skipped by the same wrong guard.
 *
 * ⚠️ **This survived because every fixture has a city.** `buildSingleItemResume`
 * seeds `city: 'London'`, and so does every other fixture in the suite, so the
 * condition was unreachable — the same "the fixture cannot reach the state the
 * guard is about" shape the wiki has now recorded four times. The blank-city
 * location below is the whole point of this file.
 *
 * ## Scope, re-derived rather than inherited
 *
 * Six themes build their footer through the shared `getTypstFooterParts`
 * (`themes/shared/typstFooter.ts`). At the time of the stray-separator defect
 * it composed the location as `[city, countryCode].filter(Boolean).join(', ')`
 * and could not produce the empty part; it now calls `getCityCountry` like the
 * other three, so the empty part is possible there too and its guard tests the result. Three
 * one-column themes — timeless, stackoverflow and javascript — always rolled
 * their own through `getCityCountry`, and those were the three with the
 * stray-separator defect. plain, plain2 and elegant emitted no footer at all
 * *at the time* — they do now — so twelve were accounted for and the first
 * count of three was right.
 *
 * The universal half below runs over every footer-emitting theme, so the shared
 * helper is covered by the same property rather than by an argument about it.
 *
 * ⚠️ **It covered the separator and not the content.**
 * That gap is closed at the bottom of this file: the six now route through
 * `getCityCountry` like the other three, so a country code is normalised and
 * suppressed identically on all nine, and a blank city drops the location on all
 * nine rather than printing a bare country code on six of them.
 *
 * ## The second round of findings, which is where the real scope was
 *
 * ⚠️ The first version of this file fixed the **empty**-city case and asserted
 * `not.toContain('[, ')`. Both reviewer passes broke it the same way: a
 * *whitespace-only* part is truthy, so it survives every `filter(Boolean)` in
 * the chain and emits `[   , July 26, 2026]`, which that literal does not match.
 * Three reachable inputs produced it — a space in the design panel's Location
 * field, a space in its Date field, and a space in the City field — on **nine**
 * themes, one of which defeated the first fix's own new guard
 * (`getCityCountry('   ', 'DE')` returned the truthy `'   , DE'`).
 *
 * So the fix is at three layers, not one, and each is mutation-verified below:
 * the producer trims (`getCityCountry`), the join trims (`joinFooterParts`,
 * replacing four hand-rolled `parts.join(', ')` sites), and the three remaining
 * hand-rolled `city + countryCode` compositions trim
 * (`getTypstFooterParts`, `coverLetterTypst`, lunar's sidebar contact block —
 * that set derived by grepping `countryCode` across `components/preview/`, not
 * inherited). ⚠️ That list has since shrunk:
 * `getTypstFooterParts` stopped being a hand-rolled composition. Two remain.
 */

/**
 * With `locale: 'en'` every footer formats dates as `en-US`.
 *
 * ⚠️ Computed per call, not once at module load: a run that crossed local
 * midnight would otherwise fail five `toContain`s spuriously.
 */
const today = () =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * ⚠️ **Every `it.each(FOOTER_THEMES)` in this file now runs TWELVE themes.**
 * The prose below says "nine" in many places; each of those records the state
 * when its block was written and is left as the dated measurement it is. Only
 * claims that are false in the present tense have been rewritten.
 *
 * ⚠️ `OWN_FOOTER` — the three that built their own footer markup — is **gone**
 * All of them go through `renderTypstSignatureFooter`, so the set had
 * no property left and its two cases are `FOOTER_THEMES` now: three themes to
 * twelve, free, and one fewer inventory to drift.
 *
 * `FOOTER_THEMES` itself moved to `@/test/footerThemes` because this file and
 * `footerGeometry.test.ts` both need it and the two spellings were already
 * diverging (derived-by-exclusion here, a hand-written nine-element literal
 * there).
 */

const withLocation = (
  themeId: ThemeId,
  location: Partial<ResumeData['basics']['location']>,
): ResumeData => {
  const data = buildSingleItemResume(themeId);
  data.basics.location = { ...data.basics.location, ...location };
  return data;
};

/**
 * ⚠️ The same fixture under a **non-English** CV locale, and it exists because
 * everything else in this file runs at `en` — where `code` is `'en'`, `bcp47` is
 * `'en-US'`, and `today()` is hardcoded `en-US`. At that locale a footer that
 * ignored its `cvLocale` argument entirely, or passed `bcp47` where `code` is
 * wanted, is **indistinguishable** from a correct one. Measured: replacing both
 * `cvLocale.code` and `cvLocale.bcp47` in `getTypstFooterParts` with the literals
 * `'en'` and `'en-US'` left the whole suite green.
 *
 * `fr` separates them. `getLocaleCountryCode('fr')` resolves `fr-FR` → `FR`;
 * `getLocaleCountryCode('fr-FR')` finds no `locales['fr-FR']`, falls back to
 * `locales['en']` and returns **`US`** — so the swap inverts which code is
 * suppressed rather than merely degrading it.
 *
 * ⚠️ **`fr`, not `de`, and the first draft used `de` and was wrong.** timeless
 * resolved its footer date through `locale === 'de' ? 'de-DE' : 'en-US'`, so `de`
 * was one of the exactly two locales it handled correctly — the fixture could not
 * reach the state the case was about. `fr` was wrong on both split themes and
 * correct on the other seven. That ternary has since been deleted; the rule
 * survives it, because the next hand-written locale special case will have its
 * own one privileged value and `de` is the likeliest candidate.
 */
const withLocale = (
  themeId: ThemeId,
  locale: string,
  location: Partial<ResumeData['basics']['location']>,
): ResumeData => {
  const data = withLocation(themeId, location);
  data.meta.theme.locale = locale;
  return data;
};

/** `buildSingleItemResume`'s `basics.name`, which every theme prints in its header. */
const NAME = 'Ada Lovelace';

const dateIn = (bcp47: string) =>
  new Date().toLocaleDateString(bcp47, { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * The footer's own bracket group, pulled out of the markup.
 *
 * ⚠️ **Necessary, not tidiness.** A bare `markup.not.toContain('[Berlin, DE, ')`
 * fails on all nine themes under a German CV — not because the footer is wrong,
 * but because `coverLetterTypst` composes its sender line by hand as
 * `[city, countryCode].filter(Boolean).join(', ')` and never applies
 * `shouldHideCountryCode` either. It is the third producer of this line and one
 * of the two hand-rolled compositions left in place.
 *
 * Anchoring on the long-form date excludes it: the cover letter emits an ISO
 * `2026-07-25`, the footers emit `July 26, 2026` / `26. Juli 2026`. The header
 * address line (`formatFullAddress`) carries no date at all.
 */
const footerText = (markup: string, ...dates: string[]): string => {
  for (const date of dates) {
    const match = markup.match(
      new RegExp(`\\[[^\\][]*${date.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\][]*\\]`),
    );
    if (match) return match[0];
  }
  return '';
};

const serialize = (themeId: ThemeId, location: Partial<ResumeData['basics']['location']>): string =>
  SERIALIZERS[themeId](withLocation(themeId, location));

const serializeWith = (
  themeId: ThemeId,
  input: { location?: Partial<ResumeData['basics']['location']>; params?: Record<string, string> },
): string => {
  const data = withLocation(themeId, input.location ?? {});
  if (input.params) data.meta.theme.params = { ...data.meta.theme.params, ...input.params };
  return SERIALIZERS[themeId](data);
};

/**
 * The defect, as it appears in the emitted Typst.
 *
 * ⚠️ A plain `'[, '` is **defeated by one space**, and the first draft of this
 * file fed itself the input that proves it: `{ city: '', countryCode: '   ' }`
 * survives the shared helper's `filter(Boolean)` and emits `[   , July 26,
 * 2026]`, which `includes('[, ')` reports as clean while six themes print the
 * bug. Both reviewer passes found it. The regexes allow the whitespace, and the
 * trailing form is here because `footerDate: '   '` produces `[London, GB,    ]`
 * — the same defect at the other end, which no assertion covered at all.
 */
const DANGLING_LEADING = /\[\s*,\s/;
const DANGLING_TRAILING = /,\s*\]/;

const BLANK_CITY = { city: '', countryCode: 'DE' } as const;

/**
 * ⚠️ The inputs that defeated the first fix. A whitespace-only city is *truthy*,
 * so `getCityCountry` used to return `'   , DE'` and the new
 * `if (cityCountry)` guard passed it straight through; a whitespace
 * `footerLocation`/`footerDate` never touches `getCityCountry` at all and is
 * stored verbatim (`PdfFooterSection.tsx` writes `val || 'auto'` untrimmed, and
 * every serializer tests `footerLocation === ''` with `===`). All three are
 * reachable by typing a space into a design-panel field.
 */
const BLANK_INPUTS = [
  ['a blank city with a country code', { location: BLANK_CITY }],
  ['an entirely empty location', { location: { city: '', countryCode: '' } }],
  ['a blank city with a whitespace country code', { location: { city: '', countryCode: '   ' } }],
  ['a whitespace-only city', { location: { city: '   ', countryCode: 'DE' } }],
  ['a whitespace-only footerLocation', { params: { footerLocation: '   ' } }],
  ['a whitespace-only footerDate', { params: { footerDate: '   ' } }],
] as const;

describe('a blank city with a country code emits no dangling separator', () => {
  /**
   * ⚠️ The positive control, and it comes first because everything below is a
   * `not.toContain`. A footer that stopped being emitted — a renamed param, a
   * `showFooter` default flip, a serializer that throws before it — would
   * satisfy every absence assertion in this file forever.
   *
   * It mutates a **required** part of the very output under test and asserts it
   * moves, and it checks the channel can reach the state the guard is about:
   * `DE` under an `en` locale is not suppressed by `shouldHideCountryCode`
   * (which hides only the locale's *own* country), so a resolvable city really
   * does reach the markup.
   */
  it.each(FOOTER_THEMES)(
    '%s prints a resolvable city, so the assertions below are live',
    (themeId) => {
      expect(serialize(themeId, { city: 'Berlin', countryCode: 'DE' })).toContain(
        `[Berlin, DE, ${today()}]`,
      );
    },
  );

  it.each(FOOTER_THEMES)('%s omits the location rather than its separator', (themeId) => {
    const markup = serialize(themeId, BLANK_CITY);

    expect(markup).not.toContain(`[, ${today()}]`);
    expect(markup).not.toMatch(DANGLING_LEADING);
  });

  /**
   * javascript's variant, which a `.filter(Boolean)` at the join would not have
   * fixed: the wrong guard also skipped the `else`-branch placeholder, so the
   * theme printed *no* location where its own design panel
   * (`PdfFooterSection.tsx:23`, `getCityCountry(…) || getPlaceholderCity(…)`)
   * told the user it would print one. The two now share the expression.
   */
  it('javascript falls through to its placeholder city, matching the design panel', () => {
    expect(serialize('javascript', BLANK_CITY)).toContain(
      `[${getPlaceholderCity('en')}, ${today()}]`,
    );
  });

  /**
   * timeless and stackoverflow have no placeholder — dropping the location
   * entirely is their existing behaviour for a location with nothing in it, and
   * a blank city is now treated the same way. Stated explicitly so that a later
   * change to *add* a placeholder is a deliberate edit here rather than a silent
   * one.
   */
  it.each(['timeless', 'stackoverflow'] as const)(
    '%s prints the date alone when the city is blank',
    (themeId) => {
      expect(serialize(themeId, BLANK_CITY)).toContain(`[${today()}]`);
    },
  );

  /**
   * The universal half. The three above are the sites that had the defect; this
   * is the property, over every theme and over both the blank-city and
   * no-location-at-all inputs — so the six themes on the shared
   * `getTypstFooterParts` are held to it too, and a thirteenth theme is covered
   * the day it is registered.
   */
  it.each(FOOTER_THEMES)('%s emits no dangling separator for any blank input', (themeId) => {
    for (const [, input] of BLANK_INPUTS) {
      const markup = serializeWith(themeId, input);
      expect(markup).not.toMatch(DANGLING_LEADING);
      expect(markup).not.toMatch(DANGLING_TRAILING);
    }
  });

  /**
   * ⚠️ The universal half's own positive control, and it was missing. The block
   * above is all `not.toMatch`, so a change that silenced the shared footer
   * would leave every assertion green forever on a document with nothing to
   * assert about. This drives a resolvable city through every theme and watches
   * it arrive.
   *
   * ⚠️ When written it ran nine themes, of which this file separately proved
   * three emitted no footer at all — that companion block is gone, because those
   * three have a footer now and `FOOTER_THEMES` is the full inventory.
   */
  it.each(FOOTER_THEMES)('%s does emit a footer, so the block above is not vacuous', (themeId) => {
    expect(serialize(themeId, { city: 'Berlin', countryCode: 'DE' })).toContain(today());
  });

  /**
   * ⚠️ **The "plain / plain2 / elegant emit no footer at all" block is gone
   * because they now do**, and a census entry that disappears has to say why or
   * it is indistinguishable from a census that stopped working. It existed so a
   * theme growing a footer forced a deliberate widening of `FOOTER_THEMES`; that
   * list is `ALL_THEME_IDS` now, so the widening happens by construction and the
   * case above already covers all twelve.
   */
});

/**
 * The same nine footers, one property over: not whether the separator
 * dangles, but **what the location says**.
 *
 * `getTypstFooterParts` composed the location itself as
 * `[city, countryCode].filter(Boolean).join(', ')`, so the six two-column themes
 * that use it bypassed `getCityCountry` and therefore both of its rules —
 * `normalizeCountryCode` (trim + uppercase) and `shouldHideCountryCode` (drop a
 * code the CV locale already implies). Measured across all twelve themes before
 * the fix, one résumé, `{ city: 'Berlin', countryCode: 'US' }` under an `en` CV:
 *
 * ```
 * javascript / stackoverflow / timeless : [Berlin, July 26, 2026]
 * foggy / lunar / misty / skyline / soft / swiss_grid : [Berlin, US, July 26, 2026]
 * elegant / plain / plain2 : NO FOOTER
 * ```
 *
 * Two behaviours for one résumé, chosen by the theme picker. The three are the
 * correct ones — an `en` CV is `en-US`, so `US` is redundant — which is why the
 * fix is to route the six through the shared producer rather than to teach it a
 * second rule.
 *
 * ⚠️ **Every case below runs over all nine**, not over the six that changed. A
 * six-theme list would be a regression pin: it says nothing about a tenth
 * footer, and it would let the three *correct* themes drift into the old
 * behaviour unnoticed. The property is "one location rule for every footer".
 *
 * Verified by hashing the emitted markup for twelve themes × six locations
 * before and after: **24 of 72** rows moved, all six two-column themes on
 * exactly these four inputs, and `{ city, countryCode: 'DE' }` and
 * `{ city, countryCode: '' }` byte-identical everywhere. ⚠️ The markup, never
 * the PDF — the WASM compiler is non-deterministic across runs.
 */
describe('every footer applies the same location rule', () => {
  /**
   * ⚠️ The positive control, and it comes first because the suppression case
   * below is an *absence* claim. A footer that stopped printing the country code
   * at all — a producer returning bare `city`, a dropped `countryCode` read —
   * would satisfy "US is suppressed" forever. This pins that a country code the
   * locale does **not** imply still arrives, on the same nine themes and through
   * the same expression.
   */
  it.each(FOOTER_THEMES)('%s still prints a country code the locale does not imply', (themeId) => {
    expect(serialize(themeId, { city: 'Berlin', countryCode: 'DE' })).toContain(
      `[Berlin, DE, ${today()}]`,
    );
  });

  /**
   * The defect itself. `shouldHideCountryCode` drops a code equal to the CV
   * locale's own country, and `en` resolves to `en-US`.
   */
  it.each(FOOTER_THEMES)('%s suppresses a country code the CV locale implies', (themeId) => {
    const markup = serialize(themeId, { city: 'Berlin', countryCode: 'US' });

    expect(markup).toContain(`[Berlin, ${today()}]`);
    expect(markup).not.toContain(`[Berlin, US, ${today()}]`);
  });

  /**
   * The second half of the bypass, and the one no issue would have found by
   * reading: a stored code reached the six verbatim, so `'  de '` printed
   * lowercase and padded where the three normalised it.
   *
   * ⚠️ Reachable without an imported file — `BasicsForm` does not trim on write
   * and `validation.ts` does not either, so this is what a typed stray space
   * produces.
   */
  it.each(FOOTER_THEMES)('%s normalises a padded lowercase country code', (themeId) => {
    expect(serialize(themeId, { city: 'Berlin', countryCode: '  de ' })).toContain(
      `[Berlin, DE, ${today()}]`,
    );
  });

  /**
   * ⚠️ **The city is trimmed, not merely tested trimmed** — and this is the
   * regression the reviewer pass caught in the `getCityCountry` fix itself.
   *
   * The producer that fix deleted trimmed each component before joining
   * (`.map((value) => value?.trim())`). `getCityCountry` tested `city.trim()` for
   * blankness and then returned the **raw** value, so routing the six through it
   * turned `{ city: '  Berlin  ', countryCode: 'DE' }` from `[Berlin, DE, …]`
   * into `[Berlin  , DE, …]`.
   *
   * That is a space on the *interior* of a part, immediately before the
   * separator — the one place `joinFooterParts` cannot reach, since it trims a
   * part's outer edges and not its middle. Same shape as the stray-separator
   * defect, reintroduced by the change modelled on it. Fixed at the producer, so
   * the three one-column footers and `PdfFooterSection` — which already had it —
   * are covered too, which is why this runs over all nine.
   */
  it.each(FOOTER_THEMES)('%s trims a padded city rather than only testing it', (themeId) => {
    const markup = serialize(themeId, { city: '  Berlin  ', countryCode: 'DE' });

    expect(markup).toContain(`[Berlin, DE, ${today()}]`);
    expect(markup).not.toContain(`[Berlin  , DE, ${today()}]`);
  });

  /**
   * ⚠️ Scoped to the footer, deliberately, and this case is the reason. The first
   * draft of the case above asserted `not.toContain('Berlin  ,')` over the whole
   * markup and failed on all nine themes **after** the footer was fixed — because
   * `formatFullAddress` had the identical untrimmed-city defect on the *header*
   * address line, a larger surface (`12 Nowhere Lane, W1A 1AA   Berlin  , DE`,
   * two call sites in stackoverflow alone, on every theme).
   *
   * That producer is fixed too now (`addressSchemaResolution.test.tsx`
   * owns the property over all twelve themes and both outputs). What stays here
   * is the **separation**: the footer's assertions extract the footer's own
   * bracket group, so this pins that the address line is a distinct producer with
   * its own coverage rather than something this file happens to catch.
   */
  it('the header address line is a separate producer, and is trimmed too', () => {
    const markup = serialize('stackoverflow', { city: '  Berlin  ', countryCode: 'DE' });

    expect(markup).toContain('12 Nowhere Lane, W1A 1AA Berlin, DE');
    expect(markup).not.toContain('12 Nowhere Lane, W1A 1AA   Berlin  , DE');
    // The footer group is extracted separately, so this line and the footer
    // cannot cover for one another.
    expect(footerText(markup, today())).toBe(`[Berlin, DE, ${today()}]`);
  });

  /**
   * ⚠️ **The cases above cannot see the `cvLocale` argument at all**, and that is
   * measured rather than suspected: replacing both `cvLocale.code` and
   * `cvLocale.bcp47` inside `getTypstFooterParts` with the literals `'en'` and
   * `'en-US'` — i.e. ignoring the parameter whose introduction is the whole point
   * of the signature change — left the entire suite green.
   *
   * At `en` the two fields answer identically. At `de` they invert: `.code`
   * suppresses `DE` and prints `US`, `.bcp47` does the opposite. This pair is
   * what makes the `CVLocaleMetadata` parameter, and the argument in its
   * docblock, worth anything.
   *
   * ⚠️ It asserts the **location** only, and does not pin the date, because when
   * it was written the date rule was still split three ways — timeless resolved it
   * through a one-entry `locale === 'de' ? 'de-DE' : 'en-US'` ternary and
   * stackoverflow hardcoded `'en-US'`, so 13 and 14 of the 15 shipped locales got
   * an English date on those two. That split was fixed on its own (`getFooterDate`,
   * below); folding it in here would have made these nine assertions fail for a
   * defect they do not name.
   */
  it.each(FOOTER_THEMES)('%s resolves the country code from the CV locale, not en', (themeId) => {
    const both = [dateIn('fr-FR'), today()];
    const suppressed = footerText(
      SERIALIZERS[themeId](withLocale(themeId, 'fr', { city: 'Berlin', countryCode: 'FR' })),
      ...both,
    );
    const printed = footerText(
      SERIALIZERS[themeId](withLocale(themeId, 'fr', { city: 'Berlin', countryCode: 'US' })),
      ...both,
    );

    // `fr` implies FR, so FR is dropped and US — redundant at `en` — is kept.
    // Passing `bcp47` where `code` belongs inverts exactly this pair.
    expect(suppressed).toMatch(/^\[Berlin, /);
    expect(suppressed).not.toContain('Berlin, FR,');
    expect(printed).toContain('Berlin, US,');
  });

  /**
   * The date half of the same argument, and it now runs over **all nine**.
   *
   * It used to run over seven, with timeless and stackoverflow excluded as a
   * pinned known state: the date rule was split three ways, timeless resolving it
   * through a one-entry `locale === 'de' ? 'de-DE' : 'en-US'` map and
   * stackoverflow hardcoding `'en-US'`, so 13 and 14 of the 15 shipped locales
   * got an English footer date on those two. Both now build their parts with
   * `getTypstFooterParts` and the exclusion list is gone.
   *
   * ⚠️ **Three locales, not one, and each is here for a reason.** `fr` is the one
   * that separates `code` from `bcp47` and is *not* timeless's special case — the
   * first repair of this guard used `de`, which is exactly the locale timeless's
   * ternary handled correctly, so it could not reach the state. `de` stays as the
   * inverse pin: it was correct before for the wrong reason and must still be
   * correct now. `ja` is a non-Latin format, so a theme that formatted the date
   * with anything other than the CV locale's `bcp47` cannot pass by accident.
   */
  const DATE_LOCALES = [
    ['fr', 'fr-FR'],
    ['de', 'de-DE'],
    ['ja', 'ja-JP'],
  ] as const;

  it.each(
    FOOTER_THEMES.flatMap((themeId) =>
      DATE_LOCALES.map(([locale, bcp47]) => [themeId, locale, bcp47] as const),
    ),
  )('%s formats the footer date in the CV locale (%s)', (themeId, locale, bcp47) => {
    const markup = SERIALIZERS[themeId](
      withLocale(themeId, locale, { city: 'Berlin', countryCode: 'US' }),
    );

    expect(footerText(markup, dateIn(bcp47), today())).toBe(`[Berlin, US, ${dateIn(bcp47)}]`);
  });

  /**
   * ⚠️ The block above is a set of equalities, so its own vacuity mode is a
   * fixture whose locale never reaches the serializer — every theme would then
   * print the `en-US` date and every case would fail loudly, which is fine. The
   * mode it cannot see is the *opposite*: the three chosen locales all happening
   * to render identically to `en-US`, which would make the equality trivially
   * satisfiable by a hardcoded formatter. This pins that they do not.
   */
  it('the fixture locales really do render differently from en-US', () => {
    for (const [, bcp47] of DATE_LOCALES) {
      expect(dateIn(bcp47)).not.toBe(today());
    }
  });

  /**
   * ⚠️ The consequence of moving the guard, and the reason it moved in the same
   * change. `getCityCountry` returns `''` for a blank city **whatever the
   * country code says**, so the old `if (city || countryCode)` guard would have
   * pushed an empty part — the stray-separator defect, reintroduced by the
   * `getCityCountry` fix itself. The guard now tests the result.
   *
   * The six used to print `[DE, …]` here. All nine now drop the location, which
   * is what the three already did.
   */
  it.each(FOOTER_THEMES)('%s drops the location entirely when the city is blank', (themeId) => {
    for (const location of [BLANK_CITY, { city: '   ', countryCode: 'DE' }]) {
      const markup = serialize(themeId, location);

      expect(markup).not.toContain(`[DE, ${today()}]`);
      expect(markup).not.toMatch(DANGLING_LEADING);
    }
  });
});

/**
 * ⚠️ **The guard move is invisible in the markup, and that is why it gets its
 * own assertion here rather than a sentence in a docblock.**
 *
 * `getCityCountry` returns `''` for a blank city whatever the country code says,
 * so the old input-side guard (`if (city || countryCode)`) now admits an empty
 * part. Measured: restoring that guard while keeping the new producer leaves all
 * 66 cases above green, because `joinFooterParts` trims and filters the empty
 * string away before it can become a leading comma.
 *
 * So the markup cannot see it — and a defect one downstream filter away from
 * shipping is exactly the stray-separator defect, whose lesson was that relying
 * on a single `filter(Boolean)` is how the comma got out. This asserts the producer's
 * contract directly, before anything joins the parts.
 *
 * ⚠️ **The contract is the `auto` branch, not "every input", and the first draft
 * of this docblock claimed the latter — which the function contradicts.**
 * Measured by a reviewer: `footerLocation: '   '` yields `["   ", "<date>"]` and
 * `footerDate: '   '` yields `["<city>", "   "]`. Those are the design-panel
 * inputs `BLANK_INPUTS` above already names as reachable, and the
 * `explicitLocation`/`explicitDate` branches push them verbatim by design — a
 * user's literal footer text is not the producer's to trim. They rely on
 * `joinFooterParts`, and the nine-theme `BLANK_INPUTS` cases above are what
 * covers them.
 *
 * What this pins is the branch the `getCityCountry` fix changed: the `auto`
 * location can no longer contribute an empty part, whatever the location holds.
 */
describe('the auto location branch never emits an empty part', () => {
  const cvLocale = getThemeTranslations('en');

  it.each([
    ['a blank city with a country code', { city: '', countryCode: 'DE' }],
    ['a whitespace-only city with a country code', { city: '   ', countryCode: 'DE' }],
    ['an entirely empty location', { city: '', countryCode: '' }],
    ['a resolvable city', { city: 'Berlin', countryCode: 'DE' }],
    ['a city whose country the locale implies', { city: 'Berlin', countryCode: 'US' }],
  ])('emits no empty part for %s', (_label, location) => {
    const parts = getTypstFooterParts(withLocation('lunar', location), cvLocale);

    expect(parts).not.toContain('');
    expect(parts.every((part) => part.trim() !== '')).toBe(true);
  });

  /**
   * The positive control for the block above: every one of those inputs still
   * produces the date, so `parts` is never the empty array that would satisfy
   * `not.toContain('')` vacuously.
   */
  /**
   * ⚠️ The explicit branches, pinned as a **known state** rather than left out.
   * They push a user's literal footer text verbatim — which is right; trimming
   * someone's chosen footer string is not the producer's call — so they can and
   * do emit a whitespace-only part, and `joinFooterParts` is what makes that
   * safe. Stated here so the narrower contract above cannot be mistaken for the
   * broader one, and so a change that starts trimming them is a deliberate edit.
   */
  it.each([
    ['footerLocation', { footerLocation: '   ' }],
    ['footerDate', { footerDate: '   ' }],
  ])('leaves an explicit whitespace-only %s to joinFooterParts', (_label, params) => {
    const data = withLocation('lunar', { city: 'Berlin', countryCode: 'DE' });
    data.meta.theme.params = { ...data.meta.theme.params, ...params };

    expect(getTypstFooterParts(data, cvLocale).some((part) => part.trim() === '')).toBe(true);
    expect(joinFooterParts(getTypstFooterParts(data, cvLocale))).not.toMatch(DANGLING_LEADING);
    expect(joinFooterParts(getTypstFooterParts(data, cvLocale))).not.toMatch(DANGLING_TRAILING);
  });

  it('always produces the date part, so the absence assertions are live', () => {
    const parts = getTypstFooterParts(
      withLocation('lunar', { city: '', countryCode: '' }),
      cvLocale,
    );

    expect(parts).toEqual([today()]);
  });
});

/**
 * `showFooter: false` must still suppress the **signature box**, which is
 * not what `getTypstFooterParts` answers.
 *
 * ⚠️ **This is the redundant-looking check that is not redundant, and nothing
 * asserted it.** timeless's and stackoverflow's `footerMarkup` keep an early
 * `if (meta?.theme?.params?.showFooter === false) return ''` even though the
 * shared producer they now delegate to makes the same test. The producer returns
 * an empty array; an empty array does not suppress `basics.name`, which those two
 * themes print in a bordered box below the footer line. So the two checks answer
 * different questions and deleting the "duplicate" is a live regression.
 *
 * Measured on this branch: deleting both early returns leaves the **entire suite
 * green** while timeless and stackoverflow print the box on a résumé whose owner
 * has switched the footer off — `name-in-signature-box` flips false→true and the
 * markup grows by 225 and 257 bytes. The unification is what made the check look
 * redundant, so this is the guard for the code the unification wrote (a
 * structural argument nothing asserts is not a guard).
 *
 * ⚠️ The property is counted rather than pattern-matched, because the box's markup
 * is per-theme and one theme (plain) emits the same `stroke: (top: 1pt + …)` rule
 * elsewhere — a literal marker would have been theme-specific and would have read
 * as a false positive there. Every footer prints `basics.name` exactly once more
 * with the footer on than off. ⚠️ The control that used to sit beside it — the
 * three no-footer themes printing it the same number of times either way — is
 * gone with those themes' footerlessness; see the replacement below the block.
 */
describe('showFooter: false suppresses the whole footer, box included', () => {
  const nameCount = (themeId: ThemeId, showFooter: boolean): number => {
    const data = withLocation(themeId, { city: 'Berlin', countryCode: 'DE' });
    data.meta.theme.params = { ...data.meta.theme.params, showFooter };

    // ⚠️ **Two constant contributions have to go, or the control below cannot
    // fail.** The difference this block asserts is unaffected by either — a
    // constant cancels — but the non-vacuity case underneath compares against
    // floors, and both were met before any résumé content existed:
    //
    //   `#set document(title: "Ada Lovelace – Resume", author: "…")`
    //       two occurrences, on every theme, line 1.
    //   the cover letter
    //       `buildSingleItemResume` ships `coverLetter.enabled = true`, and its
    //       header, sender line and signature carry the name — three more, none
    //       of them suppressed by `meta.theme.params.showFooter` (the letter
    //       reads its own `layout.showFooter`).
    //
    // Measured: with both left in, blanking the name at every visible site in
    // `PlainSerializer` *and* forcing `showFooter: false` still scored 3 and 2,
    // and the control passed 12/12. Scoped to the résumé it scores 0 and fails.
    data.coverLetter.enabled = false;

    const body = SERIALIZERS[themeId](data)
      .split('\n')
      .filter((line) => !line.startsWith('#set document('))
      .join('\n');

    return body.split(NAME).length - 1;
  };

  it.each(FOOTER_THEMES)('%s prints the name once fewer with the footer off', (themeId) => {
    expect(nameCount(themeId, true) - nameCount(themeId, false)).toBe(1);
  });

  /**
   * ⚠️ **The control this block used to have is gone, and this is its
   * replacement.** It measured the same difference over the three themes that
   * emitted no footer and required **zero** — so the harness had somewhere that
   * `0` was the right answer, and a `showFooter` that had stopped reaching every
   * serializer would read 0 everywhere and be caught. All twelve emit a footer
   * now, so no such theme is left.
   *
   * The vacuity being guarded is "the counting channel is dead", and it is now
   * asserted per theme rather than borrowed from three exceptions: with the
   * footer on, every theme must emit the name at least once, so a difference of
   * 1 cannot be `0 - 0` dressed up.
   *
   * ⚠️ **The floor is 1, not 2, and swiss_grid is why.** The obvious reading —
   * "the header name plus the signature, so it must exceed 1" — holds on eleven
   * themes and fails on the twelfth: `SwissGridSerializer` splits `basics.name`
   * on `' '` and renders the parts as separate lines, so the full string never
   * appears in its header and the signature is its *only* occurrence. It scores
   * 1 with the footer on and 0 with it off. A floor of 2 would have been a
   * theme-specific assumption wearing a general name.
   */
  it.each(FOOTER_THEMES)('%s prints its name at all, so the counts are not zero', (themeId) => {
    expect(nameCount(themeId, true)).toBeGreaterThanOrEqual(1);
  });
});

/**
 * `getFooterDate`, the one implementation the four copies collapsed onto,
 * and its two fallbacks.
 *
 * ⚠️ **The `catch` is not reachable from stored résumé data, though it was first
 * described as reachable.** `bcp47` does not come from the file:
 * `getThemeTranslations` looks the whole `CVLocaleMetadata` up in `locales[code]`
 * and falls back to `locales.en` for any code it does not know, so an imported
 * `meta.theme.locale` of `'zz'` or `'de_DE'` yields `en-US`, not a malformed tag.
 * What *is* reachable is a typo in a **locale bundle** — fifteen hand-maintained
 * `theme_translations.bcp47` strings, fourteen of them owned by the translation
 * import, typed `string` and nothing more. `toLocaleDateString('de_DE')` throws
 * `RangeError`, which before this change would have taken timeless's and
 * stackoverflow's whole serializer down the moment they started reading the
 * field.
 *
 * So both halves are asserted: the guard works, **and** no shipped locale needs
 * it — which is the assertion that would actually fail if a bundle regressed.
 */
describe('getFooterDate is the one date rule, and it cannot throw', () => {
  const en = getThemeTranslations('en');

  it.each(Object.keys(locales) as LocaleCode[])(
    "%s's bcp47 is a tag Intl accepts, so the fallback stays unreached",
    (code) => {
      const { bcp47 } = getThemeTranslations(code);

      expect(bcp47).toBeTruthy();
      expect(Intl.DateTimeFormat.supportedLocalesOf([bcp47])).toEqual([bcp47]);
      expect(getFooterDate(getThemeTranslations(code))).toBe(dateIn(bcp47));
    },
  );

  /**
   * ⚠️ **These two are not one property, and only the first is the `catch`'s.**
   * Measured by deleting each guard in turn: with the `catch` gone `'de_DE'`
   * throws and this case fails, while `''` stays green because the `||` takes it
   * first (it is falsy); with the `||` gone `''` throws and is caught, so it
   * stays green again. The empty string is the one input both guards cover, which
   * is why it cannot be the case that pins either of them — see the nullish case
   * below for what the `||` alone is worth.
   */
  it.each([
    ['a malformed bcp47', 'de_DE'],
    ['an empty bcp47', ''],
  ])('falls back to en-US for %s', (_label, bcp47) => {
    expect(() => getFooterDate({ ...en, bcp47 })).not.toThrow();
    expect(getFooterDate({ ...en, bcp47 })).toBe(today());
  });

  /**
   * ⚠️ **What `|| 'en-US'` actually covers, and it needs a spy to see.** A
   * nullish `bcp47` does not throw: `toLocaleDateString(undefined)` resolves
   * against the **host's** default locale and returns a perfectly good date. On
   * this machine that is `en-US`, so a `toBe(today())` assertion would pass with
   * the `||` deleted and fail only on a contributor's French laptop. The
   * observable property is therefore the argument, not the result.
   */
  it('never hands toLocaleDateString a nullish locale, so the host default cannot leak in', () => {
    const spy = vi.spyOn(Date.prototype, 'toLocaleDateString');

    try {
      getFooterDate({ ...en, bcp47: undefined as unknown as string });

      expect(spy).toHaveBeenCalled();
      for (const [locale] of spy.mock.calls) expect(locale).toBe('en-US');
    } finally {
      spy.mockRestore();
    }
  });

  /**
   * The positive control: the function is not simply always `en-US`. Without
   * this, every fallback case above passes on a hardcoded implementation — which
   * is precisely what stackoverflow shipped.
   */
  it('is not hardcoded to en-US', () => {
    expect(getFooterDate(getThemeTranslations('ja'))).toBe(dateIn('ja-JP'));
    expect(getFooterDate(getThemeTranslations('ja'))).not.toBe(today());
  });

  /**
   * ⚠️ **It must read `bcp47` and not `code`, and no fixture built from a shipped
   * locale can tell the difference.** Both reviewer passes found this
   * independently and it is the sharpest hole in the round: every one of the
   * fifteen bundles ships `bcp47` as `<code>-<DEFAULT_REGION>`, and
   * `toLocaleDateString` resolves a bare language subtag to that same default —
   * so `dateIn(code)` and `dateIn(bcp47)` are **byte-identical for all fifteen**.
   * Measured: replacing `cvLocale.bcp47` with `cvLocale.code` left the entire
   * suite green (1661 passed), including the fifteen-locale case above, which
   * reads like a universal pin on this very property and is vacuous for it.
   *
   * ⚠️ The 27-row theme sweep cannot see it either, and the *only* thing that
   * failed under the bare-`code` mutation was the nullish-locale spy — by
   * accident, because `getThemeTranslations('en').code` is `'en'` and not
   * `'en-US'`. Weakening that spy to `toBeTruthy()` would have made the swap
   * completely invisible.
   *
   * A synthetic locale is what separates the fields: `code` and `bcp47` are
   * independent strings on `CVLocaleMetadata`, and `getThemeTranslations` already
   * lets them diverge — it copies `code: localeCode` **verbatim** while resolving
   * `bcp47` through `locales[code] || locales.en`, so any unknown stored locale
   * arrives with them mismatched today.
   *
   * ⚠️ Not academic: it becomes a shipped bug the first time a bundle takes a
   * non-default region. `pt` currently ships `pt-PT`, so a translation-import
   * correction to `pt-BR` is the trigger, and `en-GB`/`zh-TW` are the same shape.
   */
  it.each([
    ['a region the code does not imply', { code: 'pt', bcp47: 'en-GB' }],
    ['a language the code contradicts', { code: 'de', bcp47: 'ja-JP' }],
  ] as ReadonlyArray<readonly [string, { code: LocaleCode; bcp47: string }]>)(
    'formats from bcp47 rather than code, given %s',
    (_label, fields) => {
      expect(getFooterDate({ ...en, ...fields })).toBe(dateIn(fields.bcp47));
      expect(getFooterDate({ ...en, ...fields })).not.toBe(dateIn(fields.code));
    },
  );

  /**
   * The premise that makes the pair above discriminating: the two tags really do
   * render differently. If `en-GB` and `pt` happened to agree, the first row
   * would be as vacuous as the fifteen-locale case is.
   */
  it('the synthetic tags render differently from their codes', () => {
    expect(dateIn('en-GB')).not.toBe(dateIn('pt'));
    expect(dateIn('ja-JP')).not.toBe(dateIn('de'));
  });
});

/**
 * The footer deliberately **ignores** `meta.theme.params.addressSchema`.
 *
 * `formatFullAddress` follows the user's custom field selection; a footer does
 * not. It is a running header, not the contact block: `City, Country` is a fixed
 * convention there, and a user who excludes `city` from their letterhead is not
 * thereby asking for an empty footer. Confirmed with the owner on 2026-07-26.
 *
 * ⚠️ **Nothing asserted it, and an architect pass is what surfaced that.**
 * `getCityCountry`'s docblock argues the decision at length and the
 * whole reason it takes a `localeCode` rather than a `cvLocale` is to keep an
 * `addressSchema` out of reach — but a `getTypstFooterParts` that read one would
 * have been caught only incidentally, by `addressSchemaFallback.test.tsx`, a
 * file about a different property that happens to compare whole serializer
 * output. A structural argument nothing asserts is not a guard.
 *
 * ⚠️ It also cannot be asserted from `getThemeTranslations`, the fixture the
 * block above uses: that producer is structurally always `{ mode: 'default' }`,
 * so it could never observe the schema whatever the footer did. This drives the
 * real thing through the serializers, with a schema that excludes `city`
 * entirely — the one setting that would visibly empty the footer if it leaked.
 */
describe('the footer ignores addressSchema, on every theme that emits one', () => {
  const EXCLUDES_CITY = {
    mode: 'custom' as const,
    customFields: [{ field: 'countryCode' as const, separator: '' as const }],
  };

  it.each(FOOTER_THEMES)('%s still prints the city when the schema excludes it', (themeId) => {
    const data = withLocation(themeId, { city: 'Berlin', countryCode: 'DE' });
    data.meta.theme.params = { ...data.meta.theme.params, addressSchema: EXCLUDES_CITY };

    expect(footerText(SERIALIZERS[themeId](data), today())).toBe(`[Berlin, DE, ${today()}]`);
  });

  /**
   * The positive control over this block's own domain: the schema really is
   * stored and really does reach the *address* line, so the assertion above is
   * about the footer ignoring a live setting rather than an inert one.
   */
  it('the excluding schema does reach the header address line', () => {
    const data = withLocation('stackoverflow', { city: 'Berlin', countryCode: 'DE' });
    data.meta.theme.params = { ...data.meta.theme.params, addressSchema: EXCLUDES_CITY };
    const markup = SERIALIZERS.stackoverflow(data);

    expect(markup).not.toContain('12 Nowhere Lane, W1A 1AA Berlin, DE');
  });
});
