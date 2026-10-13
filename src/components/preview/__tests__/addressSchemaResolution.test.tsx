import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { getBoundFormatters } from '@/components/preview/themes/shared';
import { formatFullAddress, getCityCountry } from '@/components/preview/themes/shared/address';
import { ALL_ADDRESS_FIELD_KEYS } from '@/features/dashboard/design/helpers/addressSchemaTypes';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { describe, expect, it } from 'vitest';

/**
 * How a stored **address field key** becomes a formatted address — the
 * address half of the lookup class `paletteResolution.test.tsx` covers on the
 * palette axis. Same source of untrusted strings, worse failure: this one
 * **throws**.
 *
 * `meta.theme.params.addressSchema.customFields[].field` is typed as a
 * five-member union and is an arbitrary string at runtime — `validation.ts`
 * lists only five keys under `theme.params` (`schemas`, `:490`), so
 * `addressSchema` is stripped on the JSON-import path and reaches the store
 * through `persist` rehydration instead. `address.ts` indexed a plain object
 * literal with it, and every one of `Object.prototype`'s **twelve** own
 * property names is truthy, so the `!!fieldValues[cf.field]` filter passed them
 * straight through to `.trim()`.
 *
 * ⚠️ Measured on `main` before the fix — the defect was first recorded as two
 * keys and one output, and both were understatements:
 *
 * - **All twelve** prototype names threw, not just `constructor` and
 *   `__proto__`. There is no `toLowerCase()` on this path, so the narrowing
 *   that leaves exactly two survivors elsewhere in this repo does not apply.
 * - **Both outputs on all twelve themes** died — the editor preview and the PDF
 *   export together. ⚠️ Not "24 files": twelve `*Serializer.ts` call it directly
 *   but only ten `*HTML.tsx` do, because plain and stackoverflow reach it through
 *   `helpers/HTML/MainHeader.tsx`; `shared/coverLetterTypst.ts` and soft's
 *   `helpers/typst/achievementsReferences.ts` are two more. The effect is
 *   theme-complete; the file count in the first draft of this comment was not.
 *   ⚠️ This also listed misty's `helpers/HTML/side/Contact.tsx` as a route until
 *   it was deleted as unreachable. The **count** was unaffected — `MistyHTML`
 *   calls `formatFullAddress` directly — but a route in an inventory this
 *   comment exists to pin should not have outlived the file.
 *
 * The control is the point: `'nope'` and `''` already produced the right answer
 * before the fix, so they are the easy casualty of guarding the prototype
 * direction (the both-halves rule, `.claude/rules/testing.md`).
 *
 * ⚠️ A positive control is what stops this being vacuous: a *declared* field
 * must still reach the output. Without it, a "fix" that dropped every custom
 * field would satisfy every assertion above outright.
 */

/** Not a hand-written list — the twelve names a raw index actually resolves to. */
const PROTOTYPE_KEYS = Object.getOwnPropertyNames(Object.prototype);

/**
 * The declared keys, **imported rather than restated**. A hand-written copy here
 * was a seventh restatement of the five, in a file whose own doc block argues
 * `PROTOTYPE_KEYS` must be derived so it cannot drift — the review caught the
 * inconsistency. `ALL_ADDRESS_FIELD_KEYS` is now `as const satisfies` plus an
 * `extends` check, so both drift directions are build errors at its declaration.
 */
const DECLARED_FIELDS: readonly string[] = ALL_ADDRESS_FIELD_KEYS;

/**
 * Every key that must fall out of the filter rather than reach `.trim()`.
 *
 * Two prototype representatives rather than all twelve: the unit block below
 * covers the full set, `Object.hasOwn` cannot treat them differently, and this
 * list is multiplied by twelve themes and two outputs. The declared-but-empty
 * case gets its own block instead — `buildSingleItemResume` populates all five
 * location fields, so it cannot be expressed as another entry here.
 */
const FALLING_THROUGH = ['constructor', '__proto__', 'nope', ''];

/**
 * A custom schema whose first field is `field` and whose second is always
 * `city`. The trailing `city` is deliberate, twice over: it keeps the address
 * non-empty for every key under test, so "the output is empty" can never be
 * mistaken for "the key fell through" — and it is also what keeps
 * every fixture here *resolvable*, so none of them reaches the fall-back-to-
 * default path. That path is out of reach in this file by construction and is
 * covered in `addressSchemaFallback.test.tsx`.
 *
 * ⚠️ No store write. `formatFullAddress` reads the schema off the `cvLocale`
 * built from this résumé, so the fixture is the whole input.
 */
const withAddressField = (themeId: ThemeId, field: string, blankField?: string): ResumeData => {
  const data = buildSingleItemResume(themeId);
  if (blankField) {
    // Keyed, not `Record<string, string>` — the diff's own argument is that
    // widening to a string index is how drift detection gets lost.
    data.basics.location[blankField as 'countryCode'] = '';
  }
  data.meta.theme.params = {
    ...data.meta.theme.params,
    addressSchema: {
      mode: 'custom',
      customFields: [
        { field, separator: ',' },
        { field: 'city', separator: '' },
      ] as never,
    },
  };
  return data;
};

/** The same three props `ResumeHTML.tsx` passes, with the formatters stubbed. */
const renderTheme = (themeId: ThemeId, field: string, blankField?: string): string =>
  renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data: withAddressField(themeId, field, blankField),
      formatCVDate: (value?: string) => value || '',
      formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
    }),
  );

const serializeTheme = (themeId: ThemeId, field: string, blankField?: string): string =>
  SERIALIZERS[themeId](withAddressField(themeId, field, blankField));

describe('formatFullAddress with a custom address schema', () => {
  const location = { address: '10 Downing St', postalCode: 'SW1A', city: 'London', region: 'GL' };

  const format = (field: string) =>
    formatFullAddress(location, getBoundFormatters(withAddressField('plain', field)).cvLocale);

  /** Drives the schema shape directly, for the malformed-value cases. */
  const formatWith = (customFields: unknown) => {
    const data = buildSingleItemResume('plain');
    data.meta.theme.params = {
      ...data.meta.theme.params,
      addressSchema: { mode: 'custom', customFields } as never,
    };
    return formatFullAddress(location, getBoundFormatters(data).cvLocale);
  };

  it.each(PROTOTYPE_KEYS)('drops the prototype key %s instead of throwing', (key) => {
    expect(format(key)).toBe('London');
  });

  it('drops an ordinary unknown key, and an empty one', () => {
    expect(format('nope')).toBe('London');
    expect(format('')).toBe('London');
  });

  // ⚠️ The third half, and it is not implied by the other two. `Object.hasOwn`
  // alone passes every assertion in this file except this one: `countryCode` is
  // declared on `fieldValues` but empty on this location, so dropping the
  // `!!fieldValues[...]` half keeps it in `activeFields` and leaks its
  // separator. Found by mutation, not by reading.
  it('drops a declared field whose value is empty', () => {
    expect(location).not.toHaveProperty('countryCode');
    expect(format('countryCode')).toBe('London');
  });

  /**
   * ⚠️ The stored value licenses arbitrary JSON, not merely an arbitrary string.
   * `validation.ts` *strips* `addressSchema` rather than narrowing it, so what
   * arrives from `persist` has no validated shape at all — and the review found
   * these still throwing one line from the key that was fixed:
   *
   * - a `null` entry → `Cannot read properties of null (reading 'field')`
   * - a non-array `customFields` → `customFields.filter is not a function`,
   *   which the `length === 0` check cannot catch (`({}).length` is `undefined`)
   * - a missing `separator` → the literal string `undefined` concatenated into
   *   the preview and, through `coverLetterTypst.ts`, into the exported PDF
   */
  it('survives a malformed customFields entry', () => {
    expect(formatWith([null, { field: 'city', separator: '' }])).toBe('London');
    expect(formatWith([{ field: 'city', separator: '' }, undefined])).toBe('London');
    // ⚠️ A `customFields` that resolves *nothing* no longer yields
    // `''` — it declines and the caller formats in `default` mode. Compared
    // against `{ mode: 'default' }` rather than a literal so it does not restate
    // the default formatter's output. `addressSchemaFallback.test.tsx` owns the
    // property; these two stay here because they are the malformed *shapes*.
    const asDefault = formatFullAddress(
      location,
      getBoundFormatters(buildSingleItemResume('plain')).cvLocale,
    );
    expect(asDefault).not.toBe('');
    expect(formatWith('not-an-array')).toBe(asDefault);
    expect(formatWith({})).toBe(asDefault);
  });

  it('never emits the literal string undefined for a missing separator', () => {
    const out = formatWith([{ field: 'address' }, { field: 'city', separator: '' }]);
    expect(out).not.toContain('undefined');
    expect(out).toBe('10 Downing StLondon');
  });

  // The positive control. A fix that emptied `activeFields` would pass every
  // assertion above and fail this one.
  it('still renders a declared field', () => {
    expect(format('address')).toBe('10 Downing St, London');
    expect(format('postalCode')).toBe('SW1A, London');
  });

  /**
   * The premise the block above rests on: every prototype name must be
   * *outside* the five declared field keys, or `toBe('London')` would be
   * asserting the wrong thing for whichever one overlapped.
   *
   * ⚠️ Deliberately no `toHaveLength(12)`. Five of the twelve are Annex B, so a
   * count pins this suite to a V8 constant and would fail on an engine change
   * rather than on a KiwiCV change — which is also why `PROTOTYPE_KEYS` is
   * derived rather than restated.
   */
  it('has no prototype name colliding with a declared address field', () => {
    expect(PROTOTYPE_KEYS.filter((key) => DECLARED_FIELDS.includes(key))).toEqual([]);
    expect(PROTOTYPE_KEYS.length).toBeGreaterThan(0);
    expect(PROTOTYPE_KEYS).toContain('constructor');
    expect(PROTOTYPE_KEYS).toContain('__proto__');
  });
});

/**
 * Both outputs, because they are separate call sites and failed separately.
 * Equality against the unknown-key output rather than a string assertion: it
 * needs no knowledge of which fields a theme prints, and it does not drift when
 * a theme changes its address markup.
 */
describe.each([
  ['serializer', serializeTheme],
  ['HTML component', renderTheme],
] as const)('every %s survives a stored address field key', (_kind, render) => {
  it.each(ALL_THEME_IDS)('%s drops an unresolvable field instead of throwing', (themeId) => {
    const baseline = render(themeId, 'nope');

    // No separate `not.toThrow()` — a throw fails `toBe` just as loudly, and
    // this loop is already multiplied by twelve themes and two outputs.
    for (const field of FALLING_THROUGH) {
      expect(render(themeId, field)).toBe(baseline);
    }
  });

  /**
   * The declared-but-empty case at output level. `countryCode` is populated on
   * `buildSingleItemResume`, so it has to be blanked explicitly — which is why
   * it is not simply another entry in `FALLING_THROUGH`.
   *
   * ⚠️ This is the half `Object.hasOwn` alone does not cover, and the half the
   * issue did not mention. It exists here as well as at unit level because a
   * leaked separator is what actually reaches the user's PDF.
   */
  it.each(ALL_THEME_IDS)('%s drops a declared field whose value is empty', (themeId) => {
    expect(render(themeId, 'countryCode', 'countryCode')).toBe(
      render(themeId, 'nope', 'countryCode'),
    );
  });

  // Positive control, same reasoning as the unit-level one: without it a
  // serializer that emitted no address at all would pass the tests above.
  it.each(ALL_THEME_IDS)('%s still emits a declared field', (themeId) => {
    expect(render(themeId, 'address')).not.toBe(render(themeId, 'nope'));
  });
});

/**
 * `formatFullAddress` did not trim its fields, on the larger of the two
 * address surfaces.
 *
 * ```
 * { address: '12 Nowhere Lane', postalCode: 'W1A 1AA', city: '  Berlin  ', countryCode: 'DE' }
 * → "12 Nowhere Lane, W1A 1AA   Berlin  , DE"
 * ```
 *
 * Two defects in one string: a **double space** where
 * `[postalCode, city].join(' ')` meets an untrimmed city, and a space on the
 * **interior** of the part immediately before the separator, which renders as
 * `Berlin , DE`. This is the footer's stray-separator defect at the **fourth**
 * producer of it — `getCityCountry` was fixed at the producer by a reviewer pass,
 * `coverLetterTypst` and lunar's sidebar contact block already trimmed, and this
 * one did not. (Both reviewer passes flagged "third": the sentence enumerates
 * three producers before "this one", and `footerLocation.test.ts` already calls
 * `coverLetterTypst` the third. Off by one under any reading.)
 *
 * ⚠️ And there is a **fifth and a sixth**, both in `placeholder-fallback.ts` and
 * both fixed in the same change: `generateJSONWithPlaceholders`'s twelve
 * `|| placeholder(…)` guards, which this fix turned from visibly wrong into
 * *silently* wrong, and `isResumeEmpty`'s nine `?.trim()` reads, which threw
 * outright on a non-string field. The property is "a guard on a stored string must
 * trim and must type-test", and the producer count is what you get by grepping for
 * that rather than by reading an issue.
 *
 * ⚠️ **Found by a case written for the footer fix, which failed in the header
 * rather than the footer it was aimed at**: a first draft asserted `not.toContain('Berlin  ,')`
 * over the whole markup and failed on all nine footer themes *after* the footer
 * was fixed. That is why `footerLocation.test.ts` extracts the footer's own
 * bracket group, and why this belongs here.
 *
 * ⚠️ **Every field, not `city`.** The defect was first measured on the city,
 * because that is where it showed; `address`, `postalCode` and `region` sit in the same
 * joins. `countryCode` was already trimmed by `normalizeCountryCode`, which is
 * exactly why the defect looked narrower than it was — so it is included below as
 * the field that must not *change* behaviour.
 *
 * ⚠️ **Two of the five per-field default rows were insensitive by construction**
 * until the branch split below. With `countryCode: 'DE'` the formatter takes the
 * postal/city join, which reads `region` only when the CV locale implies the code
 * — so `region` was never read at all, and `countryCode` is trimmed upstream.
 * Measured: trimming `city` alone failed `every field`, `address` and
 * `postalCode` and left `region` and `countryCode` green, so the block's claim to
 * stop a name-the-field fix was two-fifths true. Found by the code pass.
 *
 * ⚠️ Reachable with no import at all: `BasicsForm` does not trim on write and
 * `validation.ts`'s `s()` passes a present string through unchanged.
 */
describe('formatFullAddress trims every field', () => {
  const CLEAN = {
    address: '12 Nowhere Lane',
    postalCode: 'W1A 1AA',
    city: 'Berlin',
    region: 'Bavaria',
    countryCode: 'DE',
  } as const;

  const PADDABLE = ['address', 'postalCode', 'city', 'region', 'countryCode'] as const;

  /**
   * ⚠️ **Both country branches, because each one leaves a different field
   * unread.** `formatFullAddress` picks its join by the effective country code:
   * `DE` takes the `EUROPEAN_POSTAL_CITY_COUNTRIES` path, which reads `region`
   * only when the CV locale implies the code (it does not, under `en`), and `US`
   * takes `CITY_REGION_POSTAL_COUNTRIES`, which reads `region` unconditionally.
   * A single-branch fixture therefore has one field that is insensitive by
   * construction — measured: trimming `city` alone left the `region` and
   * `countryCode` rows green on the `DE` branch.
   */
  const US_CLEAN = { ...CLEAN, region: 'NY', countryCode: 'US' } as const;
  const BRANCHES = [
    ['postal/city branch (DE)', CLEAN],
    ['city/region branch (US)', US_CLEAN],
  ] as const;

  const cvLocaleOf = (data: ResumeData) => getBoundFormatters(data).cvLocale;
  const enLocale = cvLocaleOf(buildSingleItemResume('plain'));

  /**
   * ⚠️ The whole location padded, then each field padded alone. The all-at-once
   * case is what a user produces; the per-field cases are what stop a fix that
   * trims only the field first measured (`city`) from passing — which is the failure mode
   * `getCityCountry` shipped for four rounds.
   */
  const PADDED_CASES = [
    ['every field', Object.fromEntries(PADDABLE.map((f) => [f, `  ${CLEAN[f]}  `]))],
    ...PADDABLE.map((field) => [field, { ...CLEAN, [field]: `  ${CLEAN[field]}  ` }] as const),
  ] as const;

  it.each(PADDED_CASES)('default mode: padding %s changes nothing', (_label, padded) => {
    expect(formatFullAddress(padded, enLocale)).toBe(formatFullAddress(CLEAN, enLocale));
  });

  /**
   * ⚠️ **A whitespace-only field is a separate property from a padded one, and
   * the block above cannot see it.** `PADDED_CASES` pads only non-empty values,
   * so every one of them stays truthy after trimming. Measured: a fix that trims
   * for the *custom* path but falls back to the raw value on the default path —
   * `value?.trim() || value || ''` — leaves the **entire suite green** while
   * producing `"12 Nowhere Lane, W1A 1AA    , DE"`, the stray-separator defect
   * on eleven of twelve themes. Found by the architect pass.
   *
   * Equality against the same field set to `''` rather than a literal, so it
   * needs no knowledge of which branch the country code selects.
   */
  it.each(
    BRANCHES.flatMap(([branch, base]) => PADDABLE.map((field) => [branch, field, base] as const)),
  )(
    'default mode on the %s: a whitespace-only %s is dropped, not emitted',
    (_branch, field, base) => {
      expect(formatFullAddress({ ...base, [field]: '   ' }, enLocale)).toBe(
        formatFullAddress({ ...base, [field]: '' }, enLocale),
      );
    },
  );

  /**
   * ⚠️ **`region` and `countryCode` are insensitive in default mode, so their
   * rows above prove nothing on their own** — measured, and the architect pass
   * caught the block claiming otherwise. `CLEAN.countryCode` is `'DE'`, which
   * selects the `EUROPEAN_POSTAL_CITY_COUNTRIES` branch, and that branch reads
   * `region` **only** when the CV locale implies the country code. Under an `en`
   * CV it does not, so `region` is never read: trimming `city` alone failed the
   * `every field`, `address` and `postalCode` rows and left `region` and
   * `countryCode` green.
   *
   * `US` moves the formatter onto the `CITY_REGION_POSTAL_COUNTRIES` branch,
   * where `region` is read unconditionally. Two of five rows go from decorative
   * to real.
   */
  it.each(['region', 'postalCode', 'city', 'address'] as const)(
    'default mode on the city/region branch: padding %s changes nothing',
    (field) => {
      expect(formatFullAddress({ ...US_CLEAN, [field]: `  ${US_CLEAN[field]}  ` }, enLocale)).toBe(
        formatFullAddress(US_CLEAN, enLocale),
      );
    },
  );

  it('the US branch really does read region, which is what makes the row above live', () => {
    expect(formatFullAddress(US_CLEAN, enLocale)).toContain('NY');
    expect(formatFullAddress(CLEAN, enLocale)).not.toContain('Bavaria');
  });

  /**
   * ⚠️ **A location field is arbitrary JSON, and the trim fix
   * assumed a string.** `validation.ts`'s `s()` assigns a non-date value through
   * unchanged, so `{"basics":{"location":{"city":42}}}` reaches the store as the
   * **number** 42 — measured straight out of `sanitizeResumeData`.
   *
   * The first draft of the trim fix used `value?.trim()`, which guards only nullish. It
   * threw `value?.trim is not a function` on all twelve themes in **both**
   * outputs, where `main` threw in the PDF alone (`getCityCountry`) and the HTML
   * editor preview rendered fine — i.e. the trim extended a PDF-only crash to the
   * editor. Both producers now type-test, so this is the case that keeps them
   * doing it. Same rule as `separator`'s `typeof === 'string'` in the same file
   * and as the prototype-key guard above.
   */
  const NON_STRINGS: ReadonlyArray<readonly [string, unknown]> = [
    ['a number', 42],
    ['an object', {}],
    ['an array', []],
    ['a boolean', true],
  ];

  it.each(PADDABLE)('survives a non-string %s in both producers', (field) => {
    for (const [, value] of NON_STRINGS) {
      const location = { ...CLEAN, [field]: value } as unknown as Parameters<
        typeof formatFullAddress
      >[0];

      expect(() => formatFullAddress(location, enLocale)).not.toThrow();
      expect(() => getCityCountry(location, 'en')).not.toThrow();
      expect(formatFullAddress(location, enLocale)).not.toContain('[object');
    }
  });

  /**
   * The custom-schema path, which resolves through `formatCustomAddress`. It had
   * a second, distinct symptom: the activeness filter is `!!fieldValues[field]`,
   * and a whitespace-only value is **truthy** — so a blank-but-padded field
   * counted as active, contributed nothing and leaked its separator. Trimming at
   * resolution is what makes it falsy.
   */
  const customLocale = (field: string) => cvLocaleOf(withAddressField('plain', field));

  it.each(PADDABLE)('custom mode: a padded %s is trimmed, not merely emitted', (field) => {
    const padded = { ...CLEAN, [field]: `  ${CLEAN[field]}  ` };

    expect(formatFullAddress(padded, customLocale(field))).toBe(
      formatFullAddress(CLEAN, customLocale(field)),
    );
  });

  it('custom mode: a whitespace-only field is inactive, so it leaks no separator', () => {
    const blank = { ...CLEAN, region: '   ' };

    expect(formatFullAddress(blank, customLocale('region'))).toBe(
      formatFullAddress({ ...CLEAN, region: '' }, customLocale('region')),
    );
    expect(formatFullAddress(blank, customLocale('region'))).not.toMatch(/^\s*,/);
  });

  /**
   * ⚠️ The positive control, and it moves a **required** part of the channel: the
   * equalities above are all satisfied by a formatter that returns `''`, or by one
   * that stopped reading `location` at all.
   */
  it('the padded fields are genuinely being read', () => {
    expect(formatFullAddress(CLEAN, enLocale)).toContain('Berlin');
    expect(formatFullAddress({ ...CLEAN, city: 'Hamburg' }, enLocale)).not.toBe(
      formatFullAddress(CLEAN, enLocale),
    );
    expect(formatFullAddress({ ...CLEAN, city: '  Berlin  ' }, enLocale)).not.toContain('Berlin  ');
  });

  /**
   * ⚠️ The premise the output-level control below rests on: the footer cannot
   * print `address`, so varying that field isolates the full address line.
   * `getCityCountry` is the only location producer any footer uses and it reads
   * `city` and `countryCode` alone — asserted here rather than argued, because
   * "a structural argument nothing asserts is not a guard" and because a footer
   * that grew an `address` read would quietly turn that control back into
   * "something moved".
   */
  it('the footer location producer cannot see address', () => {
    expect(getCityCountry({ ...CLEAN }, 'en')).toBe('Berlin, DE');
    expect(getCityCountry({ ...CLEAN, address: 'ZQADDR' }, 'en')).toBe('Berlin, DE');
  });

  /**
   * The output level, over both renderers and all twelve themes — because the
   * address line is what reaches the user, and because the surface is wide: the
   * header contact line and the cover letter's sender-address block, three sites
   * in stackoverflow (`:58` and `:123` — two, not the three this branch first
   * wrote in three places; `grep -c` counted the `import` line).
   *
   * Equality of whole markup rather than a string assertion, for the reason the
   * block above this file uses it: it needs no knowledge of how a theme prints an
   * address.
   */
  const padAll = (themeId: ThemeId, pad: boolean): ResumeData => {
    const data = buildSingleItemResume(themeId);
    data.basics.location = pad
      ? (Object.fromEntries(
          PADDABLE.map((f) => [f, `  ${CLEAN[f]}  `]),
        ) as ResumeData['basics']['location'])
      : { ...CLEAN };
    return data;
  };

  describe.each([
    ['serializer', (data: ResumeData, id: ThemeId) => SERIALIZERS[id](data)],
    [
      'HTML component',
      (data: ResumeData, id: ThemeId) =>
        renderToStaticMarkup(
          createElement(ThemeRegistry[id].HTMLComponent, {
            data,
            formatCVDate: (value?: string) => value || '',
            formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
          }),
        ),
    ],
  ] as const)('%s', (_kind, render) => {
    it.each(ALL_THEME_IDS)('%s emits the same markup padded or not', (themeId) => {
      expect(render(padAll(themeId, true), themeId)).toBe(render(padAll(themeId, false), themeId));
    });

    /**
     * ⚠️ The control for the case above, and it varies `address` rather than
     * `city` on purpose. A theme that printed no address at all would satisfy the
     * equality for ever, so something must be shown to move — but `city` is the
     * wrong probe for that, because nine of these themes also print it in the
     * **footer** (`City, CC`). Varying `city` therefore proves only that *some*
     * consumer of `location` is live, which is the "the control cannot reach the
     * state the guard is about" shape this repo has now recorded five times.
     *
     * `location.address` appears in the full address line and nowhere else — no
     * footer prints it — so this pins that the line under test is the one being
     * exercised, on every theme and both renderers.
     */
    it.each(ALL_THEME_IDS)('%s does print the address line, so the equality is live', (themeId) => {
      const other = padAll(themeId, false);
      other.basics.location = { ...CLEAN, address: '9 Elsewhere Road' };

      expect(render(other, themeId)).not.toBe(render(padAll(themeId, false), themeId));
    });
  });
});
