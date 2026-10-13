import React from 'react';

import type { SoftPalette } from '@/components/preview/themes/twoColumn/soft/helpers/shared/types';

export const SectionHeader = ({
  title,
  p,
  icon,
  marginBottom = '24px',
}: {
  title: string;
  p: SoftPalette;
  icon?: React.ReactNode | React.ComponentType<{ size?: number; color?: string }>;
  marginBottom?: string | number;
}) => {
  if (!title) return null;

  const IconComp = icon as React.ComponentType<{ size?: number; color?: string }>;

  return (
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: 800,
        marginBottom,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: p.textMain,
      }}
    >
      {icon && (
        <div
          style={{
            backgroundColor: `${p.primary}1a`,
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: p.primary,
          }}
        >
          {React.isValidElement(icon) ? icon : <IconComp size={20} color={p.primary} />}
        </div>
      )}
      {title}
    </h3>
  );
};

export const SideSectionHeader = ({
  title,
  p,
  icon,
  marginBottom = '12px',
}: {
  title: string;
  p: SoftPalette;
  icon?: React.ReactNode | React.ComponentType<{ size?: number; color?: string }>;
  marginBottom?: string | number;
}) => {
  if (!title) return null;

  const IconComp = icon as React.ComponentType<{ size?: number; color?: string }>;

  return (
    <h4
      style={{
        fontSize: '1rem',
        fontWeight: 800,
        marginBottom,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: p.textMain,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      {icon && (
        <div
          style={{
            backgroundColor: `${p.primary}1a`,
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: p.primary,
          }}
        >
          {React.isValidElement(icon) ? icon : <IconComp size={16} color={p.primary} />}
        </div>
      )}
      {title}
    </h4>
  );
};
