import { getLanguageLabel, getLevelInfo } from '@/components/preview/themes/shared';
import {
  DiscreteLevelBar,
  RenderLink,
  SectionHeader,
} from '@/components/preview/themes/twoColumn/misty/helpers/shared/CommonHTML';
import type { MistySharedProps } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import type { ResumeData } from '@/types/resume';

export const SidePrivateProjectsSection = ({
  data: items,
  p,
  labels,
}: MistySharedProps<ResumeData['privateProjects']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.privateProjects || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((proj, i) => (
          <div key={i}>
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={proj.url} p={p}>
                {proj.name}
              </RenderLink>
            </div>
            {(proj.entity || proj.location) && (
              <div style={{ fontSize: '0.786em', color: p?.textMuted }}>
                {[proj.entity, proj.location].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SideReferencesSection = ({
  data: items,
  p,
  labels,
}: MistySharedProps<ResumeData['references']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.references || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((ref, i) => (
          <div key={i}>
            <div style={{ fontSize: '0.857em', fontWeight: 500, color: p?.text }}>{ref.name}</div>
            {ref.reference && (
              <div style={{ fontSize: '0.714em', color: p?.textLight, fontStyle: 'italic' }}>
                {ref.reference}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SidePublicationsSection = ({
  data: items,
  p,
  labels,
  formatCVDate,
}: MistySharedProps<ResumeData['publications']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.publications || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((pub, i) => (
          <div key={i}>
            <div style={{ fontSize: '0.857em', fontWeight: 700, color: p?.text }}>
              <RenderLink url={pub.url} p={p}>
                {pub.name}
              </RenderLink>
            </div>
            <div style={{ fontSize: '0.786em', color: p?.textMuted }}>
              {pub.publisher}
              {pub.releaseDate ? ` • ${formatCVDate(pub.releaseDate)}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SideInterestsSection = ({
  data: items,
  p,
  labels,
}: MistySharedProps<ResumeData['interests']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.interests || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((interest, i) => (
          <div key={i} style={{ fontSize: '0.857em', color: p?.text }}>
            {interest.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SideLanguagesSection = ({
  data: items,
  p,
  labels,
  cvLocale,
}: MistySharedProps<ResumeData['languages']>) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <SectionHeader title={labels?.languages || ''} p={p} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((lang, i) => {
          const { value, max } = getLevelInfo(lang.level, 'language');
          const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <div style={{ fontSize: '0.857em', fontWeight: 600, color: p?.text }}>
                  {lang.language}
                </div>
                {displayLabel && (
                  <div style={{ fontSize: '0.714em', color: p?.textLight, fontStyle: 'italic' }}>
                    {displayLabel}
                  </div>
                )}
              </div>
              {value > 0 && <DiscreteLevelBar value={value} max={max} p={p} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
