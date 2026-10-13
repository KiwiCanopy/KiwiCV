import React from 'react';

import {
  type SkylineTimelineRow,
  subtitleLine,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { SkylinePalette } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import { ExternalLink } from 'lucide-react';

export const GlassPanel = ({
  children,
  p,
  padding = '32px',
  marginBottom = '24px',
}: {
  children: React.ReactNode;
  p: SkylinePalette;
  padding?: string;
  marginBottom?: string;
}) => (
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(255, 255, 255, 1)',
      boxShadow: `0 8px 32px 0 ${p.primaryLight}`,
      borderRadius: '24px',
      padding,
      marginBottom,
    }}
  >
    {children}
  </div>
);

export const SectionHeader = ({
  icon,
  title,
  p,
  isMain = false,
}: {
  icon?: React.ReactNode;
  title: string;
  p: SkylinePalette;
  isMain?: boolean;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: isMain ? '24px' : '16px',
        borderBottom: isMain ? '1px solid #e2e8f0' : 'none',
        paddingBottom: isMain ? '12px' : '0',
      }}
    >
      {icon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: p.primaryLight,
            padding: '6px',
            borderRadius: '8px',
            color: p.primary,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: isMain ? '1.25em' : '1.1em',
          fontWeight: 700,
          color: p.textMain,
          margin: 0,
        }}
      >
        {title}
      </h3>
    </div>
  );
};

export const LevelBar = ({
  value,
  max = 100,
  color,
  type = 'continuous',
}: {
  value: number;
  max?: number;
  color: string;
  type?: 'continuous' | 'discrete';
}) => {
  if (value <= 0) return null;

  if (type === 'discrete') {
    const activeCount = Math.round(Math.min(5, (value / max) * 5));
    return (
      <div style={{ display: 'flex', gap: '2px', width: '100%', height: '4px', marginTop: '6px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '100%',
              backgroundColor: i < activeCount ? color : '#e2e8f0',
              borderRadius: '1px',
            }}
          />
        ))}
      </div>
    );
  }

  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div
      style={{
        height: '4px',
        width: '100%',
        backgroundColor: '#e2e8f0',
        borderRadius: '2px',
        marginTop: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

/**
 * One sidebar timeline entry, in the order the serializer's `sideEntry` prints:
 * date, title, subtitle · location, summary, highlights.
 */
export const SideTimelineEntry = ({ p, ...row }: SkylineTimelineRow & { p: SkylinePalette }) => {
  const { title, date, summary, highlights, url } = row;
  const line = subtitleLine(row);
  const titleText = (
    <div style={{ fontWeight: 700, color: p.textMain, fontSize: '0.95em' }}>{title}</div>
  );
  return (
    <div>
      {date && (
        <div
          style={{
            fontSize: '0.7em',
            fontWeight: 500,
            color: p.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '2px',
          }}
        >
          {date}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {url ? (
          <a
            href={url}
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
            {titleText}
            <ExternalLink size={12} style={{ color: p.primary, flexShrink: 0, marginTop: '2px' }} />
          </a>
        ) : (
          titleText
        )}
      </div>
      {line && (
        <div style={{ fontSize: '0.85em', fontWeight: 600, color: p.textMuted, marginTop: '2px' }}>
          {line}
        </div>
      )}
      {summary && (
        <div style={{ fontSize: '0.85em', color: p.textMuted, marginTop: '4px' }}>{summary}</div>
      )}
      {highlights && highlights.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: summary ? '3px 0 0' : '2px 0 0' }}>
          {highlights.map((h, j) => (
            <li
              key={j}
              style={{
                display: 'flex',
                gap: '6px',
                fontSize: '0.85em',
                color: p.textMuted,
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: p.primary, flexShrink: 0 }}>•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** An ended entry's timeline dot; the serializer's `is-present` branch draws the same grey. */
export const TIMELINE_DOT_UNLIT = '#cbd5e1';

export const TimelineEntry = ({
  title,
  subtitle,
  location,
  date,
  highlights,
  summary,
  p,
  isPresent = false,
  isLast = false,
  url,
}: {
  title: string;
  subtitle?: string;
  location?: string;
  date?: string;
  highlights?: string[];
  summary?: string;
  p: SkylinePalette;
  isPresent?: boolean;
  isLast?: boolean;
  url?: string;
}) => {
  const line = subtitleLine({ subtitle, location });
  return (
    <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isPresent ? p.primary : TIMELINE_DOT_UNLIT,
            border: '2px solid white',
            zIndex: 1,
            marginTop: '4px',
          }}
        />
        {/* Line below dot */}
        <div
          style={{
            width: '2px',
            flex: 1,
            backgroundColor: p.primary,
            marginTop: '-4px',
            marginBottom: '-4px',
            zIndex: 0,
          }}
        />
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? '0' : '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1.05em', fontWeight: 700, color: p.textMain }}>
                {title}
              </h4>
              <ExternalLink size={14} style={{ color: p.primary, flexShrink: 0 }} />
            </a>
          ) : (
            <h4
              style={{ margin: 0, fontSize: '1.05em', fontWeight: 700, color: p.textMain, flex: 1 }}
            >
              {title}
            </h4>
          )}
          {date && (
            <span
              style={{
                fontSize: '0.8em',
                fontWeight: 600,
                color: p.primary,
                background: p.primaryVeryLight,
                padding: '2px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              {date}
            </span>
          )}
        </div>
        {line && (
          <div style={{ fontSize: '0.9em', fontWeight: 600, color: p.primary, marginTop: '4px' }}>
            {line}
          </div>
        )}
        {summary && (
          <p style={{ fontSize: '0.95em', color: p.textMuted, marginTop: '8px', lineHeight: 1.6 }}>
            {summary}
          </p>
        )}
        {highlights && highlights.length > 0 && (
          <ul
            style={{
              paddingLeft: '18px',
              margin: '8px 0 0 0',
              listStyleType: 'disc',
            }}
          >
            {highlights.map((h, j) => (
              <li
                key={j}
                style={{
                  fontSize: '0.92em',
                  color: p.textMuted,
                  marginBottom: '4px',
                  lineHeight: 1.5,
                }}
              >
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
