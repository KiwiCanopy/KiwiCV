import {
  ThemeHeading,
  type ThemeProps,
  formatFullAddress,
  getImageContainerStylesHTML,
  getImageStylesHTML,
  getProfileDisplayHTML,
  getSectionLabels,
  getTwoColumnSections,
  getVisibleData,
  resolveHTMLFontStack,
  resolveLayoutSection,
  resolvePalette,
  useBoundFormatters,
} from '@/components/preview/themes/shared';
import { MainAwardsSection as MainAwards } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Volunteer';
// Main Sections
import { MainWorkSection as MainWork } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/main/Work';
import { SideAwardsSection as SideAwards } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Awards';
import { SideCertificatesSection as SideCertificates } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Certificates';
import { SideEducationSection as SideEducation } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Education';
import { SideInterestsSection as SideInterests } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Interests';
import { SideLanguagesSection as SideLanguages } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Languages';
import { SideProjectsSection as SideProjects } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Projects';
import { SidePublicationsSection as SidePublications } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Publications';
import { SideReferencesSection as SideReferences } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/References';
import { SideSkillsSection as SideSkills } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Skills';
import { SideVolunteerSection as SideVolunteer } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Volunteer';
// Side Sections
import { SideWorkSection as SideWork } from '@/components/preview/themes/twoColumn/misty/helpers/HTML/side/Work';
import { PALETTES_HTML as PALETTES } from '@/components/preview/themes/twoColumn/misty/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

export const MistyHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale?.sections || {}, meta?.theme?.params?.sectionLabels);
  const fontStack = resolveHTMLFontStack('misty');

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const baseSize = 14 * fontScale;
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';

  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);
  const visibleData = getVisibleData(data);

  const sectionRegistry: Record<
    string,
    { main?: UnifiedSectionComponent; side?: UnifiedSectionComponent }
  > = {
    work: { main: MainWork, side: SideWork },
    education: { main: MainEducation, side: SideEducation },
    skills: { main: MainSkills, side: SideSkills },
    projects: { main: MainProjects, side: SideProjects },
    privateProjects: { main: MainProjects, side: SideProjects },
    volunteer: { main: MainVolunteer, side: SideVolunteer },
    awards: { main: MainAwards, side: SideAwards },
    certificates: { main: MainCertificates, side: SideCertificates },
    publications: { main: MainPublications, side: SidePublications },
    languages: { main: MainLanguages, side: SideLanguages },
    interests: { main: MainInterests, side: SideInterests },
    references: { main: MainReferences, side: SideReferences },
  };

  const header = basics ? (
    <div
      style={{
        padding: '32px 40px 28px',
        borderBottom: `1px solid ${p.border}`,
        marginBottom: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '24px',
        backgroundColor: p.bg,
      }}
    >
      {basics.image && visibleData.imageVisible && (
        <div style={getImageContainerStylesHTML(meta, { width: 100, borderColor: p.border })}>
          <img
            src={basics.image}
            alt={basics.name}
            style={getImageStylesHTML(meta, { width: '100%' })}
          />
        </div>
      )}

      <div style={{ flex: 1 }}>
        <ThemeHeading
          style={{
            fontSize: '2.571em',
            fontWeight: 800,
            color: p.text,
            margin: '0 0 4px 0',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {basics.name}
        </ThemeHeading>
        <h2
          style={{
            fontSize: '1.143em',
            fontWeight: 500,
            color: p.primary,
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {basics.label}
        </h2>
        {basics.summary && (
          <div
            style={{
              fontSize: '0.929em',
              color: p.textMuted,
              lineHeight: 1.5,
              marginBottom: '12px',
              maxWidth: '600px',
            }}
          >
            {basics.summary}
          </div>
        )}

        {/* Contact row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '8px',
          }}
        >
          {basics.email && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.857em',
                color: p.textMuted,
              }}
            >
              <Mail size={12} style={{ color: p.primary }} />
              <span>{basics.email}</span>
            </div>
          )}
          {basics.phone && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.857em',
                color: p.textMuted,
              }}
            >
              <Phone size={12} style={{ color: p.primary }} />
              <span>{basics.phone}</span>
            </div>
          )}
          {formatFullAddress(basics.location, cvLocale) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.857em',
                color: p.textMuted,
              }}
            >
              <MapPin size={12} style={{ color: p.primary }} />
              <span>{formatFullAddress(basics.location, cvLocale)}</span>
            </div>
          )}
          {basics.url && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.857em',
                color: p.textMuted,
              }}
            >
              <Globe size={12} style={{ color: p.primary }} />
              <a
                href={basics.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: p.textMuted,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {basics.url.replace(/^https?:\/\//, '')}
                <ExternalLink size={10} style={{ opacity: 0.4 }} />
              </a>
            </div>
          )}
          {visibleData.profiles.map((profile, i) => {
            const { Icon, text } = getProfileDisplayHTML(profile);

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.857em',
                  color: p.textMuted,
                }}
              >
                <Icon size={12 * fontScale} style={{ color: p.primary }} />
                {profile.url ? (
                  <>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: p.textMuted,
                        textDecoration: 'none',
                      }}
                    >
                      {text}
                    </a>
                    <ExternalLink size={10} style={{ opacity: 0.4 }} />
                  </>
                ) : (
                  <span>{text}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontSize: `${baseSize}px`,
        backgroundColor: p.bg,
        minHeight: '100%',
        padding: '32px 20px',
        color: p.text,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {header}

        <div
          style={{
            display: 'flex',
            flexDirection: sidebarPosition === 'left' ? 'row' : 'row-reverse',
            alignItems: 'stretch',
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: '32%',
              backgroundColor: p.bgSidebar,
              borderRight: sidebarPosition === 'left' ? `1px solid ${p.border}` : 'none',
              borderLeft: sidebarPosition === 'right' ? `1px solid ${p.border}` : 'none',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {sideSectionIds.map((id) => {
              const section = resolveLayoutSection(id, data, { v: visibleData, labels });
              const Entry = section && sectionRegistry[section.key]?.side;
              if (!section || !Entry) return null;
              return (
                <Entry
                  key={id}
                  data={section.v[section.key]}
                  p={p}
                  labels={section.labels}
                  label={section.labels[section.key] || section.key}
                  cvLocale={cvLocale}
                  formatCVDate={formatCVDate}
                  formatCVDateRange={formatCVDateRange}
                  fontScale={1}
                />
              );
            })}
          </div>

          {/* Main Content */}
          <div
            style={{
              width: '68%',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {mainSectionIds.map((id) => {
              const section = resolveLayoutSection(id, data, { v: visibleData, labels });
              const Entry = section && sectionRegistry[section.key]?.main;
              if (!section || !Entry) return null;
              return (
                <Entry
                  key={id}
                  data={section.v[section.key]}
                  p={p}
                  labels={section.labels}
                  label={section.labels[section.key] || section.key}
                  cvLocale={cvLocale}
                  formatCVDate={formatCVDate}
                  formatCVDateRange={formatCVDateRange}
                  fontScale={1}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
