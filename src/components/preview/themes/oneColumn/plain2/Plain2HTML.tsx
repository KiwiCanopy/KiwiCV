/* eslint-disable @typescript-eslint/no-explicit-any */
import { MainAwardsSection as MainAwards } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Volunteer';
import { MainWorkSection as MainWork } from '@/components/preview/themes/oneColumn/plain2/helpers/HTML/main/Work';
import { PALETTES } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/constants';
import {
  ThemeHeading,
  type ThemeProps,
  type UnifiedSectionComponent,
  formatFullAddress,
  getImageContainerStylesHTML,
  getImageStylesHTML,
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

export const Plain2HTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const fontStack = resolveHTMLFontStack('plain2');

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const sectionIds = getOneColumnSections(meta, data);

  const sectionRegistry: Record<string, UnifiedSectionComponent> = {
    work: MainWork as any,
    education: MainEducation as any,
    skills: MainSkills as any,
    projects: MainProjects as any,
    privateProjects: MainProjects as any,
    volunteer: MainVolunteer as any,
    awards: MainAwards as any,
    certificates: MainCertificates as any,
    publications: MainPublications as any,
    languages: MainLanguages as any,
    interests: MainInterests as any,
    references: MainReferences as any,
  };

  const vData = getVisibleData(data);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const baseSize = 14 * fontScale;

  const sharedProps = {
    p,
    labels,
    fontScale,
    cvLocale,
    formatCVDate,
    formatCVDateRange,
  };

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontSize: `${baseSize}px`,
        lineHeight: 1.6,
        color: p.textMain,
        padding: '40px 48px',
        margin: '0 auto',
        backgroundColor: p.bg,
        minHeight: '100%',
      }}
    >
      {/* ─── Header ─── */}
      <header
        style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '32px',
        }}
      >
        <div style={{ flex: 1 }}>
          <ThemeHeading
            style={{
              margin: 0,
              fontSize: '2.286em',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.5px',
            }}
          >
            {basics.name}
          </ThemeHeading>
          {basics.label && (
            <div
              style={{ fontSize: '1.286em', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}
            >
              {basics.label}
            </div>
          )}
          {basics.summary && (
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#4b5563', lineHeight: 1.7 }}>
              {basics.summary}
            </p>
          )}

          {/* Contact row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 10px',
              marginTop: '12px',
              fontSize: '0.929em',
              color: '#6b7280',
            }}
          >
            {formatFullAddress(basics.location, cvLocale) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} style={{ opacity: 0.6 }} />
                <span>{formatFullAddress(basics.location, cvLocale)}</span>
              </div>
            )}
            {basics.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} style={{ opacity: 0.6 }} />
                <a
                  href={`mailto:${basics.email}`}
                  style={{
                    color: '#6b7280',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {basics.email} <ExternalLink size={12} style={{ opacity: 0.4 }} />
                </a>
              </div>
            )}
            {basics.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} style={{ opacity: 0.6 }} />
                <span>{basics.phone}</span>
              </div>
            )}
            {basics.url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} style={{ opacity: 0.6 }} />
                <a
                  href={basics.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#6b7280',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {basics.url.replace(/^https?:\/\//, '')}{' '}
                </a>
              </div>
            )}
            {vData.profiles.map((profile: any, i: number) => {
              const { Icon, text } = getProfileDisplayHTML(profile);

              const content = (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon size={14} style={{ opacity: 0.6 }} />
                  <span>{text}</span>
                  {profile.url && <ExternalLink size={12} style={{ opacity: 0.4 }} />}
                </div>
              );

              if (profile.url) {
                return (
                  <a
                    key={i}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
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
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {basics.image && vData.imageVisible && (
          <div
            style={getImageContainerStylesHTML(meta, {
              width: '96px',
              borderWidth: 4,
              borderColor: '#e5e7eb',
              background: '#fff',
            })}
          >
            <img src={basics.image} alt={basics.name} style={getImageStylesHTML(meta)} />
          </div>
        )}
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {sectionIds.map((id) => {
          const section = resolveLayoutSection(id, data, { v: vData, labels });
          const Section = section && sectionRegistry[section.key];
          if (!section || !Section) return null;

          return (
            <Section
              key={id}
              data={section.v[section.key] as any}
              label={section.labels[section.key]}
              {...sharedProps}
              labels={section.labels}
            />
          );
        })}
      </div>
    </div>
  );
};
