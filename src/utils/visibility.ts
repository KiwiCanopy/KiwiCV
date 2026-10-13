import {
  ALL_ADDRESS_FIELD_KEYS,
  type AddressFieldKey,
  type CustomSection,
  type ResumeData,
  type ThemeParams,
  type VisibilitySection,
} from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { ALL_SECTION_KEYS, type SectionKey } from '@/utils/layout/constants';
import { customSectionToken } from '@/utils/layout/customSections';

/**
 * Whether the user has hidden neither the entry nor its whole section. The one
 * rule the CV renderers and the public `reduced` export both apply.
 */
export function isVisible(
  section: Exclude<VisibilitySection, 'basics:image'>,
  item: Record<string, unknown>,
  hiddenIds: string[],
  hiddenSections: string[] = [],
): boolean {
  if (hiddenSections.includes(section as string)) return false;
  return !hiddenIds.includes(getSectionItemHash(section, item));
}

/** A custom section's entries the CV shows — none while the section is hidden. */
export const visibleCustomSectionItems = (
  section: CustomSection,
  hiddenIds: string[],
  hiddenSections: string[] = [],
): CustomSection['items'] =>
  section.items.filter((item) =>
    isVisible(customSectionToken(section.id), item, hiddenIds, hiddenSections),
  );

/** Whether the profile photo is shown; hiding it records `basics:image`. */
export const isImageVisible = (hiddenIds: string[]): boolean => !hiddenIds.includes('basics:image');

/** The photo the PDF compiler receives: none while it is hidden. */
export const shownProfileImage = (resume: ResumeData): string | undefined =>
  isImageVisible(resume.meta?.content?.hiddenIds ?? []) ? resume.basics.image : undefined;

export type VisibleSections = { [K in SectionKey]: ResumeData[K] } & {
  profiles: ResumeData['basics']['profiles'];
};

/**
 * Every built-in section and the profiles, minus what the user hid. Derived
 * from `ALL_SECTION_KEYS`, so a new section cannot reach the renderers or the
 * public JSON unfiltered.
 */
export function visibleSections(resume: ResumeData): VisibleSections {
  const hiddenIds = resume.meta?.content?.hiddenIds || [];
  const hiddenSections = resume.meta?.content?.hiddenSections || [];
  const keep = <T>(section: SectionKey | 'profiles', items: readonly T[] | undefined): T[] =>
    (items || []).filter((item) =>
      isVisible(section, item as Record<string, unknown>, hiddenIds, hiddenSections),
    );

  const sections = Object.fromEntries(
    ALL_SECTION_KEYS.map((key) => [key, keep(key, resume[key] as readonly unknown[])]),
  ) as unknown as { [K in SectionKey]: ResumeData[K] };
  return { ...sections, profiles: keep('profiles', resume.basics?.profiles) };
}

/**
 * Whether the footer prints `City, CC` from the résumé's location: on, and no
 * explicit location typed in place of it. `getTypstFooterParts`' own test.
 */
export const footerPrintsCityCountry = (params?: ThemeParams): boolean => {
  if (params?.showFooter === false) return false;
  const footerLocation = params?.footerLocation;
  return footerLocation === 'auto' || footerLocation === undefined || footerLocation === '';
};

/**
 * The location fields the CV prints anywhere: a custom address schema's
 * declared fields (else all, `formatFullAddress`'s fallback), plus city and
 * country when the footer prints them — the footer ignores the schema.
 * Pinned against both producers by `reducedExportPublic.test.ts`.
 */
export function shownLocationFields(params?: ThemeParams): ReadonlySet<AddressFieldKey> {
  const schema = params?.addressSchema;
  if (schema?.mode === 'custom' && Array.isArray(schema.customFields)) {
    const declared = schema.customFields
      .filter((cf) => !!cf && typeof cf === 'object')
      .map((cf) => cf.field)
      .filter((field) => (ALL_ADDRESS_FIELD_KEYS as readonly string[]).includes(field));
    if (declared.length > 0) {
      const shown = new Set<AddressFieldKey>(declared);
      if (footerPrintsCityCountry(params)) {
        shown.add('city');
        shown.add('countryCode');
      }
      return shown;
    }
  }
  return new Set(ALL_ADDRESS_FIELD_KEYS);
}
