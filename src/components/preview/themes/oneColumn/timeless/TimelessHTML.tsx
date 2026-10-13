import { MainAwardsSection as MainAwards } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Volunteer';
// Section Helpers (Main only)
import { MainWorkSection as MainWork } from '@/components/preview/themes/oneColumn/timeless/helpers/HTML/main/Work';
import { SectionHeader } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/CommonHTML';
import { PALETTES } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';
import {
  ThemeHeading,
  type ThemeProps,
  formatFullAddress,
  getOneColumnSections,
  getProfileDisplayHTML,
  getSectionLabels,
  getVisibleData,
  resolveHTMLFontStack,
  resolveLayoutSection,
  resolvePalette,
  useBoundFormatters,
} from '@/components/preview/themes/shared';
import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

export const TimelessHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const visible = getVisibleData(data);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const baseSize = 16 * fontScale;
  const fontStack = resolveHTMLFontStack('timeless');

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
    /* profiles removed from registry */
  };

  const sectionIds = getOneColumnSections(meta, data);
  const sectionProps = { p, labels, fontScale, cvLocale, formatCVDate, formatCVDateRange };

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontSize: `${baseSize}px`,
        backgroundColor: p.bg,
        color: p.textMain,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '80px 60px' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <ThemeHeading
            style={{
              fontSize: '3.5em',
              fontWeight: 500,
              fontStyle: 'italic',
              marginBottom: '12px',
            }}
          >
            {basics.name}
          </ThemeHeading>
          <p
            style={{
              fontSize: '1.125em',
              color: p.textMuted,
              letterSpacing: '0.05em',
              marginBottom: '24px',
            }}
          >
            {basics.label?.toLocaleUpperCase(cvLocale.bcp47)}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              fontSize: '0.9em',
              color: p.textLight,
              flexWrap: 'wrap',
            }}
          >
            {basics.email && (
              <a
                href={`mailto:${basics.email}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <Mail size={16} />
                <span>{basics.email}</span>
              </a>
            )}
            {basics.phone && (
              <a
                href={`tel:${basics.phone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <Phone size={16} />
                <span>{basics.phone}</span>
              </a>
            )}
            {formatFullAddress(basics.location, cvLocale) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>{formatFullAddress(basics.location, cvLocale)}</span>
              </div>
            )}
            {basics.url && (
              <a
                href={basics.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <Globe size={16} />
                <span>{basics.url.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            {visible.profiles.map((profile, i) => {
              const { Icon, text } = getProfileDisplayHTML(profile);
              const content = (
                <>
                  <Icon size={16} />
                  <span>{text}</span>
                  {profile.url && <ExternalLink size={12} style={{ opacity: 0.6 }} />}
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
                      gap: '6px',
                      color: 'inherit',
                      textDecoration: 'none',
                      fontWeight: 500,
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
                    gap: '6px',
                    color: 'inherit',
                    fontWeight: 500,
                  }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </header>

        {/* About Section */}
        {basics.summary && (
          <section style={{ marginBottom: '48px' }}>
            <SectionHeader label={labels.about || 'ABOUT'} p={p} />
            <p
              style={{
                fontSize: '1.25em',
                lineHeight: 1.6,
                color: p.textMain,
                textAlign: 'justify',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {basics.summary}
            </p>
          </section>
        )}

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {sectionIds.map((id) => {
            // Visible entries only, as the PDF renders them.
            const section = resolveLayoutSection(id, data, { v: visible, labels });
            const Component = section && sectionRegistry[section.key];
            if (!section || !Component) return null;
            // ⚠️ No `profiles` arm: it is not a `ResumeData` section.
            return (
              <Component
                key={id}
                data={section.v[section.key] as never}
                label={section.labels[section.key] || section.key}
                {...sectionProps}
                labels={section.labels}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
