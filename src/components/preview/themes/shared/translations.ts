import { type LocaleCode, locales } from '@/locales';
import { type ResumeData, THEME_PARAM_DEFAULTS } from '@/types/resume';

import { formatDate, formatDateRange } from './dates';
import type { CVLocaleMetadata, SectionLabelKey } from './types';

const DEFAULT_SECTION_LABELS: Record<SectionLabelKey, string> = {
  work: 'Work Experience',
  volunteer: 'Volunteer',
  education: 'Education',
  awards: 'Awards',
  certificates: 'Certificates',
  publications: 'Publications',
  skills: 'Skills',
  languages: 'Languages',
  interests: 'Interests',
  references: 'References',
  projects: 'Projects',
  privateProjects: 'Private Projects',
  about: 'About',
  contact: 'Contact',
  customSection: 'Additional details',
};

/**
 * Every key a user can override, as a **value** — the label inventory
 * `SectionLabelKey` only describes at the type level.
 *
 * ⚠️ Read off `DEFAULT_SECTION_LABELS` rather than written out, so this is not a
 * fifteenth copy of the inventory. `Record<SectionLabelKey, string>` above already
 * makes a missing key `TS2741` and a stray one `TS2353`, which is what lets the
 * `Object.keys` cast here be safe rather than a claim.
 *
 * Exported for `sectionLabelParity.test.ts`, which needs the **label-only** keys —
 * `SectionLabelKey` minus `ALL_SECTION_KEYS` — to sweep `about` and `contact`. It
 * had skipped them because it derived its inventory from `ALL_SECTION_KEYS`, which
 * correctly excludes them (they are labels, not sections) and therefore
 * silently excluded them from the parity property too. Measured before adding:
 * five theme/label pairs read them (lunar `contact`, soft `about`, swiss-grid
 * `about` and `contact`, timeless `about`) and all five reach **both** outputs in
 * **both** placements, so this pins a property that already holds rather than
 * recording a defect.
 */
export const ALL_SECTION_LABEL_KEYS = Object.keys(DEFAULT_SECTION_LABELS) as SectionLabelKey[];

/**
 * Get all section labels for the given locale, with optional user overrides.
 * User overrides are stored in `meta.theme.params.sectionLabels`.
 */
export function getSectionLabels(
  baseLabels?: Partial<Record<SectionLabelKey, string>>,
  userOverrides?: Record<string, string>,
): Record<SectionLabelKey, string> {
  return {
    ...DEFAULT_SECTION_LABELS,
    ...(baseLabels || {}),
    ...(userOverrides || {}),
  } as Record<SectionLabelKey, string>;
}

/**
 * Fetch theme translation mapping for a given locale dynamically from the locales directory
 */
export function getThemeTranslations(localeCode: string = 'en'): CVLocaleMetadata {
  const code = localeCode as LocaleCode;
  const translation = locales[code] || locales['en'];
  const theme_translations = translation.theme_translations || locales['en'].theme_translations;
  const preview = translation.preview || locales['en'].preview;
  return {
    code,
    present: theme_translations.present,
    bcp47: theme_translations.bcp47,
    sections: theme_translations.sections,
    tabTitle: preview.tab_title,
    // A metadata object built from a bare locale code carries no résumé, so the
    // neutral rule is the only honest value here. `getBoundFormatters` replaces
    // it with the rendered résumé's own schema.
    addressSchema: { mode: 'default' },
    boldHeaderWork: THEME_PARAM_DEFAULTS.boldHeaderWork,
    boldHeaderEducation: THEME_PARAM_DEFAULTS.boldHeaderEducation,
  };
}

/**
 * Get bound formatting functions for a given resume data.
 * Useful for PDF themes where hooks cannot be used.
 */
export function getBoundFormatters(data: ResumeData) {
  const { meta } = data;
  const cvLocale = getThemeTranslations(meta?.theme?.locale || 'en');

  // Propagate render-time settings to all child components via the shared
  // cvLocale metadata object. ⚠️ `addressSchema` rides here for the same reason
  // and is load-bearing: it is how `formatFullAddress` formats the résumé it was
  // handed instead of whatever résumé the store currently holds.
  cvLocale.boldHeaderWork =
    meta?.theme?.params?.boldHeaderWork || THEME_PARAM_DEFAULTS.boldHeaderWork;
  cvLocale.boldHeaderEducation =
    meta?.theme?.params?.boldHeaderEducation || THEME_PARAM_DEFAULTS.boldHeaderEducation;
  cvLocale.addressSchema = meta?.theme?.params?.addressSchema || { mode: 'default' };

  const rawName: unknown = data.basics?.name;
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  const cvTitle = name
    ? (cvLocale.tabTitle || '{{name}} – Resume').replace('{{name}}', () => name)
    : '';

  return {
    cvLocale,
    cvTitle,
    formatCVDate: (date?: string | null) => formatDate(date, cvLocale),
    formatCVDateRange: (start?: string | null, end?: string | null) =>
      formatDateRange(start, end, cvLocale),
  };
}

/**
 * Hook version of getBoundFormatters for HTML themes.
 */
export function useBoundFormatters(data: ResumeData) {
  return getBoundFormatters(data);
}
