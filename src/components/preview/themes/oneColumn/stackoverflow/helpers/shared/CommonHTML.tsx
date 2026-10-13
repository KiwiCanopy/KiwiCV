import type { StackoverflowPalette } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/types';
import { ExternalLink } from 'lucide-react';

export const SOSection = ({
  title,
  p,
  children,
}: {
  title: string;
  p: StackoverflowPalette;
  children: React.ReactNode;
}) => {
  return (
    <section style={{ marginBottom: '26px' }}>
      <h2
        style={{
          fontSize: '1em',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'inherit',
          marginBottom: '14px',
          paddingBottom: '6px',
          borderBottom: `2px solid ${p.primary}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
};

export const SOEntry = ({
  title,
  org,
  date,
  url,
  p,
  children,
}: {
  title: string;
  org?: string;
  date?: string;
  url?: string;
  p: StackoverflowPalette;
  children?: React.ReactNode;
}) => {
  return (
    <div
      style={{
        marginBottom: '16px',
        paddingLeft: '16px',
        borderLeft: `2px solid ${p.border}`,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '-5px',
          top: '6px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: p.primary,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ flex: 1, marginRight: '8px' }}>
          {url ? (
            <div style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '1em' }}>{title}</span>
                {org && (
                  <span style={{ color: p.textMuted, fontSize: '0.929em', marginLeft: '4px' }}>
                    {org}
                  </span>
                )}
                <ExternalLink
                  size={12}
                  style={{ opacity: 0.6, color: p.primary, marginLeft: '4px' }}
                />
              </a>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1em', color: 'inherit' }}>{title}</span>
              {org && (
                <span style={{ color: p.textMuted, fontSize: '0.929em', marginLeft: '4px' }}>
                  {org}
                </span>
              )}
            </div>
          )}
        </div>
        {date && (
          <span
            style={{
              fontSize: '0.857em',
              color: p.textMuted,
              whiteSpace: 'nowrap',
              marginLeft: '12px',
              flexShrink: 0,
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

export const LevelBar = ({
  level,
  max = 5,
  p,
  type = 'discrete',
}: {
  level: number;
  max?: number;
  p: StackoverflowPalette;
  type?: 'discrete' | 'continuous';
}) => {
  if (type === 'continuous') {
    return (
      <div
        style={{
          height: '4px',
          width: '100%',
          backgroundColor: p.border,
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '4px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(level / max) * 100}%`,
            backgroundColor: p.primary,
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '12px',
            height: '6px',
            backgroundColor: i < level ? p.primary : p.border,
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  );
};
