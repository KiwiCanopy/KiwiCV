import { MainHeader } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/MainHeader';
import { MainAwardsSection as MainAwards } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Volunteer';
import { MainWorkSection as MainWork } from '@/components/preview/themes/oneColumn/plain/helpers/HTML/main/Work';
import { PALETTES } from '@/components/preview/themes/oneColumn/plain/helpers/shared/constants';
import type {
  PlainSectionComponent,
  PlainStyles,
} from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import {
  type ThemeProps,
  getOneColumnSections,
  getSectionLabels,
  getVisibleData,
  resolveLayoutSection,
  resolvePalette,
  useBoundFormatters,
} from '@/components/preview/themes/shared';
import type { ResumeMeta } from '@/types/resume';

export const PlainHTML = ({ data }: ThemeProps) => {
  const { meta, basics } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;

  const props = {
    p,
    labels,
    cvLocale,
    formatCVDate,
    formatCVDateRange,
    fontScale,
    meta: meta as ResumeMeta,
    styles: {} as PlainStyles,
  };

  const sectionRegistry: Record<string, { main: PlainSectionComponent }> = {
    work: { main: MainWork },
    education: { main: MainEducation },
    skills: { main: MainSkills },
    projects: { main: MainProjects },
    privateProjects: { main: MainProjects },
    volunteer: { main: MainVolunteer },
    awards: { main: MainAwards },
    certificates: { main: MainCertificates },
    publications: { main: MainPublications },
    languages: { main: MainLanguages },
    interests: { main: MainInterests },
    references: { main: MainReferences },
  };

  const mainSectionIds = getOneColumnSections(meta, data);
  const vData = getVisibleData(data);

  return (
    <div
      style={{
        backgroundColor: p.bg,
        minHeight: '100%',
        padding: '30px',
        color: p.text,
        fontSize: '14px',
        fontFamily: 'inherit',
      }}
    >
      <MainHeader
        data={basics}
        profiles={vData.profiles}
        imageVisible={vData.imageVisible}
        {...props}
      />

      {basics.summary && (
        <section style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '13px', margin: 0, color: p.textMuted }}>{basics.summary}</p>
        </section>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {mainSectionIds.map((id) => {
          const section = resolveLayoutSection(id, data, { v: vData, labels });
          const Comp = section && sectionRegistry[section.key]?.main;
          if (!section || !Comp) return null;
          return (
            <Comp
              key={id}
              data={section.v[section.key]}
              label={section.labels[section.key] || section.key}
              {...props}
              labels={section.labels}
            />
          );
        })}
      </div>
    </div>
  );
};
