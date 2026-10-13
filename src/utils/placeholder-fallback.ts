import { type LocaleCode, locales } from '@/locales';
import { type ResumeData } from '@/types/resume';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import {
  getDefaultTwoColumnLayout,
  isTwoColumnTheme,
  normalizeTwoColumnLayout,
} from '@/utils/layoutMetadata';
import { lookupTranslation } from '@/utils/translationLookup';
import { isImageVisible, isVisible, visibleCustomSectionItems } from '@/utils/visibility';

/**
 * Checks if the resume has any meaningful content.
 * Returns true if the resume is essentially empty.
 */
/**
 * The value of a stored string field when it counts as *supplied*: non-empty
 * after trimming, `''` for anything else.
 *
 * ⚠️ **`typeof`, not `?.`, and that is a crash rather than a nicety.** A `basics`
 * field is arbitrary JSON — `validation.ts`'s `s()` assigns a non-date value
 * through unchanged, so `{"basics":{"summary":{}}}` reaches the store as an
 * object. Measured: every one of the nine `?.trim()` reads below
 * threw `data.basics.summary?.trim is not a function`, taking `isResumeEmpty`
 * down and with it `Viewer.tsx`, `preview-utils.tsx` and the placeholder
 * enrichment. Pre-existing; surfaced by the trimmed-blank guard, and fixed here
 * because it is the same rule in the same file.
 *
 * ⚠️ It also carries the trim that made `generateJSONWithPlaceholders` disagree
 * with this function — see the location block there.
 */
const filled = (value?: string): string => (typeof value === 'string' ? value.trim() : '');

export const isResumeEmpty = (data: ResumeData): boolean => {
  const hiddenIds = data.meta?.content?.hiddenIds || [];
  const hiddenSections = data.meta?.content?.hiddenSections || [];

  const hasVisibleBasicField =
    filled(data.basics.name) ||
    filled(data.basics.email) ||
    filled(data.basics.label) ||
    filled(data.basics.summary) ||
    filled(data.basics.phone) ||
    filled(data.basics.url) ||
    // A hidden photo shows nothing, so it is not content.
    (filled(data.basics.image) && isImageVisible(hiddenIds)) ||
    filled(data.basics.location.city) ||
    filled(data.basics.location.address);

  const hasVisibleProfiles = !!data.basics.profiles?.some((profile) =>
    isVisible('profiles', profile, hiddenIds, hiddenSections),
  );

  if (hasVisibleBasicField || hasVisibleProfiles) return false;

  // ⚠️ A **second** verbatim restatement of the nine basics reads above stood
  // here as `hasBasics`, and its only consumer was an `if` with an **empty
  // body** — a comment saying "continue checking arrays below", which is what the
  // code does anyway. So it was a drift copy of the check three lines up, plus
  // dead control flow, and the `hasVisibleBasicField` guard above already
  // returned for every state it could describe. Deleted rather than hardened,
  // per the delete-dead-branches rule (`.claude/rules/testing.md`); found
  // because the non-string guard kept throwing at `data.basics.summary?.trim`
  // after the first copy was fixed.

  // ⚠️ `ALL_SECTION_KEYS`, not a restated twelve. This list was the first copy a
  // census of restated section lists found, and it is the worst-placed of them: a résumé
  // holding only a section this list forgets reads as *empty*, so the
  // placeholder résumé is rendered over the user's real data. Deleting the copy
  // is the fix; guarding it would leave the next section to be added
  // depending on someone editing two places.
  for (const section of ALL_SECTION_KEYS) {
    const content = data[section];
    if (
      Array.isArray(content) &&
      content.some((item) => isVisible(section, item, hiddenIds, hiddenSections))
    ) {
      return false;
    }
  }

  // A résumé holding only custom sections is not empty either.
  for (const section of data.customSections ?? []) {
    if (visibleCustomSectionItems(section, hiddenIds, hiddenSections).length > 0) return false;
  }

  return true;
};

/**
 * Enriches the resume data with localized placeholders for previewing.
 */
export const generateJSONWithPlaceholders = (
  data: ResumeData,
  t: (key: string) => string,
): ResumeData => {
  // If resume is not empty, don't show full placeholders
  if (!isResumeEmpty(data)) return data;

  const placeholder = (key: string) => t(`examples.${key}`);

  /**
   * Splits a comma-separated string from translations into an array.
   * Stability: Handles empty strings, trimming, and filtering.
   */
  const splitFallback = (str?: string) => {
    if (!str) return [];
    // Split by standard comma, full-width comma (，), or ideographic comma (、)
    const parts = str
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [];
  };

  /**
   * Safely gets an item from a split array, looping through the items (modulo)
   * if the current index exceeds the array length. This ensures varied data
   * and prevents "undefined" values.
   */
  const getSafe = (arr: string[], index: number, original: string) => {
    if (arr.length === 0) return original;
    return arr[index % arr.length];
  };

  const themeName = data.meta.theme.name;
  const twoColumnDefaults = isTwoColumnTheme(themeName)
    ? normalizeTwoColumnLayout(getDefaultTwoColumnLayout(themeName), data, data.meta)
    : null;

  // ⚠️ The sample clears `hiddenIds` and `hiddenSections`, so anything of the
  // user's that it keeps must already be filtered to what they show — else a
  // hidden photo, profile or custom entry renders beside the sample.
  const { hiddenIds = [], hiddenSections = [] } = data.meta.content;

  return {
    ...data,
    customSections: (data.customSections ?? []).map((section) => ({
      ...section,
      items: visibleCustomSectionItems(section, hiddenIds, hiddenSections),
    })),
    meta: {
      ...data.meta,
      content: {
        ...data.meta.content,
        hiddenIds: [],
        hiddenSections: [],
        order: twoColumnDefaults
          ? {
              oneColumn: data.meta.content.order?.oneColumn || [],
              twoColumn: {
                ...data.meta.content.order?.twoColumn,
                main: twoColumnDefaults.main,
                sidebar: twoColumnDefaults.sidebar,
              },
            }
          : data.meta.content.order,
      },
    },
    basics: {
      ...data.basics,
      // ⚠️ **All seven, not the five in the location block below.** The scope was
      // re-derived from the property rather than taken from the finding: the guard
      // is "a stored string decides whether the placeholder runs", and `grep -c
      // '|| placeholder('` plus `image`'s literal fallback finds **twelve** such
      // guards in this function. `isResumeEmpty` trims `name`, `email`, `label`,
      // `summary`, `phone`, `url` and `image` exactly as it trims `city` and
      // `address`, so a whitespace-only name reached the same disagreement: the
      // résumé reads as empty, the placeholders run, and `'   ' || placeholder`
      // keeps the space — a résumé rendering with a blank name where the whole
      // point of this function is that it renders an example one.
      name: filled(data.basics.name) || placeholder('basics.john_doe'),
      label: filled(data.basics.label) || placeholder('basics.label'),
      image: (isImageVisible(hiddenIds) && filled(data.basics.image)) || '/images/mok_image.png',
      email: filled(data.basics.email) || placeholder('basics.email'),
      phone: filled(data.basics.phone) || placeholder('basics.phone'),
      url: filled(data.basics.url) || placeholder('basics.url'),
      summary: filled(data.basics.summary) || placeholder('basics.summary'),
      // ⚠️ **`filled`, not `||`, and the difference is one typed space.**
      // These five guards decide per field whether the user has supplied
      // something; a whitespace-only value is *truthy*, so `'   '` counted as
      // supplied and the placeholder was skipped. Meanwhile `isResumeEmpty`
      // twenty lines up trims (`location.city?.trim()`), so the résumé reads as
      // empty, placeholders fire, and this line then keeps the blank — the two
      // halves of the same file disagreeing about what "supplied" means.
      //
      // ⚠️ It was once *visible*, and trimming blanks made it **silent**, which is
      // why it is fixed alongside that trim. Measured on an
      // otherwise-empty résumé with one space typed into City:
      //
      // ```
      // original      "123 Main St,    , NY 10001"   ← blank part, visible
      // earlier fix   "123 Main St, NY 10001"        ← city silently gone
      // fixed         "123 Main St, New York, NY 10001"
      // ```
      //
      // `formatFullAddress` now trims, so the blank part no longer prints — it
      // just drops out, and the placeholder that should have replaced it never
      // ran. Another member of the truthy-blank family (`activeFields`,
      // `isResumeEmpty`, this).
      //
      // ⚠️ `typeof` as well as trim, for `formatFullAddress`'s reason: a stored
      // location field is arbitrary JSON and `?.trim()` only guards nullish.
      location: {
        ...data.basics.location,
        address: filled(data.basics.location.address) || placeholder('basics.address'),
        postalCode: filled(data.basics.location.postalCode) || placeholder('basics.postal_code'),
        city: filled(data.basics.location.city) || placeholder('basics.city'),
        region: filled(data.basics.location.region) || placeholder('basics.region'),
        countryCode: filled(data.basics.location.countryCode) || placeholder('basics.country_code'),
      },
      // The CV reads as empty only when no profile is shown, so the user's
      // profiles here are all hidden: the sample's own stands in.
      profiles: [
        {
          network: 'LinkedIn',
          username: placeholder('basics.username'),
          url: placeholder('basics.url'),
          visible: true,
        },
      ],
    },
    work: [
      {
        name: placeholder('work.company'),
        position: placeholder('work.position'),
        location: placeholder('work.location'),
        url: placeholder('common.https'),
        startDate: '2020-01',
        endDate: '',
        summary: placeholder('work.summary'),
        highlights: [placeholder('work.highlights')],
        visible: true,
      },
    ],
    volunteer: [
      {
        organization: placeholder('volunteer.organization'),
        position: placeholder('volunteer.position'),
        location: placeholder('volunteer.location'),
        url: placeholder('common.https'),
        startDate: '2019-01',
        endDate: '2019-12',
        summary: placeholder('volunteer.summary'),
        highlights: splitFallback(placeholder('work.highlights')),
        visible: true,
      },
    ],
    education: [
      {
        institution: placeholder('education.institution'),
        location: placeholder('education.location'),
        url: placeholder('common.https'),
        area: placeholder('education.area'),
        studyType: placeholder('education.study_type'),
        startDate: '2016-09',
        endDate: '2020-06',
        score: placeholder('education.score'),
        courses: splitFallback(placeholder('education.courses')),
        visible: true,
      },
    ],
    skills: splitFallback(placeholder('skills.name')).map((name) => ({
      name,
      level: 3,
      keywords: splitFallback(placeholder('skills.keywords')),
      visible: true,
    })),
    projects: [
      {
        name: placeholder('projects.name'),
        description: placeholder('projects.type'),
        url: placeholder('common.https'),
        startDate: '2023-01',
        endDate: '2023-03',
        highlights: splitFallback(placeholder('projects.highlights')),
        roles: [],
        keywords: [],
        entity: placeholder('projects.entity'),
        location: placeholder('projects.location'),
        type: placeholder('projects.type'),
        visible: true,
      },
    ],
    privateProjects: [
      {
        name: placeholder('private_projects.name'),
        description: placeholder('private_projects.type'),
        url: placeholder('common.https'),
        startDate: '2022-06',
        endDate: '2022-08',
        highlights: splitFallback(placeholder('projects.highlights')),
        roles: [],
        keywords: [],
        entity: placeholder('projects.entity'),
        location: placeholder('private_projects.location'),
        type: placeholder('private_projects.type'),
        visible: true,
      },
    ],
    languages: splitFallback(placeholder('languages.name')).map((lang) => ({
      language: lang,
      certificate: 'C1',
      level: 5,
      visible: true,
    })),
    certificates: (() => {
      const names = splitFallback(placeholder('certificates.name'));
      const issuers = splitFallback(placeholder('certificates.issuer'));
      const count = names.length;

      return Array.from({ length: count }).map((_, i) => ({
        name: getSafe(names, i, placeholder('certificates.name')),
        issuer: getSafe(issuers, i, placeholder('certificates.issuer')),
        date: '2022-01',
        url: placeholder('common.https'),
        visible: true,
      }));
    })(),
    awards: (() => {
      const titles = splitFallback(placeholder('awards.title'));
      const awarders = splitFallback(placeholder('awards.awarder'));
      const count = titles.length;

      return Array.from({ length: count }).map((_, i) => ({
        title: getSafe(titles, i, placeholder('awards.title')),
        awarder: getSafe(awarders, i, placeholder('awards.awarder')),
        date: '2021-05',
        location: placeholder('awards.location'),
        summary: placeholder('awards.summary'),
        url: placeholder('common.https'),
        visible: true,
      }));
    })(),
    interests: [
      {
        name: placeholder('interests.name'),
        keywords: [],
        visible: true,
      },
    ],
    publications: (() => {
      const titles = splitFallback(placeholder('publications.title'));
      const publishers = splitFallback(placeholder('publications.publisher'));
      const count = titles.length;

      return Array.from({ length: count }).map((_, i) => ({
        name: getSafe(titles, i, placeholder('publications.title')),
        publisher: getSafe(publishers, i, placeholder('publications.publisher')),
        releaseDate: '2021-10',
        url: placeholder('common.https'),
        summary: placeholder('publications.summary'),
        visible: true,
      }));
    })(),
    references: [
      {
        name: placeholder('references.name'),
        reference: placeholder('references.text'),
        visible: true,
      },
    ],
  };
};

/**
 * Non-hook variant of the placeholder enrichment for contexts without React
 * (Typst serialization, exports). Resolves through `lookupTranslation`, exactly
 * as `tCV` does, so an export never disagrees with the screen.
 */
export const enrichResumeWithPlaceholders = (data: ResumeData): ResumeData => {
  const cvLanguage = (data.meta?.theme?.locale || 'en') as LocaleCode;
  const locale = locales[cvLanguage] || locales.en;
  const t = (path: string) => lookupTranslation(locale, path) ?? path;
  return generateJSONWithPlaceholders(data, t);
};
