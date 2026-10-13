import {
  ThemeHeading,
  type ThemeProps,
  applyLayoutVariant,
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
import { MainAwardsSection as MainAwards } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Awards';
import { MainCertificatesSection as MainCertificates } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Certificates';
import { MainEducationSection as MainEducation } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Education';
import { MainInterestsSection as MainInterests } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Interests';
import { MainLanguagesSection as MainLanguages } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Languages';
import { MainProjectsSection as MainProjects } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Projects';
import { MainPublicationsSection as MainPublications } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Publications';
import { MainReferencesSection as MainReferences } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/References';
import { MainSkillsSection as MainSkills } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Skills';
import { MainVolunteerSection as MainVolunteer } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Volunteer';
// HTML Sections
import { MainWorkSection as MainWork } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Work';
import { SideAwardsSection as SideAwards } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Awards';
import { SideCertificatesSection as SideCertificates } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Certificates';
import { SideEducationSection as SideEducation } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Education';
import { SideInterestsSection as SideInterests } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Interests';
import { SideLanguagesSection as SideLanguages } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Languages';
import { SideProjectsSection as SideProjects } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Projects';
import { SidePublicationsSection as SidePublications } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Publications';
import { SideReferencesSection as SideReferences } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/References';
import { SideSkillsSection as SideSkills } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Skills';
import { SideVolunteerSection as SideVolunteer } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Volunteer';
import { SideWorkSection as SideWork } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Work';
import { PALETTES_HTML } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import type { ResumeSectionItem } from '@/types/resume';
import { ExternalLink, Globe, Mail, MapPin, Phone, Rocket } from 'lucide-react';

export const SkylineHTML = ({ data }: ThemeProps) => {
  const { basics, meta } = data;
  const { cvLocale, formatCVDate, formatCVDateRange } = useBoundFormatters(data);
  const p = resolvePalette(PALETTES_HTML, meta.theme.params.palette);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';

  const visibleData = getVisibleData(data);
  const v = visibleData;

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

  const sharedProps = {
    p,
    labels,
    cvLocale,
    formatCVDate,
    formatCVDateRange,
    fontScale: 1,
  };

  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);

  const sidebarContactInfo = [
    { icon: <Mail size={12 * sharedProps.fontScale} />, value: basics.email },
    { icon: <Phone size={12 * sharedProps.fontScale} />, value: basics.phone },
    {
      icon: <MapPin size={12 * sharedProps.fontScale} />,
      value: formatFullAddress(basics.location, cvLocale) || null,
    },
    {
      icon: <Globe size={12 * sharedProps.fontScale} />,
      value: basics.url ? basics.url.replace(/^https?:\/\//, '') : null,
      href: basics.url,
    },
    ...visibleData.profiles.map((profile) => {
      const { Icon, text } = getProfileDisplayHTML(profile);
      return {
        icon: <Icon size={12 * sharedProps.fontScale} />,
        value: text,
        href: profile.url,
        isProfile: true,
      };
    }),
  ].filter((item) => item.value);

  /**
   * ⚠️ **One expression for both columns, because two drifted.** The main
   * and sidebar branches each carried their own copy of this ternary, and they
   * disagreed: main overrode `privateProjects` to `Rocket` while the sidebar
   * overrode it to `Folder`. Since the component defaults were the *other*
   * section's glyph in each column — `main/Projects.tsx` defaulted to `Rocket`
   * and `side/Projects.tsx` to `Folder` — the override handed each column the
   * same glyph it already used for `projects`, so a skyline user could not tell
   * the two project sections apart by icon in either placement, while the PDF
   * distinguished them (`folder` vs `rocket`).
   *
   * The decision is that a section's icon **may not differ by column**:
   * all 36 Typst section-icon call sites pass a column-independent name and
   * `is-side` is a styling flag, so the export has never been able to express a
   * per-column glyph. Keeping one expression here is what makes that structural
   * rather than a coincidence two editors have to maintain.
   */
  const sectionIcon = (id: string) => (id === 'privateProjects' ? <Rocket size={18} /> : undefined);

  const mainContent = (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {mainSectionIds.map((id) => {
        const section = resolveLayoutSection(id, data, { v, labels });
        const Component = section && sectionRegistry[section.key]?.main;
        if (!section || !Component) return null;

        /**
         * ⚠️ **`v[key]`, the same expression the sidebar path uses.** This
         * used to special-case the two project sections and derive *both* from
         * `visibleData.projects`, splitting on `pj.type === 'work'`:
         * `projects` got the items whose type was exactly `'work'` and
         * `privateProjects` got the rest. `data.privateProjects` was never read.
         *
         * `type` is a free-text field — `ProjectsForm.tsx` renders it as a plain
         * text input, `createEmptyItem('projects')` gives it `''`, and nothing in
         * `src/` or `examples/` ever writes the literal `'work'`. So on any real
         * résumé the Projects section rendered **empty**, every project appeared
         * under the Private Projects heading with its `Rocket` icon, and the
         * user's actual Private Projects were absent from the preview and
         * present in the PDF. Measured: a `projects` entry rendered once (under
         * the wrong heading) and a `privateProjects` entry zero times, against
         * one apiece in the Typst output.
         *
         * Main column only — the sidebar path below always read `visibleData[id]`
         * — which is why `previewExportParity.test.ts` could not see it until
         * that sweep started rendering both placements.
         */
        const sectionData = applyLayoutVariant(
          (section.v[section.key] || []) as ResumeSectionItem[],
          section.key,
          'main',
        );

        return (
          <div key={id}>
            <Component
              isCustomSection={section.isCustom}
              data={sectionData}
              {...sharedProps}
              labels={section.labels}
              label={section.labels[section.key] || section.key}
              icon={sectionIcon(section.key)}
            />
          </div>
        );
      })}
    </main>
  );

  const sidebarContent = (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sidebar Sections */}
      {sideSectionIds.map((id) => {
        const section = resolveLayoutSection(id, data, { v, labels });
        const Component = section && sectionRegistry[section.key]?.side;
        if (!section || !Component) return null;

        const sectionData = applyLayoutVariant(
          (section.v[section.key] || []) as ResumeSectionItem[],
          section.key,
          'side',
        );

        return (
          <div key={id}>
            <Component
              isCustomSection={section.isCustom}
              data={sectionData}
              {...sharedProps}
              labels={section.labels}
              label={section.labels[section.key] || section.key}
              icon={sectionIcon(section.key)}
            />
          </div>
        );
      })}
    </aside>
  );

  return (
    <div
      className="theme-skyline-html"
      style={{
        backgroundColor: p.bg,
        minHeight: '297mm',
        padding: '40px',
        color: p.textMain,
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        zIndex: 0,
      }}
    >
      {/* Background patterns */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 10% 10%, ${p.meshColor1}44 0%, transparent 40%),
            radial-gradient(circle at 90% 10%, ${p.meshColor2}33 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, ${p.meshColor3}22 0%, transparent 60%),
            radial-gradient(circle at 10% 90%, ${p.meshColor2}33 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, ${p.meshColor1}44 0%, transparent 40%)
          `,
          opacity: 0.25,
          zIndex: -1,
        }}
      />

      <div style={{ width: '100%', margin: 0 }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '32px',
            marginBottom: '32px',
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '40px',
            borderRadius: '28px',
            border: '1.5px solid rgba(255, 255, 255, 1)',
            boxShadow: `0 20px 50px -12px rgba(0,0,0,0.08), 0 10px 15px -3px rgba(0,0,0,0.03)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle accent glow in header */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-10%',
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${p.primaryLight} 0%, transparent 70%)`,
              opacity: 0.3,
              zIndex: -1,
            }}
          />
          {basics.image && v.imageVisible && (
            <div
              style={getImageContainerStylesHTML(meta, {
                borderColor: p.border,
              })}
            >
              <img src={basics.image} alt={basics.name} style={getImageStylesHTML(meta)} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <ThemeHeading
              style={{
                fontSize: '2.2em',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.02em',
                color: p.textMain,
              }}
            >
              {basics.name}
            </ThemeHeading>
            {basics.label && (
              <div
                style={{
                  fontSize: '1.1em',
                  fontWeight: 600,
                  color: p.primary,
                  marginTop: '4px',
                }}
              >
                {basics.label}
              </div>
            )}
            {basics.summary && (
              <p
                style={{
                  fontSize: '0.95em',
                  color: p.textMuted,
                  marginTop: '8px',
                  lineHeight: 1.5,
                  maxWidth: '100%',
                }}
              >
                {basics.summary}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
              {sidebarContactInfo.map((item, idx) => {
                const content = (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85em',
                      color: p.textMuted,
                    }}
                  >
                    <div style={{ color: p.primary, display: 'flex' }}>{item.icon}</div>
                    <div>{item.value}</div>
                    {'isProfile' in item && item.isProfile && item.href && (
                      <ExternalLink size={10} style={{ opacity: 0.4 }} />
                    )}
                  </div>
                );

                if (item.href) {
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {content}
                    </a>
                  );
                }

                return <div key={idx}>{content}</div>;
              })}
            </div>
          </div>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              sidebarPosition === 'left' ? '280px minmax(0, 1fr)' : 'minmax(0, 1fr) 280px',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Sidebar (Conditional Order) */}
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
