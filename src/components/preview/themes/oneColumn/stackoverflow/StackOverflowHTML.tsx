import { MainHeader } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/MainHeader';
import { MainAwardsSection as MainAwards } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Volunteer';
import { MainWorkSection as MainWork } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/HTML/main/Work';
import { PALETTES } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import {
  type ThemeProps,
  getOneColumnSections,
  getSectionLabels,
  getVisibleData,
  resolveHTMLFontStack,
  resolveLayoutSection,
  resolvePalette,
  useBoundFormatters,
} from '@/components/preview/themes/shared';
import type { ResumeMeta } from '@/types/resume';

export const StackOverflowHTML = ({ data }: ThemeProps) => {
  const { meta, basics } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const fontStack = resolveHTMLFontStack('stackoverflow');

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
  };

  const sectionRegistry: Record<string, UnifiedSectionComponent> = {
    work: MainWork,
    education: MainEducation,
    skills: MainSkills,
    projects: MainProjects,
    privateProjects: MainProjects,
    volunteer: MainVolunteer,
    awards: MainAwards,
    certificates: MainCertificates,
    publications: MainPublications,
    languages: MainLanguages,
    interests: MainInterests,
    references: MainReferences,
  };

  const mainSectionIds = getOneColumnSections(meta, data);

  const vData = getVisibleData(data);

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontSize: '1em',
        lineHeight: 1.6,
        color: p.dark,
        backgroundColor: p.bg,
        minHeight: '100%',
      }}
    >
      <MainHeader data={basics} {...props} />

      <div style={{ padding: '28px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {mainSectionIds.map((id) => {
            const section = resolveLayoutSection(id, data, { v: vData, labels });
            const Comp = section && sectionRegistry[section.key];
            if (!section || !Comp) return null;
            return (
              <Comp
                key={id}
                data={section.v[section.key]}
                label={section.labels[section.key]}
                {...props}
                labels={section.labels}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
