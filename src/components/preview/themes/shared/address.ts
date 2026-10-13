import type { AddressSchemaConfig, ResumeData } from '@/types/resume';

import { getThemeTranslations } from './translations';
import type { CVLocaleMetadata } from './types';

const EUROPEAN_POSTAL_CITY_COUNTRIES = new Set([
  'DE',
  'FR',
  'IT',
  'NL',
  'ES',
  'AT',
  'CH',
  'BE',
  'PT',
  'PL',
  'CZ',
  'SK',
  'HU',
  'RO',
  'GR',
  'SE',
  'NO',
  'DK',
  'FI',
  'BG',
  'TR',
]);

const CITY_REGION_POSTAL_COUNTRIES = new Set(['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'ZA']);

export function normalizeCountryCode(countryCode?: string): string {
  // `typeof` for the reason `formatFullAddress`'s `trimmed` uses it: a stored
  // `countryCode` can be any JSON value, and `?.` only guards nullish.
  return typeof countryCode === 'string' ? countryCode.trim().toUpperCase() : '';
}

function getLocaleCountryCode(localeCode: string = 'en'): string {
  const bcp47 = getThemeTranslations(localeCode).bcp47 || 'en-US';

  try {
    return new Intl.Locale(bcp47).region?.toUpperCase() || '';
  } catch {
    const match = bcp47.match(/-([A-Za-z]{2}|\d{3})(?:-|$)/);
    return match?.[1]?.toUpperCase() || '';
  }
}

function shouldHideCountryCode(countryCode: string, localeCode: string = 'en'): boolean {
  return !!countryCode && countryCode === getLocaleCountryCode(localeCode);
}

type AddressFieldValues = Record<
  NonNullable<AddressSchemaConfig['customFields']>[number]['field'],
  string
>;

/**
 * The `custom` mode formatter, or `null` when the stored schema **resolves
 * nothing** — no entry names a field this function knows about.
 *
 * ⚠️ `null` is not "the address came out empty". A schema that names real fields
 * whose values happen to be blank returns `''`, and that is deliberate: the user
 * chose those fields, and falling back would print the ones they excluded. Only
 * an *unusable* schema — empty, non-array, all-malformed, or all-unknown-key —
 * declines.
 *
 * ⚠️ **The empty list is the case that argument does not settle, and the thing
 * that settles it is the UI, not the principle.** Removing every field is a
 * *total* exclusion, and we respond by printing the *maximal* address — the
 * opposite of what "honour the exclusion" would say. What makes that right is
 * that the editor offers no "no address" intent: its empty state reads *"No
 * fields active. Click fields below to add them."*
 * (`design.address_schema_no_active_fields`), i.e. it frames empty as
 * incomplete. If a "hide my address" control is ever added, this branch has to
 * be revisited.
 *
 * ⚠️ `resolvePalette` is a **partial** precedent, not the same rule. An
 * unresolvable palette id is never user-expressible — the picker has no "no
 * palette" state — so falling back there cannot override a choice. Here it can.
 * Also note `sanitizeAddressSchema` drops unknown `field` keys on import, so an
 * imported all-unknown schema arrives as `customFields: []` and is
 * indistinguishable downstream from a deliberately emptied one.
 */
function formatCustomAddress(
  fieldValues: AddressFieldValues,
  schema: AddressSchemaConfig,
): string | null {
  // ⚠️ `Array.isArray`, not `|| []`. The whole reason this function distrusts
  // `cf.field` is that `addressSchema` can reach the store through `persist`
  // rehydration without passing `sanitizeAddressSchema` — and that licenses
  // arbitrary JSON, not merely an arbitrary string. A non-array `customFields`
  // threw `customFields.filter is not a function`, and a length check could not
  // catch it: `({}).length` is `undefined`, and `undefined === 0` is false.
  const customFields = Array.isArray(schema.customFields) ? schema.customFields : [];

  // ⚠️ `cf.field` is typed as a five-member union and is an arbitrary string at
  // runtime. Without `Object.hasOwn` this index reaches `Object.prototype`, and
  // **every one of its twelve own property names** is truthy, so the filter
  // passed them through and `.trim()` below threw — eleven of the twelve resolve
  // to a function, `__proto__` to `Object.prototype` itself, and none has a
  // `trim`. That killed the HTML preview and the PDF export together, on all
  // twelve themes, and it needed no address data at all: the throw was in the
  // filter, so `initialResumeState`'s empty location reached it too.
  //
  // The `hasOwn` branch not firing is equally what keeps an ordinary unknown
  // field (`'nope'`) falling out, which already worked and is the easy casualty
  // of fixing the prototype direction.
  const declaredFields = customFields.filter(
    (cf) => !!cf && typeof cf === 'object' && Object.hasOwn(fieldValues, cf.field),
  );

  // Nothing in the schema names a field this function knows: decline, so the
  // caller falls back to `default` mode rather than dropping the address.
  if (declaredFields.length === 0) return null;

  // ⚠️ The third condition, and it is not implied by the other two: this drops a
  // *declared* key whose value is empty. `hasOwn` alone lets that through and
  // leaks its separator. It is deliberately **not** part of the decline test
  // above — see this helper's doc block.
  //
  // ⚠️ **"Empty" means empty after trimming, and once it did not**, because
  // the caller handed this map raw `location` values. A whitespace-only city is
  // truthy, so it counted as *active*, contributed nothing, and leaked its
  // separator — the stray-separator defect in the custom schema path, one
  // producer over from the one fixed in `getCityCountry`. The values now arrive trimmed
  // from `formatFullAddress`'s single resolution point, so a blank field is
  // falsy here.
  const activeFields = declaredFields.filter((cf) => !!fieldValues[cf.field]);
  let result = '';

  for (let i = 0; i < activeFields.length; i++) {
    const { field, separator } = activeFields[i];
    // No `.trim()`: the one that used to be here trimmed a part's outer edges
    // *after* the activeness test above had already been fooled by it, which is
    // exactly the half a join-side filter cannot reach. Trimming at resolution
    // covers both, and a second trim here would be the decorative one.
    result += fieldValues[field];

    if (i < activeFields.length - 1) {
      // ⚠️ `typeof === 'string'`, not `?? ''`. `separator` is the untouched
      // sibling of `field` on the same rehydrated object and is equally
      // unvalidated — `persist` rehydration does not run `sanitizeAddressSchema`
      // (only the JSON-import path does, `validation.ts:483`), so this is
      // arbitrary JSON. `??` closed exactly two of the values it can hold:
      // a stored `{}` concatenated `[object Object]` and a number `7` its
      // digits, into the HTML preview and, through `coverLetterTypst.ts`, into
      // the exported PDF. Same failure class as the `undefined` this line was
      // first written for, one value type over. Found by review.
      result += typeof separator === 'string' ? (separator === ',' ? ', ' : separator) : '';
    }
  }

  return result.trim();
}

/**
 * Format the full address from location parts.
 * The address order follows the explicit country code when present,
 * otherwise it falls back to the CV locale's country.
 *
 * ⚠️ **Both the data and the formatting rule come from the caller.** The
 * schema used to be read off `useResumeStore.getState()` while `location` was an
 * argument, so any caller rendering a résumé that is not the store's — the
 * landing-page hero (`LandingPage/sections/components/HeroGraphic.tsx`) and the
 * HTML export (`utils/html-generator.tsx`) — formatted one résumé's data by
 * another's rule. It rides on `cvLocale` because that object is already the
 * shared channel on both output paths (`getBoundFormatters`, the same route
 * `boldHeaderWork` takes), so no call site needed a new argument.
 */
export function formatFullAddress(
  location: Partial<ResumeData['basics']['location']> | undefined,
  cvLocale: CVLocaleMetadata,
): string {
  if (!location) return '';
  // ⚠️ **Trimmed at resolution, not at the join.** `getCityCountry` had
  // the identical defect and was fixed at the producer for the same reason:
  // a join-side filter reaches a part's outer edges and not its *middle*, and the
  // middle is where the damage is. `{ postalCode: 'W1A 1AA', city: '  Berlin  ',
  // countryCode: 'DE' }` produced
  //
  // ```
  // 12 Nowhere Lane, W1A 1AA   Berlin  , DE
  // ```
  //
  // — two defects in one string: a double space from `[postalCode, city].join(' ')`,
  // and a space immediately before the `, DE` separator, which renders as
  // `Berlin , DE`. It reaches the header contact line and the cover letter's
  // sender-address block on **every** theme — two call sites in stackoverflow
  // (`:58` and `:123`; "three" came from a `grep -c` that counted the import line,
  // and stood in three places on this branch) — so this is the larger surface: the
  // footer prints `City, CC` and this prints the whole address.
  //
  // ⚠️ Every field, not `city` alone. The defect was first measured on the city,
  // because that is where it showed; `address`, `postalCode` and `region` sit in the
  // same joins and take a typed space identically. `countryCode` already went
  // through `normalizeCountryCode`, which trims — the odd one out, and the reason
  // the defect looked narrower than it was.
  //
  // ⚠️ Reachable without an import: `BasicsForm` does not trim on write and
  // `validation.ts` does not either (`s()` passes a present string through
  // unchanged), so one typed space is all it takes.
  // ⚠️ **`typeof`, not `value?.trim()`, and the first draft of this fix got it
  // wrong two blocks below where this file writes the rule down.** `?.` guards
  // only *nullish*, and a location field is arbitrary JSON: `validation.ts`'s
  // `s()` assigns a non-date value through unchanged, so
  // `{"basics":{"location":{"city":42}}}` reaches the store as the **number** 42.
  // Measured: `value?.trim()` threw `value?.trim is not a function` on all twelve
  // themes in **both** outputs — where `main` threw in the PDF only (via
  // `getCityCountry`, hardened below in the same change) and the HTML editor
  // preview rendered fine. So the trim turned a PDF-only crash into one that
  // takes the editor down too. Same shape as `separator`'s
  // `typeof === 'string'` at line 138: a comment saying "this is arbitrary JSON"
  // implies a type test, not a nullish test.
  const trimmed = (value?: string) => (typeof value === 'string' ? value.trim() : '');
  const address = trimmed(location.address);
  const postalCode = trimmed(location.postalCode);
  const city = trimmed(location.city);
  const region = trimmed(location.region);
  const countryCode = trimmed(location.countryCode);
  const localeCode = cvLocale?.code;
  // ⚠️ `?.` / `??` even though both are required on `CVLocaleMetadata`. The old
  // signature took a string with a default and could not throw at all; this one
  // dereferences twice, and `soft/helpers/typst/achievementsReferences.ts` had an
  // explicit `ctx.cvLocale?.code` guard that the migration deleted. `MistyHTML`
  // still writes `cvLocale?.sections`, so someone here already believed the value
  // can arrive nullish. Unreachable from the two in-repo producers; the cost is
  // one token and the failure it prevents is a throw inside the
  // formatter kills the preview and the PDF together on all twelve themes.
  const addressSchema = cvLocale?.addressSchema ?? { mode: 'default' as const };

  if (addressSchema.mode === 'custom') {
    // The `|| ''` fallbacks are gone with the raw reads: `trimmed` already
    // returns `''` for a missing field, so restating it here would be a second
    // rule for the same thing.
    const custom = formatCustomAddress(
      { address, postalCode, city, region, countryCode },
      addressSchema,
    );
    if (custom !== null) return custom;
  }

  // Default-mode formatting. Reached by 'default', an unresolvable 'custom'
  // schema, or any other value — including 'preset', which is **vestigial, not
  // implemented**: nothing writes that mode (the editor's preset buttons write
  // custom fields, `useAddressSchemaEditor.ts`) and `presetCountry` has no reader
  // outside `sanitizeAddressSchema`. ⚠️ An imported file *can* still carry
  // `mode: 'preset'`, which sanitisation preserves and this renders as default
  // for ever. Do not read this line as documenting a feature.
  const explicitCountryCode = normalizeCountryCode(countryCode);
  const effectiveCountryCode = explicitCountryCode || getLocaleCountryCode(localeCode);
  const hideCountryCode = shouldHideCountryCode(explicitCountryCode, localeCode);
  const visibleCountryCode = hideCountryCode ? '' : explicitCountryCode;

  if (EUROPEAN_POSTAL_CITY_COUNTRIES.has(effectiveCountryCode)) {
    const postalCity = [postalCode, city].filter(Boolean).join(' ');
    const trailingPart = visibleCountryCode || (hideCountryCode ? region : '');
    return [address, postalCity, trailingPart].filter(Boolean).join(', ');
  }

  if (CITY_REGION_POSTAL_COUNTRIES.has(effectiveCountryCode)) {
    const regionPostal = [region, postalCode].filter(Boolean).join(' ');
    return [address, city, regionPostal, visibleCountryCode].filter(Boolean).join(', ');
  }

  return [address, postalCode, city, region, visibleCountryCode].filter(Boolean).join(', ');
}

/**
 * The PDF footer's location line: `City, CC`, or bare `City` when the country is
 * absent or already implied by the CV locale.
 *
 * ⚠️ **`''` whenever `city` is blank, whatever `countryCode` says** — the third
 * outcome, and the one the callers depend on: `PdfFooterSection.tsx` falls back
 * to `getPlaceholderCity` on it.
 *
 * ⚠️ **"Blank" means blank after trimming, and once it did not.**
 * `countryCode` has always gone through `normalizeCountryCode`, which trims;
 * `city` did not, so `{ city: '   ', countryCode: 'DE' }` returned `'   , DE'`
 * — a *truthy* string that starts with the separator. That defeated the
 * stray-separator fix's first pass, which guarded the three serializer footers on
 * `if (getCityCountry(…))`: the producer can emit not just an empty part but a
 * part that opens on the separator, and both reviewer passes measured the same
 * stray comma on all **nine** footer-emitting themes. The city inputs
 * (`BasicsForm.tsx`) do not trim on write and neither does `validation.ts`, so
 * one typed space reaches here.
 *
 * Trimming at the producer is the fix that covers every caller at once,
 * including the header address line and the design panel — where a whitespace
 * city now correctly yields the placeholder instead of `   , DE`.
 *
 * ⚠️ `localeCode` has no default. It used to be `= 'en'`, and every call site
 * passes one, so the default's only reachable effect was to format a non-English
 * CV in English if someone ever forgot. A required parameter is a constraint; a
 * defaulted one is a suggestion.
 *
 * ⚠️ **Three call sites** (`PdfFooterSection.tsx`, `typstFooter.ts`,
 * `JavaScriptSerializer.ts`). This once said "five, up from four" after a cleanup deleted
 * timeless's and stackoverflow's direct calls — i.e. the number went stale in the
 * very change that edited those two files, in a sentence that says to re-derive
 * it rather than quote it. Re-derive it.
 *
 * ⚠️ **This deliberately ignores `meta.theme.params.addressSchema`, and that is a
 * decision rather than an omission.** `formatFullAddress` follows the
 * user's custom field selection; a footer does not. It is a running header, not
 * the contact block — `City, Country` is a fixed convention there, and a user who
 * excludes `city` from their letterhead is not thereby asking for an empty
 * footer. Confirmed with the owner on 2026-07-26; do not "fix" the asymmetry
 * without asking again.
 *
 * ⚠️ Named `getCityCountry`, not `getShortAddress`, for exactly that reason: a
 * "short address" reads as *the same address, shorter*, and this is a different
 * address. It also stops the next person threading `cvLocale` through here on the
 * assumption the two functions differ only in length — that would be the
 * 39-call-site `cvLocale` change, done a second time.
 *
 * ⚠️ It takes a `localeCode`, not the `cvLocale` its sibling now takes, because
 * the country-code suppression is all it needs and a `cvLocale` would carry an
 * `addressSchema` it must not read. Passing the object would make ignoring the
 * schema look like a bug at every call site.
 *
 * The previous doc block said it would "fall back to region/city only" when the
 * locale implies the country. It has never read `region`; the fallback is bare
 * `city`.
 */
export function getCityCountry(
  location: Partial<ResumeData['basics']['location']> | undefined,
  localeCode: string,
): string {
  // ⚠️ **`city` is trimmed, not merely tested trimmed, and the difference is a
  // shipped bug.** The first fix added `?.trim()` to the blank *test* and went on
  // returning the raw value, so `{ city: '  Berlin  ', countryCode: 'DE' }`
  // produced `'  Berlin  , DE'` — a space on the *interior* of the part, right
  // before the separator, which is precisely the stray-separator defect and
  // the one place `joinFooterParts` cannot reach (it trims the outer edges of a part,
  // not its middle). It renders into the PDF as `Berlin , DE`.
  //
  // ⚠️ It reached the three one-column footers and `PdfFooterSection` from that
  // fix onward, and the `getCityCountry` fix spread it to the six two-column
  // footers by routing them here — the fix for a disagreement reintroducing the
  // defect it was modelled on. Found by the reviewer pass on that fix; fixing it
  // at the producer covers all five call sites at once, which is the same
  // argument the stray-separator fix used for the trim in the test.
  //
  // `BasicsForm` does not trim on write and neither does `validation.ts`, so one
  // typed space is all it takes.
  const city = typeof location?.city === 'string' ? location.city.trim() : '';
  if (!city) return '';
  const cc = normalizeCountryCode(location?.countryCode);

  if (!cc) {
    return city;
  }

  if (shouldHideCountryCode(cc, localeCode)) {
    return city;
  }

  return `${city}, ${cc}`;
}
