import type { ThemePalette } from '@/components/preview/themes/shared';

export const SidebarItem = ({ children }: { children: React.ReactNode; p?: ThemePalette }) => (
  <div
    style={{
      fontSize: '0.93em',
      marginBottom: '0.4em',
      lineHeight: 1.5,
      wordBreak: 'break-word',
    }}
  >
    {children}
  </div>
);

export const SidebarHeading = ({
  children,
  color,
  borderColor,
}: {
  children: React.ReactNode;
  color: string;
  borderColor: string;
}) => (
  <h3
    style={{
      fontSize: '0.79em',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '0.86em',
      color: color,
      borderBottom: `1px solid ${borderColor}`,
      paddingBottom: '0.4em',
    }}
  >
    {children}
  </h3>
);

export const Section = ({
  title,
  children,
  p,
}: {
  title: string;
  children: React.ReactNode;
  p?: ThemePalette;
}) => (
  <div style={{ marginBottom: '1.7em' }}>
    {title && (
      <h2
        style={{
          fontSize: '1.15em',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          opacity: 0.9,
          marginBottom: '0.86em',
          borderBottom: `1.5px solid ${p?.border || 'rgba(0,0,0,0.1)'}`,
          paddingBottom: '0.2em',
          color: p?.primary,
        }}
      >
        {title}
      </h2>
    )}
    {children}
  </div>
);

export const Entry = ({
  title,
  subtitle,
  location,
  date,
  children,
  p,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  location?: string;
  date?: string;
  children?: React.ReactNode;
  p?: ThemePalette;
}) => (
  <div style={{ marginBottom: '1em' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div>
        <span style={{ fontWeight: 600, fontSize: '1em' }}>{title}</span>
        {(subtitle || location) && (
          <span style={{ color: p?.textMuted || '#777', fontSize: '0.93em' }}>
            {' · '}
            {[subtitle, location].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
      {date && (
        <span
          style={{
            fontSize: '0.86em',
            color: p?.textMuted || '#999',
            whiteSpace: 'nowrap',
            marginLeft: '0.86em',
          }}
        >
          {date}
        </span>
      )}
    </div>
    {children}
  </div>
);

export const LevelBar = ({
  value,
  max = 100,
  color = '#000000',
}: {
  value: number;
  max?: number;
  color?: string;
}) => {
  if (!value || value <= 0) return null;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div
      style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '2px',
        marginTop: '0.4em',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '2px',
          opacity: 0.8,
        }}
      />
    </div>
  );
};

export const DiscreteLevelBar = ({
  value,
  max = 5,
  color = '#000000',
}: {
  value: number;
  max?: number;
  color?: string;
}) => {
  if (!value || value <= 0) return null;
  const activeCount = Math.min(max, Math.max(1, value));

  return (
    <div style={{ display: 'flex', gap: '3px', marginTop: '0.4em' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '4px',
            backgroundColor: i < activeCount ? color : 'rgba(0,0,0,0.05)',
            borderRadius: '2px',
            opacity: i < activeCount ? 0.8 : 0.3,
          }}
        />
      ))}
    </div>
  );
};
