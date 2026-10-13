import { getBoundFormatters } from '@/components/preview/themes/shared';
import { formatFullAddress } from '@/components/preview/themes/shared/address';
import { getTypstFooterParts } from '@/components/preview/themes/shared/typstFooter';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { type AddressSchemaConfig, type ResumeData, type ThemeParams } from '@/types/resume';
import { getFilteredResumeData, getPublicBackupData } from '@/utils/resume-export';
import { shownLocationFields } from '@/utils/visibility';
import { describe, expect, it } from 'vitest';

/**
 * Public GitHub repos receive the reduced tier, so it holds only what the
 * CV prints — the user's choice of address parts included — and fails closed on
 * a field nobody has classified.
 */
const LOCATION = {
  address: '10 Secret Street',
  postalCode: 'SW1A 9ZZ',
  city: 'London',
  region: 'Greater London',
  countryCode: 'GB',
};

const withParams = (params: Partial<ThemeParams>): ResumeData => {
  const resume = buildSingleItemResume('plain');
  resume.basics.location = { ...LOCATION };
  resume.meta.theme.params = { ...resume.meta.theme.params, ...params };
  return resume;
};

const reduced = (resume: ResumeData) =>
  getFilteredResumeData(resume, 'reduced') as unknown as ResumeData;

const CITY_AND_COUNTRY: AddressSchemaConfig = {
  mode: 'custom',
  customFields: [
    { field: 'city', separator: ',' },
    { field: 'countryCode', separator: '' },
  ],
};
const STREET_ONLY: AddressSchemaConfig = {
  mode: 'custom',
  customFields: [{ field: 'address', separator: '' }],
};

// The malformed shapes `formatCustomAddress` defends against are here so the
// two rules cannot drift on them.
const PARAMS: [string, Partial<ThemeParams>][] = [
  ['default', { addressSchema: { mode: 'default' } }],
  ['city and country', { addressSchema: CITY_AND_COUNTRY }],
  ['street only, footer on', { addressSchema: STREET_ONLY }],
  ['street only, footer off', { addressSchema: STREET_ONLY, showFooter: false }],
  ['street only, typed footer', { addressSchema: STREET_ONLY, footerLocation: 'Remote' }],
  ['a custom schema naming nothing', { addressSchema: { mode: 'custom', customFields: [] } }],
  ['non-array customFields', { addressSchema: { mode: 'custom', customFields: {} } as never }],
  [
    'null, prototype and unknown entries',
    {
      addressSchema: {
        mode: 'custom',
        customFields: [null, { field: 'toString' }, { field: 'nope' }],
      } as never,
    },
  ],
  ['preset mode', { addressSchema: { mode: 'preset' } }],
];

describe('the reduced tier keeps exactly the address parts the CV prints', () => {
  it.each(PARAMS)('%s', (_label, params) => {
    const resume = withParams(params);
    const shown = shownLocationFields(resume.meta.theme.params);
    const location = reduced(resume).basics.location as Record<string, string>;
    const cvLocale = getBoundFormatters(resume).cvLocale;
    const printed = [
      formatFullAddress(LOCATION, cvLocale),
      ...getTypstFooterParts(resume, cvLocale),
    ]
      .join('\n')
      // A country code the locale implies is not printed; keep it out of the
      // comparison's way by matching whole values only.
      .split(/[\n,]/)
      .map((part) => part.trim());

    for (const [field, value] of Object.entries(LOCATION)) {
      if (shown.has(field as keyof typeof LOCATION)) {
        expect(location[field]).toBe(value);
      } else {
        expect(location[field]).toBe('');
        // What the export drops, neither the contact line nor the footer prints.
        expect(printed.some((part) => part.includes(value))).toBe(false);
      }
    }
  });

  it('drops the street and postcode the letterhead leaves out', () => {
    const location = reduced(withParams({ addressSchema: CITY_AND_COUNTRY })).basics.location;
    expect(location.address).toBe('');
    expect(location.postalCode).toBe('');
    expect(location.city).toBe('London');
  });

  it('keeps the city the footer prints although the schema omits it', () => {
    const location = reduced(withParams({ addressSchema: STREET_ONLY })).basics.location;
    expect(location.city).toBe('London');
    expect(location.postalCode).toBe('');
  });
});

describe('the design a public backup carries', () => {
  it("drops a hidden section's heading and a footer location the CV hides", () => {
    const resume = withParams({
      sectionLabels: { work: 'Career', education: 'Studies' },
      showFooter: false,
      footerLocation: 'Secret Town',
    });
    resume.meta.content.hiddenSections = ['education'];
    resume.meta.content.hiddenIds = ['work:x'];
    const { meta } = getPublicBackupData(resume) as unknown as ResumeData;
    expect(meta.theme.params.sectionLabels).toEqual({ work: 'Career' });
    expect(meta.theme.params.footerLocation).toBe('');
    expect(meta.content.hiddenIds).toEqual([]);
  });
});

describe('imported-only project fields stay out', () => {
  it.each(['projects', 'privateProjects'] as const)('%s roles and keywords', (key) => {
    const resume = buildSingleItemResume('plain');
    resume[key] = [{ ...resume.projects[0], roles: ['Lead'], keywords: ['Rust'] }];
    const [project] = reduced(resume)[key];
    expect(project).not.toHaveProperty('roles');
    expect(project).not.toHaveProperty('keywords');
  });
});

/** Every key path in a value, array indices collapsed: `work[].name`. */
const keyPaths = (value: unknown, prefix = ''): string[] => {
  if (Array.isArray(value)) return value.flatMap((item) => keyPaths(item, `${prefix}[]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return [path, ...keyPaths(child, path)];
    });
  }
  return [];
};

/**
 * ⚠️ Fail closed, at every depth: a field this snapshot has not classified
 * reaches a public repo the day it is added. Updating it is a decision — does
 * the CV print the new field? `buildSingleItemResume` fills one entry in every
 * section, so item fields are covered too.
 */
describe('every field a public repo receives is classified', () => {
  it('matches the reviewed key paths', () => {
    const resume = buildSingleItemResume('plain');
    resume.customSections = [
      {
        id: 'c1',
        title: 'Talks',
        items: [
          {
            name: 'A talk',
            startDate: '',
            endDate: '',
            url: '',
            summary: '',
            highlights: [],
            _vId: 'c1-1',
          },
        ],
      },
    ];
    // Every optional theme param filled, so none of them can slip past unseen.
    resume.meta.theme.params = {
      ...resume.meta.theme.params,
      sectionLabels: { work: 'Career' },
      addressSchema: CITY_AND_COUNTRY,
    };
    const paths = [...new Set(keyPaths(getPublicBackupData(resume)))].sort();
    expect(paths).toMatchSnapshot();
  });
});
