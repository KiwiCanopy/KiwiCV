import type { MistyPalette } from '@/components/preview/themes/twoColumn/misty/helpers/shared/types';
import { ExternalLink } from 'lucide-react';

export const SectionHeader = ({ title, p }: { title: string; p?: MistyPalette }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
    }}
  >
    <span
      style={{
        width: '32px',
        height: '2px',
        backgroundColor: p?.primary,
        borderRadius: '2px',
        flexShrink: 0,
      }}
    />
    <h3
      style={{
        fontSize: '0.786em',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: p?.text,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {title}
    </h3>
  </div>
);

export const Badge = ({ children, p }: { children: React.ReactNode; p?: MistyPalette }) => (
  <span
    style={{
      padding: '2px 8px',
      backgroundColor: p?.primaryVeryLight || '#f1f5f9',
      border: `1px solid ${p?.border || '#e2e8f0'}`,
      borderRadius: '4px',
      fontSize: '0.75em',
      fontWeight: 500,
      color: p?.textMuted || '#64748b',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

export const LevelBar = ({ level, p }: { level: number; p?: MistyPalette }) => (
  <div
    style={{
      height: '5px',
      width: '100%',
      backgroundColor: p?.border,
      borderRadius: '3px',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        height: '100%',
        width: `${level}%`,
        backgroundColor: p?.primary,
        borderRadius: '3px',
        transition: 'width 0.3s ease',
      }}
    />
  </div>
);

export const DiscreteLevelBar = ({
  value,
  max = 5,
  p,
}: {
  value: number;
  max?: number;
  p?: MistyPalette;
}) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        style={{
          height: '5px',
          flex: 1,
          backgroundColor: i < value ? p?.primary : p?.border,
          borderRadius: '2px',
        }}
      />
    ))}
  </div>
);

export const RenderLink = ({
  url,
  children,
  p,
  className,
}: {
  url?: string;
  children: React.ReactNode;
  p?: MistyPalette;
  className?: string;
}) => {
  if (!url) return <span className={className}>{children}</span>;
  if (!p) return <span className={className}>{children}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: '4px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {children}
      <ExternalLink size={12} style={{ color: p?.primary, flexShrink: 0, marginTop: '2px' }} />
    </a>
  );
};

/**
 * MistySection wraps main content with a SectionHeader.
 */
export const MistySection = ({
  title,
  p,
  children,
}: {
  title: string;
  p?: MistyPalette;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: '24px' }}>
    <SectionHeader title={title} p={p} />
    {children}
  </div>
);

/**
 * Timeline Entry for main column sections (Work, Education, Volunteer, Projects).
 */
export const TimelineEntry = ({
  title,
  subtitle,
  location,
  date,
  summary,
  highlights,
  url,
  isPresent,
  isLast,
  p,
  children,
}: {
  title: string;
  subtitle: string;
  location?: string;
  date: string;
  summary?: string;
  highlights?: string[];
  url?: string;
  isPresent: boolean;
  isFirst: boolean;
  isLast: boolean;
  p?: MistyPalette;
  children?: React.ReactNode;
}) => (
  <div
    style={{
      position: 'relative',
      paddingLeft: '24px',
      paddingBottom: isLast ? '4px' : '24px',
    }}
  >
    {/* Dot */}
    <span
      style={{
        position: 'absolute',
        left: '0',
        top: '4px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '2.5px solid white',
        backgroundColor: isPresent ? p?.primary : '#cbd5e1',
        boxShadow: '0 0 0 1.5px ' + (isPresent ? p?.primary : '#cbd5e1'),
        zIndex: 2,
      }}
    />
    {/* Line below dot — lighter and thinner on the last item */}
    <div
      style={{
        position: 'absolute',
        left: '4px',
        top: '18px',
        bottom: '0',
        width: '3px',
        backgroundColor: p?.primary,
      }}
    />
    {/* Content */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '3px',
      }}
    >
      <div style={{ flex: 1 }}>
        <RenderLink url={url} p={p}>
          <h4
            style={{
              fontSize: '1em',
              fontWeight: 700,
              color: p?.text,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h4>
        </RenderLink>
      </div>
      <span
        style={{
          padding: '3px 10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.786em',
          fontWeight: 500,
          color: p?.textMuted,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {date}
      </span>
    </div>
    {(subtitle || location) && (
      <div style={{ fontSize: '0.857em', color: p?.primary, fontWeight: 500, marginBottom: '6px' }}>
        {[subtitle, location].filter(Boolean).join(' · ')}
      </div>
    )}
    {summary && (
      <p style={{ fontSize: '0.857em', color: p?.textMuted, margin: '0 0 8px 0', lineHeight: 1.6 }}>
        {summary}
      </p>
    )}
    {highlights && highlights.length > 0 && (
      <ul
        style={{
          paddingLeft: '16px',
          margin: 0,
          listStyleType: 'disc',
          listStylePosition: 'outside',
        }}
      >
        {highlights.map((h, i) => (
          <li
            key={i}
            style={{
              fontSize: '0.814em',
              color: p?.textMuted,
              marginBottom: '4px',
              lineHeight: 1.5,
            }}
          >
            {h}
          </li>
        ))}
      </ul>
    )}
    {children}
  </div>
);
