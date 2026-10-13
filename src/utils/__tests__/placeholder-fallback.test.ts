import { type ResumeData, initialResumeState } from '@/types/resume';
import { describe, expect, it } from 'vitest';

import { getSectionItemHash } from '../hash';
import {
  enrichResumeWithPlaceholders,
  generateJSONWithPlaceholders,
  isResumeEmpty,
} from '../placeholder-fallback';

const emptyResume = (overrides?: Partial<ResumeData>): ResumeData =>
  structuredClone({ ...initialResumeState, ...overrides });

const sampleWorkEntry = {
  name: 'ACME Corp',
  position: 'Engineer',
  location: 'Berlin',
  url: '',
  startDate: '2020-01',
  endDate: '',
  summary: '',
  highlights: [],
  visible: true,
};

describe('isResumeEmpty', () => {
  it('returns true for a pristine resume', () => {
    expect(isResumeEmpty(emptyResume())).toBe(true);
  });

  it('returns false when a basics field is filled', () => {
    const resume = emptyResume();
    resume.basics.name = 'Jane';
    expect(isResumeEmpty(resume)).toBe(false);
  });

  // The photo is content only while it is shown.
  it('counts a photo as content only while it is shown', () => {
    const resume = emptyResume();
    resume.basics.image = 'data:image/png;base64,AAAA';
    expect(isResumeEmpty(resume)).toBe(false);
    resume.meta.content.hiddenIds = ['basics:image'];
    expect(isResumeEmpty(resume)).toBe(true);
  });

  it('returns false when a section has an entry', () => {
    const resume = emptyResume();
    resume.work = [sampleWorkEntry];
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('ignores entries in hidden sections', () => {
    const resume = emptyResume();
    resume.work = [sampleWorkEntry];
    resume.meta.content.hiddenSections = ['work'];
    expect(isResumeEmpty(resume)).toBe(true);
  });

  it('ignores individually hidden entries', () => {
    const resume = emptyResume();
    resume.work = [sampleWorkEntry];
    resume.meta.content.hiddenIds = [getSectionItemHash('work', sampleWorkEntry)];
    expect(isResumeEmpty(resume)).toBe(true);
  });
});

describe('enrichResumeWithPlaceholders', () => {
  it('returns the resume unchanged when it has content', () => {
    const resume = emptyResume();
    resume.basics.name = 'Jane';
    expect(enrichResumeWithPlaceholders(resume)).toBe(resume);
  });

  it('fills an empty resume with placeholder content', () => {
    const enriched = enrichResumeWithPlaceholders(emptyResume());

    expect(enriched.basics.name).toBe('John Doe');
    expect(enriched.basics.image).toBe('/images/mok_image.png');
    expect(enriched.basics.profiles.length).toBeGreaterThan(0);
    expect(enriched.work.length).toBeGreaterThan(0);
    expect(enriched.education.length).toBeGreaterThan(0);
    expect(enriched.skills.length).toBeGreaterThan(0);
  });

  it('resolves placeholders from the CV locale (meta.theme.locale)', () => {
    const resume = emptyResume();
    resume.meta.theme.locale = 'de';

    const enriched = enrichResumeWithPlaceholders(resume);
    expect(enriched.basics.name).toBe('Max Mustermann');
  });

  it('falls back to English for unknown locales', () => {
    const resume = emptyResume();
    resume.meta.theme.locale = 'xx';

    const enriched = enrichResumeWithPlaceholders(resume);
    expect(enriched.basics.name).toBe('John Doe');
  });

  it('clears hidden ids and sections so placeholders are visible', () => {
    const resume = emptyResume();
    resume.work = [sampleWorkEntry];
    resume.meta.content.hiddenSections = ['work'];

    const enriched = enrichResumeWithPlaceholders(resume);
    expect(enriched.meta.content.hiddenSections).toEqual([]);
    expect(enriched.meta.content.hiddenIds).toEqual([]);
  });
});

/**
 * A sixth producer, found by an architect review pass.
 *
 * `generateJSONWithPlaceholders` decides per field whether the user supplied
 * something, with `data.basics.X || placeholder(…)`. A whitespace-only value is
 * **truthy**, so `'   '` counted as supplied and the placeholder was skipped —
 * while `isResumeEmpty`, twenty lines up in the same file, trims. The two halves
 * disagreed about what "supplied" means: the résumé reads as empty, the
 * placeholders run, and then the blank wins.
 *
 * ⚠️ **It was once visible, and an earlier fix made it silent**, which is why it
 * is fixed rather than filed. Measured on an otherwise-empty résumé
 * with one space typed into City:
 *
 * ```
 * original      "123 Main St,    , NY 10001"   ← blank part, visible
 * earlier fix   "123 Main St, NY 10001"        ← city silently gone
 * fixed         "123 Main St, New York, NY 10001"
 * ```
 *
 * ⚠️ **Scope re-derived from the property, not from the finding.** The reviewer
 * measured `city`; the property is "a stored string decides whether the
 * placeholder runs", and there are **twelve** such guards in the function — the
 * five location fields plus `name`, `label`, `image`, `email`, `phone`, `url` and
 * `summary`. `isResumeEmpty` trims every one of the scalars too, so all twelve
 * had the same disagreement. Driven off the field lists below rather than a prose
 * list, so a thirteenth guard is a deliberate edit here.
 */
describe('a whitespace-only field still gets its placeholder', () => {
  const SCALARS = ['name', 'label', 'email', 'phone', 'url', 'summary', 'image'] as const;
  const LOCATION_FIELDS = ['address', 'postalCode', 'city', 'region', 'countryCode'] as const;

  it.each(SCALARS)('basics.%s', (field) => {
    const blank = emptyResume();
    blank.basics[field] = '   ';

    expect(enrichResumeWithPlaceholders(blank).basics[field]).toBe(
      enrichResumeWithPlaceholders(emptyResume()).basics[field],
    );
  });

  it.each(LOCATION_FIELDS)('basics.location.%s', (field) => {
    const blank = emptyResume();
    blank.basics.location[field] = '   ';

    expect(enrichResumeWithPlaceholders(blank).basics.location[field]).toBe(
      enrichResumeWithPlaceholders(emptyResume()).basics.location[field],
    );
  });

  /**
   * ⚠️ The positive control, and it is what stops the equalities above being
   * satisfied by a function that overwrites every field unconditionally. A
   * *genuinely supplied* value must survive — which is the whole point of the
   * `||` these guards are built on.
   *
   * ⚠️ **It has to use a field `isResumeEmpty` does not read, and my first draft
   * used one it does.** `region`, `postalCode` and `countryCode` are the three
   * outside its nine-field check; supplying `city` (or `name`) makes the résumé
   * non-empty, so `generateJSONWithPlaceholders` returns it untouched and the
   * assertion would hold without the enrichment running at all. The second
   * assertion pins that it *did* run.
   */
  it('a supplied value is still not overwritten', () => {
    const supplied = emptyResume();
    supplied.basics.location.region = 'Vesturland';

    const enriched = enrichResumeWithPlaceholders(supplied);

    expect(enriched.basics.location.region).toBe('Vesturland');
    // The résumé is still empty by `isResumeEmpty`'s reckoning, so the
    // enrichment ran — without this the case above proves nothing.
    expect(enriched).not.toBe(supplied);
    expect(enriched.basics.name.trim()).not.toBe('');
  });

  /**
   * And the premise both blocks rest on: the placeholders are non-blank, so
   * "equals the all-empty result" is a real claim rather than `'' === ''`.
   */
  it('the placeholders are non-empty, so the equalities are not trivial', () => {
    const enriched = enrichResumeWithPlaceholders(emptyResume());

    for (const field of SCALARS) expect(enriched.basics[field].trim()).not.toBe('');
    for (const field of LOCATION_FIELDS) {
      expect(enriched.basics.location[field].trim()).not.toBe('');
    }
  });

  /**
   * ⚠️ A location field is arbitrary JSON on this path too (`validation.ts`'s
   * `s()` assigns a non-date value through unchanged), so the guard type-tests
   * rather than nullish-tests — the same correction an earlier first draft needed
   * in `address.ts`.
   */
  it('survives a non-string field instead of throwing', () => {
    const odd = emptyResume();
    (odd.basics.location as unknown as Record<string, unknown>).city = 42;
    (odd.basics as unknown as Record<string, unknown>).summary = {};

    expect(() => enrichResumeWithPlaceholders(odd)).not.toThrow();
    expect(enrichResumeWithPlaceholders(odd).basics.location.city.trim()).not.toBe('');
  });
});

/**
 * The sample clears the visibility lists, so whatever of the user's it
 * keeps must already be what they show. A hidden photo, profile or custom
 * entry used to render beside the sample text — and reach the exported PDF.
 */
describe('the sample preview of a CV whose content is all hidden', () => {
  const t = (key: string) => key;

  it('never shows the hidden photo, profiles or custom entries', () => {
    const resume = emptyResume();
    resume.basics.image = 'data:image/png;base64,USER';
    resume.basics.profiles = [
      { network: 'GitHub', username: 'me', url: 'https://github.com/me', _vId: 'p1' },
    ];
    resume.customSections = [
      {
        id: 'c1',
        title: 'Talks',
        items: [
          {
            name: 'Private talk',
            startDate: '',
            endDate: '',
            url: '',
            summary: '',
            highlights: [],
            _vId: 't1',
          },
        ],
      },
    ];
    resume.meta.content.hiddenIds = ['basics:image', 'profiles:p1', 'custom:c1:t1'];
    expect(isResumeEmpty(resume)).toBe(true);

    const sample = generateJSONWithPlaceholders(resume, t);
    expect(sample.meta.content.hiddenIds).toEqual([]);
    expect(sample.basics.image).toBe('/images/mok_image.png');
    expect(sample.basics.profiles.map((profile) => profile.network)).toEqual(['LinkedIn']);
    expect(sample.customSections[0].items).toEqual([]);
  });
});
