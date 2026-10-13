import React from 'react';

import type { ElegantPalette } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/types';
import { ExternalLink } from 'lucide-react';

interface ElegantSectionProps {
  title?: string;
  p: ElegantPalette;
  children: React.ReactNode;
}

export const ElegantSection = ({ title, p, children }: ElegantSectionProps) => {
  return (
    <section style={{ marginBottom: '14px' }}>
      <h2
        style={{
          fontSize: '1.286em',
          fontWeight: 400,
          color: p.accent,
          marginBottom: '7px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '6px',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
};

interface ElegantEntryProps {
  title?: string;
  p: ElegantPalette;
  org?: string;
  location?: string;
  date?: string;
  url?: string;
  children?: React.ReactNode;
}

export const ElegantEntry = ({
  title,
  org,
  location,
  date,
  url,
  p: _p,
  children,
}: ElegantEntryProps) => {
  const TitleContent = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: '14px' }}>{title}</span>
      {(org || location) && (
        <span style={{ color: '#718096', fontSize: '0.929em', marginLeft: '6px' }}>
          {[org, location].filter(Boolean).join(' · ')}
        </span>
      )}
      {url && (
        <ExternalLink
          size={12}
          style={{ opacity: 0.6, color: '#718096', flexShrink: 0, marginLeft: '2px' }}
        />
      )}
    </div>
  );

  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
            title={url}
          >
            {TitleContent}
          </a>
        ) : (
          TitleContent
        )}
        {date && (
          <span
            style={{
              fontSize: '0.857em',
              color: '#a0aec0',
              whiteSpace: 'nowrap',
              fontStyle: 'italic',
            }}
          >
            {date}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

export const LevelBar = ({ level, p }: { level: number; p: ElegantPalette }) => {
  if (level <= 0) return null;
  const percentage = Math.min(Math.max(level, 0), 100);
  return (
    <div
      style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#edf2f7',
        borderRadius: '2px',
        marginTop: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: p.accent,
          borderRadius: '2px',
          transition: 'width 0.3s ease',
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
  p: ElegantPalette;
}) => {
  if (value <= 0) return null;
  const activeCount = Math.min(max, Math.max(1, value));
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        marginTop: '6px',
      }}
    >
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: i < activeCount ? p.accent : '#edf2f7',
            borderRadius: '50%',
            transition: 'background-color 0.3s ease',
          }}
        />
      ))}
    </div>
  );
};

export const BulletList = ({ items, p }: { items: string[]; p: ElegantPalette }) => {
  if (!items || items.length === 0) return null;
  return (
    <ul style={{ padding: 0, margin: '4px 0 0', listStyleType: 'none' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: '0.929em',
            color: '#4a5568',
            marginBottom: '2px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: p.accent,
              borderRadius: '50%',
              marginTop: '8px',
              flexShrink: 0,
            }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};
