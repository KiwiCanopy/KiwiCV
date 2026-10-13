import React from 'react';

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
import { MainAwardsSection as MainAwards } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Volunteer';
import { MainWorkSection as MainWork } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/main/Work';
import { SideAwardsSection as SideAwards } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Awards';
import { SideCertificatesSection as SideCertificates } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Certificates';
import { SideEducationSection as SideEducation } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Education';
import { SideInterestsSection as SideInterests } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Interests';
import { SideLanguagesSection as SideLanguages } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Languages';
import { SideProjectsSection as SideProjects } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Projects';
import { SidePublicationsSection as SidePublications } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Publications';
import { SideReferencesSection as SideReferences } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/References';
import { SideSkillsSection as SideSkills } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Skills';
import { SideVolunteerSection as SideVolunteer } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Volunteer';
import { SideWorkSection as SideWork } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/HTML/side/Work';
import { RenderLinkWrapper } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/RenderLinkWrapper';
import { PALETTES } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/constants';
import type { SwissGridSectionComponent } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';

import {
  getMainSectionNumber,
  sectionLabelStyle,
  sectionNumStyle,
  sidebarHeaderStyle,
} from './helpers/shared/utils';

export const SwissGridHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const fontStack = resolveHTMLFontStack('swiss_grid');
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const baseSize = 16 * fontScale;
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';

  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);
  const v = getVisibleData(data);

  const sectionRegistry: Record<
    string,
    { main?: SwissGridSectionComponent; side?: SwissGridSectionComponent }
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
    /* profiles removed from registry */
  };

  const renderName = () => {
    const parts = basics.name.split(' ');
    if (parts.length < 2) return basics.name.toLocaleUpperCase(cvLocale.bcp47);
    return (
      <>
        {parts[0].toLocaleUpperCase(cvLocale.bcp47)} <br />
        <span style={{ color: p.primary }}>
          {parts.slice(1).join(' ').toLocaleUpperCase(cvLocale.bcp47)}
        </span>
      </>
    );
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize: `${baseSize}px`,
    backgroundColor: p.bg,
    color: p.textMain,
    padding: '80px 40px',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%',
  };

  const sidebarHeaderGrayStyle: React.CSSProperties = {
    ...sidebarHeaderStyle(p),
    color: p.textMuted,
    borderBottom: 'none',
    marginBottom: '4px',
  };

  const sidebarContent = (
    <div
      style={{
        borderRight: sidebarPosition === 'left' ? `1px solid ${p.border}` : 'none',
        borderLeft: sidebarPosition === 'right' ? `1px solid ${p.border}` : 'none',
        paddingRight: sidebarPosition === 'left' ? '30px' : '0',
        paddingLeft: sidebarPosition === 'right' ? '30px' : '0',
      }}
    >
      <section style={{ marginBottom: '40px' }}>
        <h3 style={sidebarHeaderGrayStyle}>
          {labels.contact?.toLocaleUpperCase(cvLocale.bcp47) || 'CONTACT'}
        </h3>
        <div
          style={{
            fontSize: '0.875em',
            color: p.textMain,
            fontWeight: 700,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '8px',
          }}
        >
          {basics.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14 * fontScale} style={{ color: p.primary, flexShrink: 0 }} />
              <div style={{ wordBreak: 'break-all' }}>{basics.email}</div>
            </div>
          )}
          {basics.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14 * fontScale} style={{ color: p.primary, flexShrink: 0 }} />
              <div>{basics.phone}</div>
            </div>
          )}
          {formatFullAddress(basics.location, cvLocale) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14 * fontScale} style={{ color: p.primary, flexShrink: 0 }} />
              <div>{formatFullAddress(basics.location, cvLocale)}</div>
            </div>
          )}
          {basics.url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14 * fontScale} style={{ color: p.primary, flexShrink: 0 }} />
              <div style={{ wordBreak: 'break-all' }}>
                <RenderLinkWrapper
                  url={basics.url}
                  p={p}
                  fontScale={fontScale}
                  style={{ fontWeight: 700, color: p.textMain }}
                  showIcon={false}
                >
                  {basics.url.replace(/^https?:\/\//, '')}
                </RenderLinkWrapper>
              </div>
            </div>
          )}
          {getVisibleData(data).profiles.map((profile, i) => {
            const { Icon, text } = getProfileDisplayHTML(profile);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14 * fontScale} style={{ color: p.primary, flexShrink: 0 }} />
                <div style={{ wordBreak: 'break-all' }}>
                  <RenderLinkWrapper
                    url={profile.url}
                    p={p}
                    fontScale={fontScale}
                    style={{ fontWeight: 700, color: p.textMain }}
                  >
                    {text}
                  </RenderLinkWrapper>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {sideSectionIds.map((id) => {
        const section = resolveLayoutSection(id, data, { v, labels });
        const Section = section && sectionRegistry[section.key]?.side;
        if (!section || !Section) return null;

        return (
          <div key={id} style={{ marginBottom: '40px' }}>
            <Section
              data={section.v[section.key]}
              p={p}
              label={section.labels[section.key]}
              fontScale={fontScale}
              cvLocale={cvLocale}
              formatCVDate={formatCVDate}
              formatCVDateRange={formatCVDateRange}
              labels={section.labels}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              styles={{} as any}
              scale={fontScale}
            />
          </div>
        );
      })}
    </div>
  );

  const mainContent = (
    <div>
      {basics.summary && (
        <section style={{ marginBottom: '60px' }}>
          <div style={sectionLabelStyle(p)}>
            <span style={sectionNumStyle(p)}>01</span>
            <span>{labels.about?.toLocaleUpperCase(cvLocale.bcp47) || 'ABOUT'}</span>
          </div>
          <p style={{ fontSize: '1em', color: p.textMuted, lineHeight: 1.6, margin: 0 }}>
            {basics.summary}
          </p>
        </section>
      )}

      {mainSectionIds.map((id, idx) => {
        const section = resolveLayoutSection(id, data, { v, labels });
        const Section = section && sectionRegistry[section.key]?.main;
        if (!section || !Section) return null;
        const sectionNumber = getMainSectionNumber(idx, !!basics.summary);
        return (
          <div key={id} style={{ marginBottom: '60px' }}>
            <Section
              data={section.v[section.key]}
              p={p}
              label={section.labels[section.key]}
              num={sectionNumber}
              fontScale={fontScale}
              cvLocale={cvLocale}
              formatCVDate={formatCVDate}
              formatCVDateRange={formatCVDateRange}
              labels={section.labels}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              styles={{} as any}
              scale={fontScale}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '40px',
            marginBottom: '40px',
            alignItems: 'center',
          }}
        >
          {basics.image && v.imageVisible && (
            <div
              style={getImageContainerStylesHTML(meta, {
                width: '160px',
                borderColor: p.border,
                hasBorder: true,
              })}
            >
              <img src={basics.image} alt={basics.name} style={getImageStylesHTML(meta)} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <ThemeHeading
              style={{
                fontSize: '5em',
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: '-0.05em',
                margin: 0,
              }}
            >
              {renderName()}
            </ThemeHeading>
            <p
              style={{
                fontSize: '1.25em',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: p.textMuted,
                marginTop: '20px',
              }}
            >
              {basics.label?.toLocaleUpperCase(cvLocale.bcp47)}
            </p>
          </div>
        </div>

        <div style={{ borderBottom: `3px solid ${p.textMain}`, marginBottom: '60px' }}></div>

        {/* Main 2-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: sidebarPosition === 'left' ? '280px 1fr' : '1fr 280px',
            gap: '60px',
          }}
        >
          {sidebarPosition === 'left' ? (
            <>
              {sidebarContent}
              {mainContent}
            </>
          ) : (
            <>
              {mainContent}
              {sidebarContent}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
