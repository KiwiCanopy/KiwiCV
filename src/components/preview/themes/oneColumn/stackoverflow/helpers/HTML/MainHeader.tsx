import type { StackoverflowSharedProps } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import {
  ThemeHeading,
  formatFullAddress,
  getProfileDisplayHTML,
} from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

export const MainHeader = ({
  data,
  p,
  cvLocale,
}: StackoverflowSharedProps<ResumeData['basics']>) => {
  const basics = data;
  if (!basics || !p) return null;
  const vProfiles = basics.profiles || [];

  return (
    <div
      style={{
        backgroundColor: p.headerBg,
        borderBottom: `3px solid ${p.primary}`,
        padding: '32px 40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '32px',
        }}
      >
        <div style={{ flex: 1 }}>
          <ThemeHeading style={{ margin: 0, fontSize: '2em', fontWeight: 700, color: p.dark }}>
            {basics.name}
          </ThemeHeading>
          {basics.label && (
            <div style={{ fontSize: '1.143em', color: p.textMuted, marginTop: '4px' }}>
              {basics.label}
            </div>
          )}
          {basics.summary && (
            <p style={{ marginTop: '12px', fontSize: '0.929em', color: p.text, lineHeight: 1.7 }}>
              {basics.summary}
            </p>
          )}
        </div>
        <div style={{ fontSize: '0.857em', color: p.textMuted, textAlign: 'right', flexShrink: 0 }}>
          {formatFullAddress(basics.location, cvLocale) && (
            <div
              style={{
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
              }}
            >
              <MapPin size={12} style={{ opacity: 0.6 }} />
              <span>{formatFullAddress(basics.location, cvLocale)}</span>
            </div>
          )}
          {basics.email && (
            <a
              href={`mailto:${basics.email}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
                marginBottom: '4px',
              }}
            >
              <Mail size={12} style={{ opacity: 0.6 }} />
              {basics.email}
            </a>
          )}
          {basics.phone && (
            <div
              style={{
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
              }}
            >
              <Phone size={12} style={{ opacity: 0.6 }} />
              <span>{basics.phone}</span>
            </div>
          )}
          {basics.url && (
            <a
              href={basics.url.startsWith('http') ? basics.url : `https://${basics.url}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
                marginBottom: '4px',
              }}
            >
              <Globe size={12} style={{ opacity: 0.6 }} />
              {basics.url.replace(/^https?:\/\//, '')}{' '}
            </a>
          )}
          {vProfiles.map((profile, i) => {
            const { Icon, text } = getProfileDisplayHTML(profile);
            const content = (
              <>
                {text}
                <Icon size={12} style={{ opacity: 0.6, order: 2 }} />
              </>
            );

            if (profile.url) {
              return (
                <a
                  key={i}
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginBottom: '4px',
                  }}
                >
                  {content}
                  <ExternalLink size={10} style={{ opacity: 0.4, order: 3 }} />
                </a>
              );
            }

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '4px',
                  marginBottom: '4px',
                  color: p.textMuted,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
