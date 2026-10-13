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
import {
  SidebarHeading,
  SidebarItem,
} from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/SharedComponents';
import { MainAwardsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Awards';
import { MainCertificatesSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Certificates';
import { MainEducationSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Education';
import { MainInterestsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Interests';
import { MainLanguagesSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Languages';
import { MainProjectsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Projects';
import { MainPublicationsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Publications';
import { MainReferencesSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/References';
import { MainSkillsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Skills';
import { MainVolunteerSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Volunteer';
// Modular Main Sections
import { MainWorkSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/main/Work';
import { SideAwardsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Awards';
import { SideCertificatesSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Certificates';
import { SideEducationSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Education';
import { SideInterestsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Interests';
import { SideLanguagesSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Languages';
import { SideProjectsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Projects';
import { SidePublicationsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Publications';
import { SideReferencesSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/References';
import { SideSkillsSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Skills';
import { SideVolunteerSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Volunteer';
// Modular Side Sections
import { SideWorkSection } from '@/components/preview/themes/twoColumn/lunar/helpers/HTML/side/Work';
import { PALETTES } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/types';
import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

export const LunarHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const fontStack = resolveHTMLFontStack('lunar');
  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';
  const baseSize = 14 * fontScale;

  const v = getVisibleData(data); // Alias for brevity in registry

  // Layout mode detection
  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);

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
  };

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontSize: `${baseSize}px`,
        lineHeight: 1.6,
        color: p.textMain,
        backgroundColor: p.bg,
      }}
    >
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: sidebarPosition === 'left' ? 'row' : 'row-reverse',
        }}
      >
        {/* ─── Sidebar (Side sections) ─── */}
        <div
          style={{
            width: '18.5em',
            backgroundColor: p.sidebarBg,
            color: p.sidebarText,
            padding: '2.3em 1.7em',
            flexShrink: 0,
          }}
        >
          {basics.image && v.imageVisible && (
            <div style={{ textAlign: 'center', marginBottom: '1.7em' }}>
              <div
                style={{
                  ...getImageContainerStylesHTML(meta, {
                    width: '8.5em',
                    borderWidth: 4,
                    borderColor: 'rgba(255,255,255,0.1)',
                    background: 'transparent',
                  }),
                  display: 'inline-block',
                }}
              >
                <img src={basics.image} alt={basics.name} style={getImageStylesHTML(meta)} />
              </div>
            </div>
          )}
          <div style={{ marginBottom: '2em' }}>
            <SidebarHeading
              color={p.sidebarHeading as string}
              borderColor={p.sidebarBorder as string}
            >
              {labels.contact}
            </SidebarHeading>
            {basics.email && (
              <SidebarItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
                  <Mail size="1em" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.8 }} />
                  <span>{basics.email}</span>
                </div>
              </SidebarItem>
            )}
            {basics.phone && (
              <SidebarItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
                  <Phone size="0.85em" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.8 }} />
                  <span>{basics.phone}</span>
                </div>
              </SidebarItem>
            )}
            {formatFullAddress(basics.location, cvLocale) && (
              <SidebarItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
                  <MapPin size="0.85em" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.8 }} />
                  <span>{formatFullAddress(basics.location, cvLocale)}</span>
                </div>
              </SidebarItem>
            )}
            {basics.url && (
              <SidebarItem>
                <a
                  href={basics.url.startsWith('http') ? basics.url : `https://${basics.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6em',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Globe size="0.85em" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.8 }} />
                  <span style={{ wordBreak: 'break-all' }}>
                    {basics.url.replace(/^https?:\/\//, '')}
                  </span>
                </a>
              </SidebarItem>
            )}
            {v.profiles.map((profile, i: number) => {
              const { Icon, text } = getProfileDisplayHTML(profile);

              return (
                <SidebarItem key={i}>
                  {profile.url ? (
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6em',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <Icon size="1em" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.8 }} />
                      <span>{text}</span>
                      <ExternalLink size="0.85em" style={{ opacity: 0.4 }} />
                    </a>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6em',
                        color: 'inherit',
                      }}
                    >
                      <Icon size="1em" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.8 }} />
                      <span>{text}</span>
                    </div>
                  )}
                </SidebarItem>
              );
            })}
          </div>

          {sideSectionIds.map((sectionId) => {
            const section = resolveLayoutSection(sectionId, data, { v, labels });
            const Component = section && sectionRegistry[section.key]?.side;
            if (!section || !Component) return null;

            return (
              <div key={sectionId} style={{ marginBottom: '1.8em' }}>
                <SidebarHeading
                  color={p.sidebarHeading as string}
                  borderColor={p.sidebarBorder as string}
                >
                  {section.labels[section.key] || section.key}
                </SidebarHeading>
                <Component
                  data={section.v[section.key]}
                  p={p}
                  labels={section.labels}
                  fontScale={fontScale}
                  cvLocale={cvLocale}
                  formatCVDate={formatCVDate}
                  formatCVDateRange={formatCVDateRange}
                />
              </div>
            );
          })}
        </div>

        {/* ─── Main Content (Main sections) ─── */}
        <div style={{ flex: 1, padding: '2.3em 2.6em' }}>
          <div
            style={{
              marginBottom: '2em',
              borderBottom: `2px solid ${p.fg}`,
              paddingBottom: '1.1em',
            }}
          >
            <ThemeHeading style={{ margin: 0, fontSize: '2em', fontWeight: 700, color: p.fg }}>
              {basics.name.toLocaleUpperCase(cvLocale.bcp47)}
            </ThemeHeading>
            {basics.label && (
              <div
                style={{
                  fontSize: '1.14em',
                  color: p.textMain,
                  opacity: 0.8,
                  marginTop: '0.3em',
                  fontWeight: 500,
                }}
              >
                {basics.label.toLocaleUpperCase(cvLocale.bcp47)}
              </div>
            )}
            {basics.summary && (
              <p
                style={{
                  marginTop: '0.86em',
                  fontSize: '0.93em',
                  color: p.textMain,
                  opacity: 0.9,
                  lineHeight: 1.7,
                }}
              >
                {basics.summary}
              </p>
            )}
          </div>

          {mainSectionIds.map((sectionId) => {
            const section = resolveLayoutSection(sectionId, data, { v, labels });
            const Component = section && sectionRegistry[section.key]?.main;
            if (!section || !Component) return null;

            return (
              <div key={sectionId}>
                <Component
                  data={section.v[section.key]}
                  p={p}
                  labels={section.labels}
                  label={section.labels[section.key] || section.key}
                  fontScale={fontScale}
                  cvLocale={cvLocale}
                  formatCVDate={formatCVDate}
                  formatCVDateRange={formatCVDateRange}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
