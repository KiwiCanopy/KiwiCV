import { getCityCountry } from '@/components/preview/themes/shared/address';
import { getPlaceholderCity } from '@/components/preview/themes/shared/levels';
import type { CVLocaleMetadata } from '@/components/preview/themes/shared/types';
import { escapeTypst } from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import { footerPrintsCityCountry } from '@/utils/visibility';

/**
 * The one place footer parts become a line. `parts.join(', ')` was written out
 * four times — here and in timeless, stackoverflow and javascript — and every
 * copy trusted its parts to be non-blank.
 *
 * ⚠️ **`filter(Boolean)` is not enough, and that is the whole reason this exists.**
 * A whitespace-only part is truthy, survives it, and produces exactly
 * the defect: `[   , July 26, 2026]`, which Typst renders as a leading comma.
 * Measured on **nine** footer-emitting themes from two reachable inputs — a
 * space typed into the design panel's Location field (`PdfFooterSection.tsx`
 * stores `val || 'auto'` untrimmed, `'   '` is truthy, and every serializer
 * tests `footerLocation === ''` with `===`) and the same in its Date field.
 * Found by both reviewer passes after the stray-separator fix's first pass, which
 * closed the blank-city producer and left these three branches alone.
 *
 * ⚠️ Not `joinBlocks` (`themes/shared/visibility.ts`): that helper documents
 * that a whitespace-only block is deliberately **not** empty, because its
 * separator is a Typst spacer where whitespace can be real content. A comma has
 * no such reading, so the footer needs its own rule, and this is it — one
 * implementation, not four: a copy per theme is how the footers came to disagree
 * in the first place.
 */
export function joinFooterParts(parts: readonly string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * The footer's date, in the CV locale. **The one implementation.**
 *
 * It used to be four, and two of them were wrong:
 *
 * ```
 * getTypstFooterParts  cvLocale.bcp47                        all 15 locales
 * javascript           cvLocale.bcp47 || 'en-US'             all 15 locales
 * timeless             locale === 'de' ? 'de-DE' : 'en-US'   2 of 15
 * stackoverflow        'en-US'                               1 of 15
 * ```
 *
 * timeless's is the instructive one: a hand-written locale→bcp47 map with exactly
 * **one** entry, sitting two files from `CVLocaleMetadata.bcp47`, which is the
 * real map for all fifteen. The section-inventory drift shape on the locale axis.
 * The repo ships `bg de en es fr it ja nl pl pt ru sv tr uk zh`, so a French,
 * Japanese or Polish CV printed an English footer date on those two themes and a
 * localised one on the other seven.
 *
 * ⚠️ **The `catch` is the one that matters, and it is not about imported data.**
 * `bcp47` never comes from the résumé: `getThemeTranslations` looks the whole
 * `CVLocaleMetadata` up in `locales[code]` and falls back to `locales.en` for any
 * code it does not know, so a stored `meta.theme.locale` of `'de_DE'` yields
 * `en-US` rather than a malformed tag. What can produce one is a typo in a
 * **locale bundle** — fifteen hand-maintained `theme_translations.bcp47` strings,
 * fourteen of them written by the translation import, typed `string` and nothing
 * more. `toLocaleDateString('de_DE')` throws `RangeError`, and neither timeless
 * nor stackoverflow had a `catch`: giving them the locale without this helper
 * would have traded an English date for a serializer that dies.
 *
 * ⚠️ **`|| 'en-US'` is javascript's, and the two guards overlap on exactly one
 * input.** Measured by deleting each in turn:
 *
 * ```
 *              'de_DE'        ''             undefined
 * catch only   en-US          en-US (throws) HOST DEFAULT LOCALE
 * || only      RangeError     en-US          en-US
 * both         en-US          en-US          en-US
 * ```
 *
 * `''` is covered twice — it is falsy, so the `||` takes it, and it would throw
 * and be caught if the `||` were gone. The malformed tag is the `catch`'s alone.
 * A **nullish** `bcp47` is the `||`'s alone, and it is the reason the `||` stays
 * despite the type forbidding it: `toLocaleDateString(undefined)` does not throw,
 * it resolves against the *host's* default locale, so the failure is a French
 * date on an English CV on one reader's machine — quiet, where the other two are
 * loud.
 *
 * ⚠️ Takes the whole `CVLocaleMetadata` rather than a `bcp47` string, for the
 * reason its caller does — the adjacent-string rule (`.claude/rules/testing.md`):
 * `code` and `bcp47` are adjacent strings on the same object and a swap would
 * compile.
 *
 * ⚠️ **That closes the swap at the CALL SITE and not the field read in here, and
 * both reviewer passes found the difference.** Reading `cvLocale.code` on the line
 * below compiles, and no fixture built from a shipped locale can see it: all
 * fifteen bundles set `bcp47` to `<code>-<DEFAULT_REGION>`, and
 * `toLocaleDateString` resolves a bare language subtag to that same default — so
 * `dateIn(code)` and `dateIn(bcp47)` are **byte-identical for all fifteen**.
 * Measured: the bare-`code` swap left the whole suite green apart from the
 * nullish-locale spy, which caught it only by accident (`'en' !== 'en-US'`), and a
 * `(bcp47 && code)` shim was green outright. The guard is now two synthetic
 * locales whose `code` and `bcp47` genuinely disagree
 * (`footerLocation.test.ts`). It stops being hypothetical the first time a bundle
 * takes a non-default region: `pt` ships `pt-PT` today, and `pt-BR`, `en-GB` and
 * `zh-TW` are all one translation-import correction away.
 */
export function getFooterDate(cvLocale: CVLocaleMetadata): string {
  const format = { year: 'numeric', month: 'long', day: 'numeric' } as const;

  try {
    return new Date().toLocaleDateString(cvLocale.bcp47 || 'en-US', format);
  } catch {
    return new Date().toLocaleDateString('en-US', format);
  }
}

/**
 * ⚠️ **Takes the whole `CVLocaleMetadata`, not a `bcp47` string.**
 *
 * It used to compose the location itself as
 * `[city, countryCode].filter(Boolean).join(', ')`, bypassing `getCityCountry`
 * and therefore both `normalizeCountryCode` (trim + upper) and
 * `shouldHideCountryCode` (drop a code the CV locale already implies). Measured
 * across all twelve themes with `{ city: 'Berlin', countryCode: 'US' }` under an
 * `en` CV: the three one-column footers printed `[Berlin, …]` and these six
 * printed `[Berlin, US, …]`. Same résumé, two behaviours, chosen by the theme
 * picker. A stored `'  de '` reached these six verbatim, lowercase and padded.
 *
 * ⚠️ The parameter is the locale **object** rather than a second `string` beside
 * `bcp47`, and that is the adjacent-string rule: two adjacent `string` parameters
 * are interchangeable by definition, and a `getTypstFooterParts(data, code,
 * bcp47)` swap would compile, print the date in the wrong locale and suppress the
 * wrong country code. Every one of the six callers already holds this object;
 * each also dropped its own `|| 'en-US'`, since `bcp47` is required on the type.
 *
 * ⚠️ **`getCityCountry`'s own docblock argues against being handed a
 * `cvLocale`** — it must not read `addressSchema`, and taking the object would
 * make that look like a bug at its call sites. That reasoning is about
 * `getCityCountry`, and it still holds: this function unpacks `.code` and passes
 * the string down. A footer builder that already needs `bcp47` for its date is
 * the right place for the object to stop.
 *
 * ⚠️ **All nine footers, not six — and all TWELVE since elegant, plain and plain2
 * were given the footer the Typst migration dropped.** `JavaScriptSerializer`
 * kept a copy of this branch structure line for line — the same three-way
 * `footerLocation === 'auto' || undefined || ''` test, the same
 * `explicitLocation`/`explicitDate` expressions, the same `getCityCountry` and
 * `getFooterDate` calls — differing in the one sub-expression the
 * `placeholderCity` option now carries. Two copies of a branch structure is how
 * the stray-separator and `getCityCountry` fixes played out: the next refinement
 * to `footerLocation` lands in one and not the other.
 * `renderTypstSignatureFooter`'s markup is still hand-rolled by timeless and
 * stackoverflow — a different function.
 */
export interface TypstFooterPartsOptions {
  /**
   * Fall back to the CV locale's placeholder city when the résumé has no
   * resolvable one. **javascript only**, and it is a real product difference
   * rather than an accident: timeless, stackoverflow and the six two-column
   * footers all print nothing there, deliberately.
   */
  placeholderCity?: boolean;
}

export function getTypstFooterParts(
  data: ResumeData,
  cvLocale: CVLocaleMetadata,
  options?: TypstFooterPartsOptions,
): string[] {
  const { basics, meta } = data;
  if (meta?.theme?.params?.showFooter === false) return [];

  const parts: string[] = [];
  const footerLocation = meta?.theme?.params?.footerLocation;
  const footerDate = meta?.theme?.params?.footerDate;
  const explicitLocation =
    footerLocation && footerLocation.toLowerCase() !== 'none' && footerLocation !== 'auto';

  if (footerPrintsCityCountry(meta?.theme?.params)) {
    // ⚠️ **The guard tests the RESULT, not the inputs**, and moving it is part of
    // the same change rather than tidying. `if (city || countryCode)` was correct
    // only for a producer that emits `countryCode` alone; `getCityCountry`
    // returns `''` for a blank city *whatever the country code says*, so the old
    // guard would now admit an empty part — which is the stray-separator defect,
    // reintroduced by the `getCityCountry` fix. `joinFooterParts` would swallow the
    // comma, but the mismatch it hides is the bug.
    //
    // ⚠️ **javascript's copy pushed the placeholder UNGUARDED, and
    // keeping the guard here is the one behavioural difference of the merge.**
    // It is inert as things stand — `getPlaceholderCity` ends in `|| 'London'`,
    // so it cannot return `''` — and it is kept rather than dropped because the
    // ungated `push` is precisely the stray-separator defect waiting on a
    // locale bundle whose `placeholders.basics.city` is blank. Measured:
    // markup byte-identical on all twelve themes.
    const cityCountry = getCityCountry(basics.location, cvLocale.code);
    const resolved =
      cityCountry || (options?.placeholderCity ? getPlaceholderCity(cvLocale.code) : '');
    if (resolved) {
      parts.push(resolved);
    }
  } else if (explicitLocation) {
    parts.push(footerLocation);
  }

  const explicitDate = footerDate && footerDate.toLowerCase() !== 'none' && footerDate !== 'auto';
  if (footerDate === 'auto' || footerDate === undefined || footerDate === '') {
    parts.push(getFooterDate(cvLocale));
  } else if (explicitDate) {
    parts.push(footerDate);
  }

  return parts;
}

interface TypstSignatureFooterOptions {
  showFooter?: boolean;
  parts: string[];
  name?: string;
  fontScale: number;
  textColor?: string;
  borderColor?: string;
  textSize?: number;
  width?: number;
  topGap?: number;
  textToLineGap?: number;
  lineInsetTop?: number;
  /**
   * Padding on the footer block itself, in pt before `fontScale`. stackoverflow
   * is the only caller: `inset: (top: 20pt, left: 30pt)`, which is what kept it
   * hand-rolling the block.
   *
   * ⚠️ `insetTop` adds to the unbreakable unit's height, so it spends the same
   * page-flow budget the three gaps above do — see the geometry note on
   * `renderTypstSignatureFooter`. `insetLeft` does not.
   *
   * ⚠️ There is no `insetX`. The parameter existed and **no caller ever passed
   * it** — seven call sites while it lived, ten now — so it emitted a constant
   * `inset: (x: 0pt)`. That no-op was the whole difference between this
   * renderer's output and timeless's copy *when that duplication was first noticed*, at which
   * point the defaults were still 40/20/10; by the time it was worked, later
   * changes had moved them to 28/24/6 and three numbers differed as well. Mixing an `x`
   * key with `left` in one Typst inset dictionary is also a resolution question
   * nobody needs to answer.
   *
   * ⚠️ Deleting the no-op broke `columnSpacers.test.ts`, whose footer exemption
   * was anchored on `breakable: false,` — with the comma the inset argument
   * supplied. Bytes that are inert in the output language are not inert in the
   * tests that read it.
   */
  insetTop?: number;
  insetLeft?: number;
}

/**
 * ⚠️ **`topGap`, `textToLineGap` and `lineInsetTop` are page-break geometry, not
 * only styling.** The `#v(topGap)` and the `#block` below it are one
 * unbreakable unit, so their combined height is the amount of remaining flow the
 * footer demands: fall short of it and the whole unit moves to a new page,
 * taking its gap with it. The previous defaults (40/20/10) demanded ~91pt out of
 * a ~780pt body, so ≈12% of arbitrary résumé lengths exported a final page
 * carrying nothing but the date line and the signature rule — while the real
 * last page kept a large empty bottom *and* lost its footer.
 *
 * ⚠️ **`textToLineGap` is the box a human signs in.** The rule is a signature
 * line, and the printed name below it captions the signature. An earlier pass
 * shrank this to 12pt — one line of 9pt text — purely to buy page-break
 * headroom, and the footer became unsignable. That is the mistake this docblock
 * exists to prevent repeating: the gap is a functional dimension, not spacing.
 *
 * ⚠️ **The three are worth reading as one budget with a fixed total.** Their sum
 * is the demand, so air can be moved between them at no page-break cost — which
 * is how these numbers were set. Design review proposed 16/36/6 arguing 36pt
 * (0.5in) from the physical height of a signature; reviewed against rendered
 * output the owner found the signing gap far too wide and the lead-in too tight,
 * and 28/24/6 is that same 58pt redistributed. **Where a design estimate and the
 * owner's eye on real output disagreed, the eye won** — recorded rather than
 * quietly dropped, because the 0.5in figure reads as authoritative and is not.
 *
 * `lineInsetTop` stays tight at 6 on its own reasoning: a caption belongs close
 * to what it captions. Under future cost pressure spend `topGap` first — it is
 * the only one with no functional floor, and a horizontal rule already announces
 * "different zone" more strongly than whitespace does.
 *
 * Demand is 58pt, against 70pt originally and 44pt at an earlier pass. It
 * narrows the class rather than eliminating it — a résumé ending inside the
 * remaining 58pt still orphans its footer. The two remedies that would eliminate
 * it are both unavailable as the layout stands: `#place(bottom + right)` inside
 * a column cell anchors to the page where the cell *starts*, and
 * self-suppression frees the space that caused the break, which re-admits the
 * footer. Reserving via `#set page(footer:)` would work but shrinks the body on
 * *every* page, making some one-page CVs two.
 *
 * ⚠️ **skyline and foggy pass all three explicitly and must be edited with
 * these.** They were left alone at that earlier pass because `topGap` was an
 * aesthetic per-theme choice. Signing room is not: a theme pinned at
 * `textToLineGap: 12` is not making a different design choice, it is shipping an
 * unsignable footer. A signature's height is a property of the hand writing it,
 * not of the rule's width, so their narrower `width: 160` buys no reduction.
 * `footerGeometry.test.ts` pins all three equal across the two families.
 */
export function renderTypstSignatureFooter({
  showFooter,
  parts,
  name,
  fontScale,
  textColor = 'rgb("#888888")',
  borderColor = 'rgb("#cccccc")',
  textSize = 9,
  width = 180,
  topGap = 28,
  textToLineGap = 24,
  lineInsetTop = 6,
  insetTop = 0,
  insetLeft = 0,
}: TypstSignatureFooterOptions): string {
  if (showFooter === false || (!joinFooterParts(parts) && !name)) return '';

  const inset = [
    insetTop ? `top: ${insetTop * fontScale}pt` : '',
    insetLeft ? `left: ${insetLeft * fontScale}pt` : '',
  ].filter(Boolean);

  return `
#v(${topGap * fontScale}pt)
#block(width: 100%, breakable: false${inset.length ? `, inset: (${inset.join(', ')})` : ''})[
  #align(right)[
    ${joinFooterParts(parts) ? `#text(size: ${textSize * fontScale}pt, fill: ${textColor})[${escapeTypst(joinFooterParts(parts))}]\n    #v(${textToLineGap * fontScale}pt)` : ''}
    ${
      name
        ? `#box(width: ${width * fontScale}pt, stroke: (top: 1pt + ${borderColor}), inset: (top: ${lineInsetTop * fontScale}pt))[
      #align(center)[
        #text(size: ${textSize * fontScale}pt, fill: ${textColor})[${escapeTypst(name)}]
      ]
    ]`
        : ''
    }
  ]
]
`;
}
