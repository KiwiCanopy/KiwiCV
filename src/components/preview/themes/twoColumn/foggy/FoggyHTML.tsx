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
import { MainAwardsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Awards';
import { MainCertificatesSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Certificates';
import { MainEducationSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Education';
import { MainInterestsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Interests';
import { MainLanguagesSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Languages';
import { MainProjectsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Projects';
import { MainPublicationsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Publications';
import { MainReferencesSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/References';
import { MainSkillsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Skills';
import { MainVolunteerSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Volunteer';
// Modular Main Sections
import { MainWorkSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/main/Work';
import { SideAwardsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Awards';
import { SideCertificatesSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Certificates';
import { SideEducationSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Education';
import { SideInterestsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Interests';
import { SideLanguagesSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Languages';
import { SideProjectsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Projects';
import { SidePublicationsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Publications';
import { SideReferencesSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/References';
import { SideSkillsSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Skills';
import { SideVolunteerSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Volunteer';
// Modular Side Sections
import { SideWorkSection } from '@/components/preview/themes/twoColumn/foggy/helpers/HTML/side/Work';
import { PALETTES_HTML } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import { ExternalLink, Folder, Globe, Mail, MapPin, Phone, Rocket } from 'lucide-react';

export const FoggyHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;

  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections, meta?.theme?.params?.sectionLabels);
  const fontStack = resolveHTMLFontStack('foggy');
  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);

  const p = resolvePalette(PALETTES_HTML, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';
  const baseSize = 14 * fontScale;

  const v = getVisibleData(data);

  // Unified Section Registry
  const sectionRegistry: Record<
    string,
    { main?: UnifiedSectionComponent; side?: UnifiedSectionComponent }
  > = {
    work: { main: MainWorkSection, side: SideWorkSection },
    education: { main: MainEducationSection, side: SideEducationSection },
    projects: { main: MainProjectsSection, side: SideProjectsSection },
    privateProjects: { main: MainProjectsSection, side: SideProjectsSection },
    volunteer: { main: MainVolunteerSection, side: SideVolunteerSection },
    awards: { main: MainAwardsSection, side: SideAwardsSection },
    certificates: { main: MainCertificatesSection, side: SideCertificatesSection },
    publications: { main: MainPublicationsSection, side: SidePublicationsSection },
    skills: { main: MainSkillsSection, side: SideSkillsSection },
    languages: { main: MainLanguagesSection, side: SideLanguagesSection },
    interests: { main: MainInterestsSection, side: SideInterestsSection },
    references: { main: MainReferencesSection, side: SideReferencesSection },
    /* profiles removed from registry */
  };

  /**
   * ⚠️ **One expression for both columns, and `Folder` rather than
   * `FolderKanban`.** The sidebar and main branches each carried a
   * byte-identical copy of this ternary; foggy was the theme that kept them in
   * step, which is what made it the proof that agreement is achievable. Hoisting
   * it removes the way skyline's equivalent pair drifted apart.
   *
   * `projects` drew `FolderKanban` here against `folder` in the PDF, and
   * `folder-kanban` has no entry in the PDF catalogue at all — so no rename on
   * the export side could ever have closed it. The PDF name wins, which
   * costs foggy the more specific glyph and buys back the only section it
   * disagreed on, with no new hand-drawn SVG.
   */
  const sectionIcon = (sectionId: string) =>
    sectionId === 'projects' ? (
      <Folder size={18} />
    ) : sectionId === 'privateProjects' ? (
      <Rocket size={18} />
    ) : undefined;

  const rootStyles: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize: `${baseSize}px`,
    backgroundColor: p.bg,
    minHeight: '100%',
    padding: '32px 20px',
    color: p.text,
    lineHeight: 1.6,
  };

  return (
    <div style={rootStyles}>
      <div
        style={{
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Full-width Header Card */}
        <div
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${p.border}`,
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          {/* Top Section: Basics */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {basics.image && v.imageVisible && (
              <div
                style={{
                  ...getImageContainerStylesHTML(meta, {
                    width: '140px',
                    borderColor: p.border,
                    borderWidth: 4,
                  }),
                  flexShrink: 0,
                }}
              >
                <img src={basics.image} alt={basics.name} style={getImageStylesHTML(meta)} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <ThemeHeading
                style={{
                  margin: 0,
                  fontSize: '2.8em',
                  fontWeight: 800,
                  color: p.text,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  marginBottom: '10px',
                }}
              >
                {basics.name}
              </ThemeHeading>
              <div
                style={{
                  fontSize: '1.4em',
                  color: p.primary,
                  fontWeight: 600,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {basics.label}
              </div>
              {basics.summary && (
                <p
                  style={{
                    margin: 0,
                    color: p.textMuted,
                    fontSize: '1em',
                    maxWidth: '700px',
                    lineHeight: 1.6,
                  }}
                >
                  {basics.summary}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Section: Contact Icons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              paddingTop: '32px',
              borderTop: `1px solid ${p.border}80`, // Semi-transparent border
            }}
          >
            {basics.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    backgroundColor: `${p.primary}15`,
                    padding: '8px',
                    borderRadius: '8px',
                    color: p.primary,
                  }}
                >
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.95em', fontWeight: 500 }}>{basics.email}</span>
              </div>
            )}
            {basics.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    backgroundColor: `${p.primary}15`,
                    padding: '8px',
                    borderRadius: '8px',
                    color: p.primary,
                  }}
                >
                  <Phone size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.95em', fontWeight: 500 }}>{basics.phone}</span>
              </div>
            )}
            {basics.url && (
              <a
                href={basics.url.startsWith('http') ? basics.url : `https://${basics.url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    backgroundColor: `${p.primary}15`,
                    padding: '8px',
                    borderRadius: '8px',
                    color: p.primary,
                  }}
                >
                  <Globe size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.95em', fontWeight: 500, color: p.text }}>
                  {basics.url.replace(/^https?:\/\//, '')}
                </span>
              </a>
            )}
            {formatFullAddress(basics.location, cvLocale) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    backgroundColor: `${p.primary}15`,
                    padding: '8px',
                    borderRadius: '8px',
                    color: p.primary,
                  }}
                >
                  <MapPin size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.95em', fontWeight: 500 }}>
                  {formatFullAddress(basics.location, cvLocale)}
                </span>
              </div>
            )}
            {v.profiles.map((profile, i) => {
              const { Icon, text } = getProfileDisplayHTML(profile);
              const content = (
                <>
                  <div
                    style={{
                      backgroundColor: `${p.primary}15`,
                      padding: '8px',
                      borderRadius: '8px',
                      color: p.primary,
                    }}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.95em', fontWeight: 500, color: p.text }}>{text}</span>
                  {profile.url && <ExternalLink size={14} style={{ opacity: 0.4 }} />}
                </>
              );

              if (profile.url) {
                return (
                  <a
                    key={i}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'inherit',
                  }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column Grid Area */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              sidebarPosition === 'left' ? 'minmax(280px, 30%) 1fr' : '1fr minmax(280px, 30%)',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              order: sidebarPosition === 'left' ? 1 : 2,
            }}
          >
            {sideSectionIds.map((sectionId) => {
              const section = resolveLayoutSection(sectionId, data, { v, labels });
              const Component = section && sectionRegistry[section.key]?.side;
              if (!section || !Component) return null;

              return (
                <Component
                  isCustomSection={section.isCustom}
                  key={sectionId}
                  data={section.v[section.key]}
                  p={p}
                  labels={section.labels}
                  label={section.labels[section.key] || section.key}
                  icon={sectionIcon(section.key)}
                  fontScale={fontScale}
                  cvLocale={cvLocale}
                  formatCVDate={formatCVDate}
                  formatCVDateRange={formatCVDateRange}
                />
              );
            })}
          </div>

          {/* Main Column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              order: sidebarPosition === 'left' ? 2 : 1,
            }}
          >
            {mainSectionIds.map((sectionId) => {
              const section = resolveLayoutSection(sectionId, data, { v, labels });
              const Component = section && sectionRegistry[section.key]?.main;
              if (!section || !Component) return null;

              return (
                <Component
                  isCustomSection={section.isCustom}
                  key={sectionId}
                  data={section.v[section.key]}
                  p={p}
                  labels={section.labels}
                  label={section.labels[section.key] || section.key}
                  icon={sectionIcon(section.key)}
                  fontScale={fontScale}
                  cvLocale={cvLocale}
                  formatCVDate={formatCVDate}
                  formatCVDateRange={formatCVDateRange}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
