import type { PlainSharedProps } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';
import {
  ThemeHeading,
  formatFullAddress,
  getImageContainerStylesHTML,
  getImageStylesHTML,
  getProfileDisplayHTML,
} from '@/components/preview/themes/shared';
import type { ResumeData, ResumeMeta } from '@/types/resume';
import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';

export const MainHeader = ({
  data: basics,
  profiles = [],
  p,
  meta,
  cvLocale,
  fontScale = 1,
  imageVisible = true,
}: PlainSharedProps<ResumeData['basics']> & {
  profiles?: ResumeData['basics']['profiles'];
  meta: ResumeMeta;
  fontScale?: number;
  imageVisible?: boolean;
}) => {
  if (!basics) return null;
  const { name, label, image, email, phone, url, location } = basics;
  const imageStyles = getImageStylesHTML(meta);
  const containerStyles = getImageContainerStylesHTML(meta);

  return (
    <header
      style={{
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '32px',
      }}
    >
      {image && imageVisible && (
        <div style={containerStyles}>
          <img src={image} alt={name} style={imageStyles} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <ThemeHeading style={{ margin: 0, fontSize: '1.75em', fontWeight: 700 }}>
          {name}
        </ThemeHeading>
        {label && (
          <div style={{ fontSize: '1.125em', color: p.textMuted, marginTop: '2px' }}>{label}</div>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 12px',
            marginTop: '12px',
            fontSize: '13px',
            color: p.text,
          }}
        >
          {email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={15 * fontScale} style={{ opacity: 0.6 }} />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={15 * fontScale} style={{ opacity: 0.6 }} />
              <span>{phone}</span>
            </div>
          )}
          {url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={15 * fontScale} style={{ opacity: 0.6 }} />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {url.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {formatFullAddress(location, cvLocale) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={15 * fontScale} style={{ opacity: 0.6 }} />
              <span>{formatFullAddress(location, cvLocale)}</span>
            </div>
          )}
          {profiles.map((profile, i) => {
            const { Icon, text } = getProfileDisplayHTML(profile);

            const content = (
              <>
                <Icon
                  size={12 * fontScale}
                  strokeWidth={2}
                  style={{ flexShrink: 0, opacity: 0.8 }}
                />
                <span>{text}</span>
                {profile.url && <ExternalLink size={10} style={{ opacity: 0.4 }} />}
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
                    gap: '4px',
                    color: 'inherit',
                    textDecoration: 'none',
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
                  gap: '4px',
                  color: 'inherit',
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
