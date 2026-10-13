import {
  ThemeHeading,
  type ThemeProps,
  type UnifiedSectionComponent,
  formatFullAddress,
  getImageContainerStylesHTML,
  getImageStylesHTML,
  getProfileDisplayHTML,
  getSectionLabels,
  getTwoColumnSections,
  getVisibleData,
  resolveLayoutSection,
  resolvePalette,
  useBoundFormatters,
} from '@/components/preview/themes/shared';
import { resolveHTMLFontStack } from '@/components/preview/themes/shared/fonts';
import { MainAwardsSection as MainAwards } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Volunteer';
// Main Sections
import { MainWorkSection as MainWork } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/main/Work';
import { SideAwardsSection as SideAwards } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Awards';
import { SideCertificatesSection as SideCertificates } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Certificates';
import { SideEducationSection as SideEducation } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Education';
import { SideInterestsSection as SideInterests } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Interests';
import { SideLanguagesSection as SideLanguages } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Languages';
import { SideProjectsSection as SideProjects } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Projects';
import { SidePublicationsSection as SidePublications } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Publications';
import { SideReferencesSection as SideReferences } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/References';
import { SideSkillsSection as SideSkills } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Skills';
import { SideVolunteerSection as SideVolunteer } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Volunteer';
import { SideWorkSection as SideWork } from '@/components/preview/themes/twoColumn/soft/helpers/HTML/side/Work';
import { PALETTES } from '@/components/preview/themes/twoColumn/soft/helpers/shared/constants';
import type { SoftPalette } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';
import type { ResumeSectionItem } from '@/types/resume';
import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

interface ContactItemProps {
  icon: React.ReactNode;
  text: string;
  p: SoftPalette;
  fontScale?: number;
  hasUrl?: boolean;
}

const ContactItem = ({ icon, text, p, fontScale = 1, hasUrl = false }: ContactItemProps) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: p.textMuted,
      fontSize: `${0.875 * fontScale}rem`,
      position: 'relative',
    }}
  >
    <div style={{ color: p.primary, display: 'flex' }}>{icon}</div>
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {text}
    </span>
    {hasUrl && <ExternalLink size={12 * fontScale} style={{ opacity: 0.4, marginLeft: '4px' }} />}
  </div>
);

const ContactItemLink = ({ children, href }: { children: React.ReactNode; href?: string }) => {
  if (!href) {
    return <div style={{ position: 'relative' }}>{children}</div>;
  }
  return (
    <a
      href={href.startsWith('http') ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', position: 'relative', color: 'inherit' }}
    >
      {children}
    </a>
  );
};

export const SoftHTML = ({ data }: ThemeProps) => {
  const { meta, basics } = data;
  const fontStack = resolveHTMLFontStack('soft');
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;

  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';

  const visibleData = getVisibleData(data);
  const v = visibleData;

  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);

  const sectionRegistry = {
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

  const commonProps = {
    fontScale,
    cvLocale,
    formatCVDate,
    formatCVDateRange,
    p,
    labels,
  };

  const sidebar = (
    <div
      style={{
        backgroundColor: '#fdfdfd',
        borderRight: sidebarPosition === 'left' ? '1px solid #f1f5f9' : 'none',
        borderLeft: sidebarPosition === 'right' ? '1px solid #f1f5f9' : 'none',
        padding: '32px 40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        {basics?.image && v.imageVisible && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={getImageContainerStylesHTML(meta, {
                width: '120px',
                borderWidth: 4,
                borderColor: p.border,
                background: '#ffffff',
                shadow: '0 20px 25px -5px rgba(99, 102, 241, 0.1)',
              })}
            >
              <img
                src={basics.image}
                alt={basics.name}
                style={getImageStylesHTML(meta, { hasBorder: false })}
              />
            </div>
          </div>
        )}
        <ThemeHeading
          style={{
            fontSize: `${2 * fontScale}rem`,
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '8px',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}
        >
          {basics?.name}
        </ThemeHeading>
        {basics?.label && (
          <p
            style={{
              fontSize: `${0.8125 * fontScale}rem`,
              fontWeight: 700,
              color: p.primary,
              backgroundColor: `${p.primary}1a`,
              padding: '6px 16px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {basics.label}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Sidebar Sections */}
        {sideSectionIds.map((id) => {
          const section = resolveLayoutSection(id, data, { v, labels });
          if (!section) return null;
          const Comp = sectionRegistry[section.key].side as UnifiedSectionComponent;
          return (
            <Comp
              isCustomSection={section.isCustom}
              key={id}
              data={section.v[section.key] as ResumeSectionItem[]}
              {...commonProps}
              labels={section.labels}
              label={section.labels[section.key] || section.key}
            />
          );
        })}
      </div>
    </div>
  );

  const mainContent = (
    <div style={{ padding: '48px 60px', width: '100%', flex: 1 }}>
      {/* Main Column Contact Details */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: `1px solid ${p.border}`,
        }}
      >
        {basics?.email && (
          <ContactItemLink href={`mailto:${basics.email}`}>
            <ContactItem
              icon={<Mail size={16 * fontScale} />}
              text={basics.email}
              p={p}
              fontScale={fontScale}
            />
          </ContactItemLink>
        )}
        {basics?.phone && (
          <ContactItemLink href={`tel:${basics.phone}`}>
            <ContactItem
              icon={<Phone size={16 * fontScale} />}
              text={basics.phone}
              p={p}
              fontScale={fontScale}
            />
          </ContactItemLink>
        )}
        {formatFullAddress(basics.location, cvLocale) && (
          <ContactItem
            icon={<MapPin size={16 * fontScale} />}
            text={formatFullAddress(basics.location, cvLocale)}
            p={p}
            fontScale={fontScale}
          />
        )}
        {basics?.url && (
          <ContactItemLink href={basics.url}>
            <ContactItem
              icon={<Globe size={16 * fontScale} />}
              text={basics.url.replace(/^https?:\/\//, '')}
              p={p}
              fontScale={fontScale}
            />
          </ContactItemLink>
        )}
        {v.profiles.map((profile, i: number) => {
          const { Icon, text } = getProfileDisplayHTML(profile);
          return (
            <ContactItemLink key={i} href={profile.url}>
              <ContactItem
                icon={<Icon size={16 * fontScale} />}
                text={text}
                p={p}
                fontScale={fontScale}
                hasUrl={!!profile.url}
              />
            </ContactItemLink>
          );
        })}
      </div>

      {basics?.summary && (
        <section style={{ marginBottom: '48px' }}>
          <div
            key={p.primary}
            style={{
              background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              fontSize: '1.5rem',
              fontWeight: 800,
              lineHeight: 1.4,
              marginBottom: '16px',
            }}
          >
            {labels.about}
          </div>
          <p style={{ fontSize: '1.0625rem', color: p.textLight, lineHeight: 1.8 }}>
            {basics.summary}
          </p>
        </section>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {mainSectionIds.map((id) => {
          const section = resolveLayoutSection(id, data, { v, labels });
          if (!section) return null;
          const Comp = sectionRegistry[section.key].main as UnifiedSectionComponent;
          return (
            <Comp
              isCustomSection={section.isCustom}
              key={id}
              data={section.v[section.key] as ResumeSectionItem[]}
              {...commonProps}
              labels={section.labels}
              label={section.labels[section.key] || section.key}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: p.bg,
        minHeight: '100%',
        color: p.textMain,
        fontFamily: fontStack,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            sidebarPosition === 'left' ? 'minmax(300px, 350px) 1fr' : '1fr minmax(300px, 350px)',
          minHeight: '100vh',
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 40px rgba(0,0,0,0.05)',
        }}
      >
        {/* Conditional Rendering based on sidebarPosition */}
        {sidebarPosition === 'left' ? (
          <>
            {sidebar}
            {mainContent}
          </>
        ) : (
          <>
            {mainContent}
            {sidebar}
          </>
        )}
      </div>
    </div>
  );
};
