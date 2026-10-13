import React from 'react';

import type { FoggyPalette } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/types';
import { ExternalLink } from 'lucide-react';

export const SectionHeader = ({
  icon,
  title,
  p,
}: {
  icon?: React.ReactNode;
  title: string;
  p: FoggyPalette;
}) => (
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
        backgroundColor: p.primary,
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
        color: p.text,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {icon && (
        <span style={{ color: p.primary, display: 'inline-flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      {title}
    </h3>
  </div>
);

export const TimelineEntry = ({
  title,
  subtitle,
  date,
  summary,
  highlights,
  url,
  location,
  isPresent,
  isLast,
  p,
  children,
}: {
  title: string;
  subtitle: string;
  date: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  url?: string;
  isPresent: boolean;
  isLast: boolean;
  p: FoggyPalette;
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
        backgroundColor: isPresent ? p.primary : '#cbd5e1',
        boxShadow: '0 0 0 1.5px ' + (isPresent ? p.primary : '#cbd5e1'),
        zIndex: 2,
      }}
    />
    {/* Line below dot */}
    <div
      style={{
        position: 'absolute',
        left: '5px',
        top: '18px',
        bottom: '0',
        width: '2px',
        backgroundColor: p.primary,
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
        {url ? (
          <a
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: '4px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <h4
              style={{
                fontSize: '0.929em',
                fontWeight: 700,
                color: p.text,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h4>
            <ExternalLink size={12} style={{ color: p.primary, marginTop: '2px' }} />
          </a>
        ) : (
          <h4
            style={{
              fontSize: '0.929em',
              fontWeight: 700,
              color: p.text,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h4>
        )}
        <div
          style={{
            fontSize: '0.857em',
            fontWeight: 500,
            color: p.primary,
            marginTop: '2px',
          }}
        >
          {subtitle}
          {location && <span style={{ opacity: 0.7 }}> · {location}</span>}
        </div>
      </div>
      <div
        style={{
          padding: '3px 8px',
          backgroundColor: p.primaryVeryLight,
          borderRadius: '4px',
          fontSize: '0.786em',
          fontWeight: 600,
          color: p.primary,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {date}
      </div>
    </div>
    {summary && (
      <p
        style={{
          fontSize: '0.857em',
          color: p.textMuted,
          margin: '4px 0 0 0',
          lineHeight: 1.5,
        }}
      >
        {summary}
      </p>
    )}
    {highlights && highlights.length > 0 && (
      <ul
        style={{
          paddingLeft: '18px',
          margin: '6px 0 0 0',
          listStyleType: 'disc',
        }}
      >
        {highlights.map((h, i) => (
          <li key={i} style={{ fontSize: '0.786em', color: p.textMuted, lineHeight: 1.5 }}>
            {h}
          </li>
        ))}
      </ul>
    )}
    {children}
  </div>
);

export const LevelBar = ({
  value,
  max = 100,
  p,
}: {
  value: number;
  max?: number;
  p: FoggyPalette;
}) => {
  if (value <= 0) return null;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div
      style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#e2e8f0',
        borderRadius: '2px',
        marginTop: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: p.primary,
          borderRadius: '2px',
        }}
      />
    </div>
  );
};

export const DiscreteLevelBar = ({
  value,
  max = 5,
  p,
}: {
  value: number;
  max?: number;
  p: FoggyPalette;
}) => {
  if (value <= 0) return null;
  const activeCount = Math.min(max, Math.max(1, value));
  return (
    <div
      style={{
        height: '4px',
        backgroundColor: '#e2e8f0',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '6px',
        display: 'flex',
        gap: '2px',
      }}
    >
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            backgroundColor: i < activeCount ? p.primary : 'transparent',
          }}
        />
      ))}
    </div>
  );
};
