import { MainAwardsSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/AwardsSection';
import { MainCertificatesSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/CertificatesSection';
import { MainEducationSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/EducationSection';
import { MainInterestsSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/InterestsSection';
import { MainLanguagesSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/LanguagesSection';
import { MainProjectsSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/ProjectsSection';
import { MainPublicationsSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/PublicationsSection';
import { MainReferencesSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/ReferencesSection';
import { MainSkillsSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/Skills';
import { MainVolunteerSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/VolunteerSection';
// HTML Main Helpers
import { MainWorkSection } from '@/components/preview/themes/oneColumn/elegant/helpers/HTML/main/WorkSection';
import { PALETTES } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/constants';
import { type ElegantSectionComponent } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
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
import type { LayoutSectionId } from '@/utils/layout/customSections';
import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

export const ElegantHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const fontStack = resolveHTMLFontStack('elegant');
  const v = getVisibleData(data);
  const oneColSectionIds = getOneColumnSections(meta, data);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const baseSize = 14 * fontScale;

  const sectionRegistry: Record<string, { main: ElegantSectionComponent }> = {
    work: { main: MainWorkSection },
    education: { main: MainEducationSection },
    skills: { main: MainSkillsSection },
    projects: { main: MainProjectsSection },
    privateProjects: { main: MainProjectsSection },
    volunteer: { main: MainVolunteerSection },
    awards: { main: MainAwardsSection },
    certificates: { main: MainCertificatesSection },
    publications: { main: MainPublicationsSection },
    languages: { main: MainLanguagesSection },
    interests: { main: MainInterestsSection },
    references: { main: MainReferencesSection },
  };

  // `labels` is keyed by the resolved `section.key`, never the raw id: a
  // custom-section token resolves to `volunteer` with its own title.
  const renderSection = (sectionId: LayoutSectionId) => {
    const section = resolveLayoutSection(sectionId, data, { v, labels });
    const Component = section && sectionRegistry[section.key]?.main;
    if (!section || !Component) return null;

    return (
      <Component
        key={sectionId}
        data={section.v[section.key]}
        p={p}
        labels={section.labels}
        label={section.labels[section.key] || section.key}
        cvLocale={cvLocale}
        formatCVDate={formatCVDate}
        formatCVDateRange={formatCVDateRange}
        fontScale={fontScale}
      />
    );
  };

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontSize: `${baseSize}px`,
        lineHeight: 1.7,
        color: p.text,
        backgroundColor: p.bg,
        padding: '48px 56px',
        margin: '0 auto',
        minHeight: '100%',
      }}
    >
      <header
        style={{
          textAlign: 'center',
          marginBottom: '18px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${p.border}`,
        }}
      >
        <ThemeHeading
          style={{
            margin: 0,
            fontSize: '2.571em',
            fontWeight: 400,
            color: p.text,
            letterSpacing: '1px',
          }}
        >
          {basics.name}
        </ThemeHeading>
        {basics.label && (
          <div
            style={{
              fontSize: '1.143em',
              color: p.textMuted,
              marginTop: '8px',
              fontStyle: 'italic',
            }}
          >
            {basics.label}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '16px',
            fontSize: '0.857em',
            color: p.textMuted,
          }}
        >
          {basics.email && (
            <a
              href={`mailto:${basics.email}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Mail size={12} style={{ opacity: 0.6 }} />
              {basics.email}
            </a>
          )}
          {/*
           * ⚠️ **Icons here because the PDF has always drawn them.** Phone
           * and address were plain text on screen while `typstUtils.ts`'s shared
           * contact row emitted `#icon("phone")` and `#icon("map-pin")` for every
           * theme that calls it, elegant included — so two of elegant's four
           * contact fields gained an icon on the way to the PDF. The decision is
           * that the shared Typst row owns the set and each theme's
           * hand-rolled HTML matches it, rather than the reverse.
           */}
          {basics.phone && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} style={{ opacity: 0.6 }} />
              {basics.phone}
            </span>
          )}
          {basics.url && (
            <a
              href={basics.url}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Globe size={12} style={{ opacity: 0.6 }} />
              {basics.url.replace(/^https?:\/\//, '')}
            </a>
          )}
          {formatFullAddress(basics.location, cvLocale) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} style={{ opacity: 0.6 }} />
              {formatFullAddress(basics.location, cvLocale)}
            </span>
          )}
          {v.profiles.map((prof, i) => {
            const { Icon, text } = getProfileDisplayHTML(prof);
            const content = (
              <>
                <Icon size={14} style={{ opacity: 0.6 }} />
                <span>{text}</span>
                {prof.url && <ExternalLink size={10} style={{ opacity: 0.4 }} />}
              </>
            );

            if (prof.url) {
              return (
                <a
                  key={i}
                  href={prof.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {content}
                </a>
              );
            }

            return (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {content}
              </span>
            );
          })}
        </div>
      </header>

      {basics.summary && (
        <div
          style={{
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 16px',
            fontSize: '14px',
            color: p.textMain,
            lineHeight: 1.8,
            fontStyle: 'italic',
          }}
        >
          {basics.summary}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {oneColSectionIds.map((id) => renderSection(id))}
      </div>
    </div>
  );
};
