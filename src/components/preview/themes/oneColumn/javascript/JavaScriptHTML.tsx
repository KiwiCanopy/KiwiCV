import { MainAwardsSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Awards';
import { MainCertificatesSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Certificates';
import { MainEducationSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Education';
import { MainInterestsSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Interests';
import { MainLanguagesSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Languages';
import { MainProjectsSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Projects';
import { MainPublicationsSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Publications';
import { MainReferencesSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/References';
import { MainSkillsSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Skills';
import { MainVolunteerSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Volunteer';
// Modular Sections
import { MainWorkSection } from '@/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Work';
import {
  FONT_MONO,
  PALETTES,
} from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';
import {
  ThemeHeading,
  type ThemeProps,
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

export const JavaScriptHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette, 'light');

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const fontStack = resolveHTMLFontStack('javascript');

  const v = getVisibleData(data);
  const sectionIds = getOneColumnSections(meta, data);

  const sectionRegistry: Record<string, { main: UnifiedSectionComponent }> = {
    work: { main: MainWorkSection },
    education: { main: MainEducationSection },
    projects: { main: MainProjectsSection },
    privateProjects: { main: MainProjectsSection },
    volunteer: { main: MainVolunteerSection },
    awards: { main: MainAwardsSection },
    certificates: { main: MainCertificatesSection },
    publications: { main: MainPublicationsSection },
    skills: { main: MainSkillsSection },
    languages: { main: MainLanguagesSection },
    interests: { main: MainInterestsSection },
    references: { main: MainReferencesSection },
    /* profiles removed from registry */
  };

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontSize: `${14 * fontScale}px`,
        color: p.text,
        backgroundColor: p.bgPage,
        minHeight: '100vh',
        padding: '20px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: p.paper,
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${p.slate200}`,
        }}
      >
        {/* Header / Basics as Doc Comment */}
        <div style={{ padding: '20px 50px', borderBottom: `1px solid ${p.slate100}` }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: '0.875em',
              color: p.comment,
              marginBottom: '20px',
              lineHeight: 1.6,
            }}
          >
            {`/**`}
            <br />
            {` * ${basics.label}`}
            <br />
            {basics.summary && (
              <>
                {` * ${basics.summary}`}
                <br />
              </>
            )}
            {` */`}
          </div>

          <div
            style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: '1.5em',
                fontWeight: 700,
                color: p.keyword,
              }}
            >
              const
            </span>
            <ThemeHeading
              style={{
                fontFamily: FONT_MONO,
                fontSize: '2em',
                fontWeight: 800,
                color: p.primary,
                margin: 0,
              }}
            >
              {basics.name.replace(/\s+/g, '_')}
            </ThemeHeading>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: '1.5em',
                fontWeight: 700,
                color: p.slate300,
              }}
            >
              = {'{'}
            </span>
          </div>

          <div
            style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {basics.image && v.imageVisible && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '0.875em',
                    color: p.slate400,
                    width: '80px',
                  }}
                >
                  avatar:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div
                    style={{
                      ...getImageContainerStylesHTML(meta, {
                        width: '24px',
                        borderWidth: 1,
                        borderColor: p.slate200,
                        shadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img src={basics.image} alt={basics.name} style={getImageStylesHTML(meta)} />
                  </div>
                  <span style={{ color: p.slate300 }}>,</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '0.875em',
                  color: p.slate400,
                  width: '80px',
                }}
              >
                role:
              </span>
              <div
                style={{
                  color: p.entity,
                  fontFamily: FONT_MONO,
                  fontSize: '0.875em',
                }}
              >
                {`'${basics.label}'`}
                <span style={{ color: p.slate300, marginLeft: '4px' }}>,</span>
              </div>
            </div>

            {formatFullAddress(basics.location, cvLocale) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '0.875em',
                    color: p.slate400,
                    width: '80px',
                  }}
                >
                  location:
                </span>
                <div style={{ color: p.string, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {`'${formatFullAddress(basics.location, cvLocale)}'`}
                  <MapPin size={16} style={{ color: p.slate400, opacity: 0.6 }} />
                  <span style={{ color: p.slate300 }}>,</span>
                </div>
              </div>
            )}

            {basics.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '0.875em',
                    color: p.slate400,
                    width: '80px',
                  }}
                >
                  email:
                </span>
                <a
                  href={`mailto:${basics.email}`}
                  style={{
                    color: p.string,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {`'${basics.email}'`}
                  <Mail size={16} style={{ color: p.slate400, opacity: 0.6 }} />
                  <span style={{ color: p.slate300 }}>,</span>
                </a>
              </div>
            )}

            {basics.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '0.875em',
                    color: p.slate400,
                    width: '80px',
                  }}
                >
                  phone:
                </span>
                <div style={{ color: p.string, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {`'${basics.phone}'`}
                  <Phone size={16} style={{ color: p.slate400, opacity: 0.6 }} />
                  <span style={{ color: p.slate300 }}>,</span>
                </div>
              </div>
            )}

            {basics.url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '0.875em',
                    color: p.slate400,
                    width: '80px',
                  }}
                >
                  web:
                </span>
                <a
                  href={basics.url.startsWith('http') ? basics.url : `https://${basics.url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: p.string,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {`'${basics.url.replace(/^https?:\/\//, '')}'`}
                  <Globe size={16} style={{ color: p.slate400, opacity: 0.6 }} />
                  <span style={{ color: p.slate300 }}>,</span>
                </a>
              </div>
            )}

            {getVisibleData(data).profiles.map((profile, idx) => {
              const { Icon, text } = getProfileDisplayHTML(profile);
              const content = (
                <>
                  {`'${text}'`}
                  <Icon size={16} style={{ color: p.slate400, opacity: 0.6 }} />
                  {profile.url && (
                    <ExternalLink size={12} style={{ color: p.slate400, opacity: 0.4 }} />
                  )}
                  <span style={{ color: p.slate300 }}>,</span>
                </>
              );

              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '0.875em',
                      color: p.slate400,
                      width: '80px',
                    }}
                  >
                    {profile.network?.toLowerCase()}:
                  </span>
                  {profile.url ? (
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: p.string,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      style={{
                        color: p.string,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: '1.5em',
              fontWeight: 700,
              color: p.slate300,
              marginTop: '8px',
            }}
          >
            {'};'}
          </div>
        </div>

        {/* Sections */}
        <div style={{ padding: '40px 50px' }}>
          {sectionIds.map((sectionId) => {
            const section = resolveLayoutSection(sectionId, data, { v, labels });
            const Component = section && sectionRegistry[section.key]?.main;
            if (!section || !Component) return null;

            return (
              <div key={sectionId}>
                <Component
                  isCustomSection={section.isCustom}
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

        {/* IDE Footer */}
        <div
          style={{
            padding: '24px 50px 40px',
            borderTop: `1px solid ${p.slate100}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: p.bgPage,
          }}
        >
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.75em', color: p.slate400 }}>
              Ln 42, Col 21
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.75em', color: p.slate400 }}>
              UTF-8
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.75em', color: p.slate400 }}>
              JavaScript
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
              }}
            />
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.75em', color: p.slate400 }}>
              Ready to interview
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
