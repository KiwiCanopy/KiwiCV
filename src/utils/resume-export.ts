import { type AddressFieldKey, type ResumeData } from '@/types/resume';
import { customSectionToken } from '@/utils/layout/customSections';
import { toResumeJson } from '@/utils/passthrough';
import {
  isImageVisible,
  shownLocationFields,
  visibleCustomSectionItems,
  visibleSections,
} from '@/utils/visibility';

export type ResumeExportType = 'standard' | 'reduced';

const stripInternalFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripInternalFields);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !['visible', '_vId', '_imageVId', 'imageVisible'].includes(key))
      .map(([key, nestedValue]) => [key, stripInternalFields(nestedValue)]);

    return Object.fromEntries(entries);
  }

  return value;
};

export const getFilteredResumeData = (
  resume: ResumeData,
  type: ResumeExportType,
): Record<string, unknown> | Partial<ResumeData> => {
  // Standard JSON (Clean) -> No 'meta'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { meta, ...cleanResume } = resume;

  if (type === 'standard') {
    // Pass-through goes back to the top level: third-party parsers are its audience.
    const { meta: _meta, ...standard } = toResumeJson(resume);
    return standard;
  }

  // Reduced JSON (Public) -> Filtered hidden items, removed 'visible' keys.
  // The cover letter is dropped entirely: it targets a specific company and
  // carries recipient PII, so it has no place in a publicly hostable export.
  // Pass-through is dropped too: blocks KiwiCV does not model stay out of public JSON.
  const { coverLetter: _coverLetter, passthrough: _passthrough, ...publicResume } = cleanResume;

  const hiddenIds = resume.meta?.content?.hiddenIds || [];
  const hiddenSections = resume.meta?.content?.hiddenSections || [];
  // The renderers' own projection, so public JSON never holds what the CV
  // hides — a whole hidden section included.
  const { profiles, ...sections } = visibleSections(resume);
  const shownLocation = shownLocationFields(resume.meta?.theme?.params);

  const reducedResumeData = {
    ...publicResume,
    ...sections,
    // Hidden custom sections and hidden entries stay out of public JSON.
    customSections: cleanResume.customSections
      .filter((section) => !hiddenSections.includes(customSectionToken(section.id)))
      .map((section) => ({
        ...section,
        items: visibleCustomSectionItems(section, hiddenIds, hiddenSections),
      })),
    // Imported-only fields no theme renders and the editor cannot show.
    projects: sections.projects.map(({ roles: _r, keywords: _k, ...project }) => project),
    privateProjects: sections.privateProjects.map(
      ({ roles: _r, keywords: _k, ...project }) => project,
    ),
    basics: {
      ...cleanResume.basics,
      // Only the address parts the CV prints.
      location: Object.fromEntries(
        Object.entries(cleanResume.basics.location).map(([field, value]) => [
          field,
          shownLocation.has(field as AddressFieldKey) ? value : '',
        ]),
      ) as ResumeData['basics']['location'],
      image: isImageVisible(hiddenIds) ? cleanResume.basics.image : '',
      profiles,
    },
  };

  return stripInternalFields(reducedResumeData) as Record<string, unknown>;
};

/**
 * What a GitHub repo anyone can read receives: the `reduced` tier plus
 * the design, so a restore keeps the CV's look (owner, 2026-10-05). `hiddenIds`
 * stays out, as do a hidden section's renamed heading and a footer location the
 * CV does not print.
 */
export const getPublicBackupData = (resume: ResumeData): Record<string, unknown> => {
  const { meta } = resume;
  const hiddenSections = meta.content.hiddenSections || [];
  const params = meta.theme.params;
  const footerShown = params.showFooter !== false;
  return {
    ...(getFilteredResumeData(resume, 'reduced') as Record<string, unknown>),
    meta: {
      ...meta,
      theme: {
        ...meta.theme,
        params: {
          ...params,
          sectionLabels: Object.fromEntries(
            Object.entries(params.sectionLabels || {}).filter(
              ([section]) => !hiddenSections.includes(section),
            ),
          ),
          footerLocation: footerShown ? params.footerLocation : '',
          footerDate: footerShown ? params.footerDate : '',
        },
      },
      content: { ...meta.content, hiddenIds: [] },
    },
  };
};
