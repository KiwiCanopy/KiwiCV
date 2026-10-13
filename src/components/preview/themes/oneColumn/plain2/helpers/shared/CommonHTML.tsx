import type { Plain2Palette } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/types';
import { ExternalLink } from 'lucide-react';

export const SectionHeader = ({ title, p }: { title: string; p: Plain2Palette }) => {
  return (
    <h2
      style={{
        fontSize: '0.929em',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: '#111827',
        marginBottom: '14px',
        borderBottom: `2px solid ${p.border}`,
        paddingBottom: '6px',
      }}
    >
      {title}
    </h2>
  );
};

export const Entry = ({
  title,
  subtitle,
  date,
  url,
  children,
  p: _p,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  url?: string;
  children?: React.ReactNode;
  p: Plain2Palette;
}) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                color: 'inherit',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1.071em', color: '#111827' }}>
                {title}
              </span>
              {subtitle && (
                <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '4px' }}>
                  {subtitle}
                </span>
              )}
              <ExternalLink
                size={14}
                style={{ opacity: 0.5, color: '#111827', marginLeft: '8px' }}
              />
            </a>
          ) : (
            <>
              <span style={{ fontWeight: 700, fontSize: '1.071em', color: '#111827' }}>
                {title}
              </span>
              {subtitle && (
                <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '4px' }}>
                  {subtitle}
                </span>
              )}
            </>
          )}
        </div>
        {date && (
          <span
            style={{
              fontSize: '0.857em',
              color: '#9ca3af',
              whiteSpace: 'nowrap',
              marginLeft: '12px',
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

export const SideEntry = ({
  title,
  subtitle,
  date,
  p,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  p: Plain2Palette;
}) => {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontWeight: 700, fontSize: '1em', color: '#111827' }}>{title}</div>
      {(subtitle || date) && (
        <div style={{ fontSize: '0.857em', color: p.textMuted, marginTop: '2px' }}>
          {subtitle}
          {subtitle && date && ' • '}
          {date}
        </div>
      )}
    </div>
  );
};
