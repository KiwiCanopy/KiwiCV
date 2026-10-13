import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData, initialResumeState } from '@/types/resume';
import {
  THEME_PARAM_DEFAULTS,
  type ThemeParams,
  sanitizeAddressSchema,
  sanitizeResumeData,
  sanitizeSectionLabels,
} from '@/utils/validation';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Every declared `meta.theme.params` key must survive an ordinary
 * array-section edit.
 *
 * `setResume` is not the import path only: `useArrayForm`, `useSkillsForm` and
 * `useLanguageForm` all call it with `{ silent: true }` on every move, drag, sort,
 * field commit and delete. Before this, four params were replaced by their
 * `initialResumeState` values there — no toast, no undo, three interactions to
 * reproduce — because `sanitizeResumeData`'s whitelist listed five of ten keys and
 * `setResume` spread the defaults underneath.
 *
 * ⚠️ **The seed map is keyed by `keyof Required<ThemeParams>`, i.e. by the TYPE,
 * not by `THEME_PARAM_DEFAULTS`.** Driving the cases off the constant under test
 * is the `it.each(Object.keys(mapUnderTest))` trap: if the constant lost a key the
 * suite would simply stop testing it and stay green. `keyof` of a declared
 * interface cannot degenerate, and the set-equality assertion below pins the
 * constant against it at runtime as well.
 */
const NON_DEFAULT_SEED: Record<keyof Required<ThemeParams>, unknown> = {
  palette: 'ocean',
  sectionLabels: { work: 'My Jobs' },
  showFooter: false,
  footerLocation: 'Berlin',
  footerDate: '2026-01-01',
  fontSizeScale: 1.2,
  imageShape: 'circle',
  boldHeaderWork: 'company',
  boldHeaderEducation: 'company',
  addressSchema: {
    mode: 'custom',
    customFields: [
      { field: 'city', separator: ',' },
      { field: 'countryCode', separator: '' },
    ],
  },
};

const PARAM_KEYS = Object.keys(NON_DEFAULT_SEED) as Array<keyof Required<ThemeParams>>;

/** One ordinary list edit, exactly as `useArrayForm.updateItem` performs it. */
function editAnArraySection() {
  const resume = useResumeStore.getState().resume;
  useResumeStore
    .getState()
    .setResume({ ...resume, work: [{ _vId: 'a', name: 'ACME' }] } as unknown as ResumeData, {
      silent: true,
    });
}

function seedParams(params: Record<string, unknown> = NON_DEFAULT_SEED) {
  useResumeStore.getState().updateMeta({
    theme: { name: 'timeless', locale: 'en', params },
  } as unknown as Partial<ResumeData['meta']>);
}

beforeEach(() => {
  useResumeStore.getState().resetResume();
});

describe('meta.theme.params survives an array-section edit', () => {
  /**
   * Half 2 of the drift guard, and the half that is easy to fake here: without it
   * a seed that happened to equal the default would "survive" every edit and the
   * whole suite would prove nothing.
   */
  it('every seed value differs from the default it would be reset to', () => {
    // ⚠️ The literal 10 is not a third copy of the count — it is what catches the
    // type and the constant shrinking *together*. `PARAM_KEYS` comes from
    // `keyof Required<ThemeParams>` and `Required<>` forces the constant to match
    // it, so the set-equality test below stays green if a param is deleted from
    // the interface. Only a hand-written number notices that.
    expect(PARAM_KEYS.length).toBe(10);
    for (const key of PARAM_KEYS) {
      expect(NON_DEFAULT_SEED[key]).not.toEqual(
        (THEME_PARAM_DEFAULTS as Record<string, unknown>)[key],
      );
    }
    // ⚠️ There is deliberately no second assertion against
    // `initialResumeState.meta.theme.params` here. It used to be one and it was
    // vacuous for the three keys that block omitted — `undefined` differs from
    // everything. It is now *derived* from `THEME_PARAM_DEFAULTS`, so the property
    // is held by construction and asserting it would restate the destructuring.
    expect(initialResumeState.meta.theme.params).toEqual(
      expect.objectContaining({ palette: 'default', fontSizeScale: 1 }),
    );
    expect(Object.hasOwn(initialResumeState.meta.theme.params, 'sectionLabels')).toBe(false);
  });

  /**
   * Half 1: the whitelist must list every declared key. `Required<>` in
   * `THEME_PARAM_DEFAULTS` makes an omission a build error; this says the same
   * thing at runtime, so the constant cannot be quietly retyped out of the guard.
   */
  it('the whitelist covers exactly the declared params', () => {
    expect(Object.keys(THEME_PARAM_DEFAULTS).sort()).toEqual([...PARAM_KEYS].sort());
  });

  it.each(PARAM_KEYS)('keeps %s', (key) => {
    seedParams();

    // The fixture has to reach the code: a param that never made it into the store
    // would "survive" trivially.
    const before = useResumeStore.getState().resume.meta.theme.params as Record<string, unknown>;
    expect(before[key]).toEqual(NON_DEFAULT_SEED[key]);

    editAnArraySection();

    const after = useResumeStore.getState().resume.meta.theme.params as Record<string, unknown>;
    expect(after[key]).toEqual(NON_DEFAULT_SEED[key]);
  });

  it('keeps the export hosting path, the fifth casualty of the same defect', () => {
    useResumeStore.getState().updateMeta({
      export: { filenamePattern: '{name}-cv', hostingPath: '/cv' },
    } as unknown as Partial<ResumeData['meta']>);

    expect(useResumeStore.getState().resume.meta.export.hostingPath).toBe('/cv');
    editAnArraySection();
    expect(useResumeStore.getState().resume.meta.export.hostingPath).toBe('/cv');
  });

  /**
   * ⚠️ The property the whitelist exists for, asserted alongside — widening `s()`
   * to copy unknown keys would pass every test above and is exactly the vector
   * the whitelist closes.
   */
  it('still strips a key that is not declared', () => {
    seedParams({ ...NON_DEFAULT_SEED, evil: { nested: true } });
    editAnArraySection();

    const after = useResumeStore.getState().resume.meta.theme.params as Record<string, unknown>;
    expect(after.evil).toBeUndefined();
    expect(after.palette).toBe('ocean');
  });
});

describe('sanitizeSectionLabels', () => {
  it('keeps string overrides and drops everything else', () => {
    expect(sanitizeSectionLabels({ work: 'Jobs', skills: 42, awards: { a: 1 } })).toEqual({
      work: 'Jobs',
    });
  });

  /**
   * ⚠️ The payload has to be an **object**. A first draft used
   * `{"__proto__": "pwned"}` and passed with the guard removed: the `__proto__`
   * setter ignores a non-object value, so a string payload is inert whatever the
   * sanitizer does. Only an object value reaches the setter, and only then does
   * dropping the string check actually re-point the result's prototype. Mutation-
   * verified — this fails when `typeof value === 'string'` goes.
   */
  it('leaves the result prototype alone when __proto__ carries an object', () => {
    const result = sanitizeSectionLabels(
      JSON.parse('{"__proto__": {"pwned": true}, "work": "Jobs"}'),
    );

    expect(result).toEqual({ work: 'Jobs' });
    expect(Object.getPrototypeOf(result!)).toBe(Object.prototype);
    expect((result as Record<string, unknown>).pwned).toBeUndefined();
  });

  it('is undefined for anything that is not a plain object', () => {
    expect(sanitizeSectionLabels(undefined)).toBeUndefined();
    expect(sanitizeSectionLabels('nope')).toBeUndefined();
    expect(sanitizeSectionLabels(['work'])).toBeUndefined();
  });
});

describe('sanitizeAddressSchema', () => {
  it('narrows the mode to its union', () => {
    expect(sanitizeAddressSchema({ mode: 'preset', presetCountry: 'DE' })).toEqual({
      mode: 'preset',
      presetCountry: 'DE',
    });
    expect(sanitizeAddressSchema({ mode: 'constructor' }).mode).toBe('default');
    expect(sanitizeAddressSchema(null)).toEqual({ mode: 'default' });
  });

  it('drops entries whose field is not a declared key', () => {
    const result = sanitizeAddressSchema({
      mode: 'custom',
      customFields: [
        { field: 'city', separator: ',' },
        { field: '__proto__', separator: ',' },
        { field: 'constructor', separator: ',' },
        { field: null, separator: ',' },
        { field: 'nonsense', separator: ',' },
        null,
        'not an object',
      ],
    });

    expect(result.customFields).toEqual([{ field: 'city', separator: ',' }]);
  });

  it('defaults a missing or invalid separator instead of emitting undefined', () => {
    const result = sanitizeAddressSchema({
      mode: 'custom',
      customFields: [{ field: 'city' }, { field: 'region', separator: ';' }],
    });

    expect(result.customFields).toEqual([
      { field: 'city', separator: '' },
      { field: 'region', separator: '' },
    ]);
  });

  it('drops a non-array customFields container', () => {
    // ⚠️ `length === 0` cannot catch this — `({}).length` is `undefined`.
    expect(
      sanitizeAddressSchema({ mode: 'custom', customFields: {} }).customFields,
    ).toBeUndefined();
  });
});

describe('sanitizeResumeData carries the params an import supplies', () => {
  it('round-trips every seeded param through the import path', () => {
    const { sanitized } = sanitizeResumeData({
      ...structuredClone(initialResumeState),
      meta: {
        ...structuredClone(initialResumeState.meta),
        theme: { name: 'timeless', locale: 'en', params: NON_DEFAULT_SEED },
      },
    } as unknown as ResumeData);

    for (const key of PARAM_KEYS) {
      expect((sanitized.meta.theme.params as Record<string, unknown>)[key]).toEqual(
        NON_DEFAULT_SEED[key],
      );
    }
  });

  /**
   * ⚠️ The three union narrowings had **nothing** asserting them until a review
   * mutation-tested them: replacing all three with the raw `base.*` value passed
   * the entire suite. The commit body argued they mattered because those keys used
   * to be *stripped*, so admitting them without narrowing would newly let arbitrary
   * JSON through — a structural argument that nothing asserts is not a guard.
   */
  it.each([
    ['imageShape', 'triangle', 'square'],
    ['imageShape', { nested: true }, 'square'],
    ['boldHeaderWork', 'constructor', 'position'],
    ['boldHeaderEducation', 42, 'position'],
    ['palette', { nested: true }, 'default'],
    ['showFooter', 'yes', true],
    ['footerLocation', ['a'], ''],
    // ⚠️ Not a type nicety. `SkylineSerializer.ts` reads this as
    // `params?.fontSizeScale || 1` and skyline interpolates it **raw** into Typst
    // (`size: 8pt * ${fontScale}`, five sites under `helpers/typst/`), so a string
    // closed the `text(` call and injected markup from an imported JSON file.
    ['fontSizeScale', '1) ; #sys.exit()', 1],
    ['fontSizeScale', 'NaN', 1],
    // `NaN` and `Infinity` are numbers and both reach the markup as a length.
    ['fontSizeScale', Number.POSITIVE_INFINITY, 1],
    ['footerDate', 'auto', 'auto'],
  ] as const)('narrows an out-of-type %s (%o)', (key, bad, expected) => {
    const { sanitized } = sanitizeResumeData({
      ...structuredClone(initialResumeState),
      meta: {
        ...structuredClone(initialResumeState.meta),
        theme: { name: 'timeless', locale: 'en', params: { [key]: bad } },
      },
    } as unknown as ResumeData);

    expect((sanitized.meta.theme.params as Record<string, unknown>)[key]).toBe(expected);
  });

  /**
   * The other half of dropping the hand-rolled `imageShape` rescue, in both
   * directions — the second case is a deliberate behaviour change, not an accident,
   * and it is the one nothing would otherwise record.
   */
  it.each([
    ['takes the imported shape over the stored one', 'circle', 'circle'],
    ['falls back to the default when the file omits it', undefined, 'square'],
  ] as const)('%s', (_label, fileShape, expected) => {
    useResumeStore.getState().updateMeta({
      theme: { name: 'lunar', locale: 'en', params: { imageShape: 'circle' } },
    } as unknown as Partial<ResumeData['meta']>);

    const imported = structuredClone(initialResumeState) as unknown as ResumeData;
    imported.basics.name = 'Imported';
    imported.meta.theme.params = fileShape ? { imageShape: fileShape } : { palette: 'ocean' };

    useResumeStore.getState().setResume(imported, { silent: true });

    expect(useResumeStore.getState().resume.meta.theme.params.imageShape).toBe(expected);
  });

  /**
   * ⚠️ A non-string in **any** date field used to kill the whole import, not just
   * that field: `s()`'s date branch did `(value as string) || ''` and then called
   * `.toLowerCase()` on it, so a truthy non-string threw. `footerDate` is one
   * instance; every `startDate`/`endDate`/`date` in every section is another.
   */
  it.each([
    ['footerDate on the theme params', { meta: { theme: { params: { footerDate: {} } } } }],
    ['startDate on a work item', { work: [{ _vId: 'a', name: 'ACME', startDate: {} }] }],
    ['releaseDate on a publication', { publications: [{ _vId: 'b', name: 'P', releaseDate: [] }] }],
  ] as const)('survives a non-string %s', (_label, patch) => {
    const data = { ...structuredClone(initialResumeState), ...patch } as unknown as ResumeData;

    expect(() => sanitizeResumeData(data)).not.toThrow();
  });

  it('still migrates the pre-v3 meta.ui.imageShape of an imported file', () => {
    const { sanitized } = sanitizeResumeData({
      ...structuredClone(initialResumeState),
      meta: { ...structuredClone(initialResumeState.meta), ui: { imageShape: 'circle' } },
    } as unknown as ResumeData);

    expect(sanitized.meta.theme.params.imageShape).toBe('circle');
  });
});
