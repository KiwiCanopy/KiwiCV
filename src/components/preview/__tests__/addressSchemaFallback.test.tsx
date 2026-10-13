import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { getBoundFormatters } from '@/components/preview/themes/shared';
import { formatFullAddress } from '@/components/preview/themes/shared/address';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { afterAll, describe, expect, it } from 'vitest';

/**
 * The two halves of the schema fallback, neither of which
 * `preview/__tests__/addressSchemaResolution.test.tsx` can express.
 *
 * 1. **An unusable custom schema falls back to `default` mode** instead of
 *    yielding `''`. Out of reach in the sibling file *by construction*: every
 *    fixture there appends a trailing `city`, deliberately, so no schema it
 *    builds is ever unresolvable.
 * 2. **The formatting rule comes from the résumé being rendered**, not from
 *    whatever résumé `useResumeStore` currently holds. `formatFullAddress` took
 *    `location` as an argument and then read the schema off
 *    `useResumeStore.getState()`, so the landing-page hero
 *    (`LandingPage/sections/components/HeroGraphic.tsx`) and the HTML export
 *    (`utils/html-generator.tsx`) formatted one résumé's data by another's rule.
 *
 * ⚠️ **The discriminator is the point of the first block.** "Falls back when the
 * output is empty" and "falls back when the schema resolves nothing" agree on
 * every case below but one and disagree on the one that matters: a schema
 * naming real fields whose values happen to be blank must **keep** yielding `''`,
 * because falling back there would print the fields the user deliberately
 * excluded. `resolvePalette` draws the same line — an unresolvable stored
 * *id* falls back; a palette that happens to look plain does not.
 */

const FIXTURE_THEME: ThemeId = 'plain';

/**
 * Schemas that resolve **nothing**: empty, non-array, malformed entries, and
 * keys that are not address fields — including the two `Object.prototype` names
 * that need guarding, which must decline rather than throw.
 */
const UNUSABLE_SCHEMAS: Array<[string, unknown]> = [
  ['an empty array', []],
  ['a non-array', 'not-an-array'],
  ['an object', {}],
  ['undefined', undefined],
  ['only null entries', [null, undefined]],
  ['only an unknown key', [{ field: 'nope', separator: ',' }]],
  ['only an empty key', [{ field: '', separator: ',' }]],
  [
    'only prototype keys',
    [
      { field: 'constructor', separator: ',' },
      { field: '__proto__', separator: ',' },
    ],
  ],
];

const withSchema = (themeId: ThemeId, schema: unknown): ResumeData => {
  const data = buildSingleItemResume(themeId);
  data.meta.theme.params = {
    ...data.meta.theme.params,
    addressSchema: schema as never,
  };
  return data;
};

const cvLocaleFor = (schema: unknown) =>
  getBoundFormatters(withSchema(FIXTURE_THEME, schema)).cvLocale;

const renderTheme = (themeId: ThemeId, schema: unknown, override?: ResumeData): string =>
  renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data: override ?? withSchema(themeId, schema),
      formatCVDate: (value?: string) => value || '',
      formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
    }),
  );

const serializeTheme = (themeId: ThemeId, schema: unknown, override?: ResumeData): string =>
  SERIALIZERS[themeId](override ?? withSchema(themeId, schema));

const DEFAULT_MODE = { mode: 'default' } as const;
/** Resolvable, and formatted unlike `default` mode on this fixture's location. */
const RESOLVABLE = {
  mode: 'custom',
  customFields: [{ field: 'city', separator: '' }],
} as const;

describe('an unusable custom address schema falls back to default mode', () => {
  const location = { address: '10 Downing St', postalCode: 'SW1A', city: 'London', region: 'GL' };
  const asDefault = formatFullAddress(location, cvLocaleFor(DEFAULT_MODE));

  it('has a non-empty default-mode baseline to fall back to', () => {
    // Without this the equalities below would hold vacuously if the default
    // formatter itself ever started returning ''.
    expect(asDefault).not.toBe('');
  });

  it.each(UNUSABLE_SCHEMAS)('%s resolves nothing and formats as default mode', (_name, fields) => {
    expect(formatFullAddress(location, cvLocaleFor({ mode: 'custom', customFields: fields }))).toBe(
      asDefault,
    );
  });

  /**
   * ⚠️ The discriminator. A schema that names a **real** field whose value is
   * blank is not unresolvable — the user picked that field, and falling back
   * would print `address`, which they excluded. An implementation that keys the
   * fallback off "the result came out empty" passes every case above and fails
   * exactly here.
   */
  it('does NOT fall back when a declared field is merely empty', () => {
    const blankCity = { address: '10 Downing St', city: '' };
    expect(formatFullAddress(blankCity, cvLocaleFor(RESOLVABLE))).toBe('');
    expect(formatFullAddress(blankCity, cvLocaleFor(DEFAULT_MODE))).toBe('10 Downing St');
  });

  // The positive control: a resolvable schema must still beat default mode,
  // or "everything formats as default mode" would satisfy the block above.
  it('still honours a resolvable custom schema', () => {
    expect(formatFullAddress(location, cvLocaleFor(RESOLVABLE))).toBe('London');
    expect(formatFullAddress(location, cvLocaleFor(RESOLVABLE))).not.toBe(asDefault);
  });
});

describe.each([
  ['serializer', serializeTheme],
  ['HTML component', renderTheme],
] as const)('every %s falls back rather than dropping the address', (_kind, render) => {
  it.each(ALL_THEME_IDS)('%s renders an unusable schema as default mode', (themeId) => {
    const baseline = render(themeId, DEFAULT_MODE);
    for (const [, fields] of UNUSABLE_SCHEMAS) {
      expect(render(themeId, { mode: 'custom', customFields: fields })).toBe(baseline);
    }
  });

  /**
   * Positive control at output level: the schema must reach the markup at all.
   *
   * ⚠️ **Existential, and deliberately kept alongside the universal one below.**
   * "The two outputs differ" is satisfied by a *single* address site honouring the
   * schema, so a theme with a second site still formatting in `default` mode would
   * pass this. It stays because it is the cheap check that fails first when the
   * whole channel dies.
   */
  it.each(ALL_THEME_IDS)('%s renders a resolvable schema differently', (themeId) => {
    expect(render(themeId, RESOLVABLE)).not.toBe(render(themeId, DEFAULT_MODE));
  });

  /**
   * ⚠️ **The universal form, and it is what the existential one above cannot say.**
   * With every location field carrying a distinct sentinel and a schema selecting
   * `city` alone, an output that honours the schema everywhere contains `ZQCITY`
   * and **none** of the other three. One site left on the old `getThemeTranslations`
   * `cvLocale` — the decoy `ThemeProps` used to carry — formats in `default` mode
   * and emits `ZQADDR`, which no count of differences would notice.
   *
   * ⚠️ `countryCode` is a real code, not a sentinel: it steers which of the three
   * default-mode orderings runs, so a fake one would silently test a different
   * branch than the app takes.
   */
  it.each(ALL_THEME_IDS)('%s honours the schema at every address site', (themeId) => {
    const data = withSchema(themeId, RESOLVABLE);
    data.basics.location = {
      address: 'ZQADDR',
      postalCode: 'ZQPOST',
      city: 'ZQCITY',
      region: 'ZQREG',
      countryCode: 'GB',
    };
    const output = render(themeId, RESOLVABLE, data);

    expect(output).toContain('ZQCITY');
    for (const excluded of ['ZQADDR', 'ZQPOST', 'ZQREG']) {
      expect(output).not.toContain(excluded);
    }
  });
});

describe('the address schema comes from the rendered résumé, not the store', () => {
  const initialState = useResumeStore.getState();
  afterAll(() => useResumeStore.setState(initialState, true));

  /**
   * The store is loaded with a résumé whose schema **contradicts** the one being
   * rendered. This once changed the output of both paths, which is the
   * landing-page hero and the HTML export rendering demo or exported data by the
   * visitor's own stored rule.
   */
  it.each(ALL_THEME_IDS)('%s ignores a conflicting schema in the store', (themeId) => {
    // Baselines, store and data agreeing.
    useResumeStore.setState({ resume: withSchema(themeId, RESOLVABLE) });
    const customHtml = renderTheme(themeId, RESOLVABLE);
    const customTypst = serializeTheme(themeId, RESOLVABLE);
    useResumeStore.setState({ resume: withSchema(themeId, DEFAULT_MODE) });
    const defaultHtml = renderTheme(themeId, DEFAULT_MODE);
    const defaultTypst = serializeTheme(themeId, DEFAULT_MODE);

    // ⚠️ Without this the equalities below hold vacuously — the schema has to
    // reach the markup at all before "the store cannot change it" means anything.
    expect(customHtml).not.toBe(defaultHtml);
    expect(customTypst).not.toBe(defaultTypst);

    // Store says `default`, the rendered résumé says `custom`.
    useResumeStore.setState({ resume: withSchema(themeId, DEFAULT_MODE) });
    expect(renderTheme(themeId, RESOLVABLE)).toBe(customHtml);
    expect(serializeTheme(themeId, RESOLVABLE)).toBe(customTypst);

    // …and the other way round.
    useResumeStore.setState({ resume: withSchema(themeId, RESOLVABLE) });
    expect(renderTheme(themeId, DEFAULT_MODE)).toBe(defaultHtml);
    expect(serializeTheme(themeId, DEFAULT_MODE)).toBe(defaultTypst);
  });
});
