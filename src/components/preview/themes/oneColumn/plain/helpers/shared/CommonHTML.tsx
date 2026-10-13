import React from 'react';

import type { PlainPalette } from '@/components/preview/themes/oneColumn/plain/helpers/shared/types';

export const SectionHeader = ({ title, p: _p }: { title: string; p: PlainPalette }) => {
  return (
    <h2
      style={{
        fontSize: '0.75em',
        fontWeight: 700,
        letterSpacing: '1.5px',
        margin: '0 0 8px',
        paddingBottom: '4px',
        borderBottom: '1px solid currentColor',
        opacity: 0.3,
        // CSS, not `toUpperCase`: it follows the CV's `lang`, so Turkish keeps `İ`.
        textTransform: 'uppercase',
      }}
    >
      {title}
    </h2>
  );
};

export const PlainEntry = ({
  left,
  right,
  children,
}: {
  left: React.ReactNode;
  right?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '13px' }}>{left}</div>
        {right && (
          <div
            style={{ fontSize: '0.75em', color: '#666', whiteSpace: 'nowrap', marginLeft: '12px' }}
          >
            {right}
          </div>
        )}
      </div>
      <div style={{ fontSize: '13px' }}>{children}</div>
    </div>
  );
};
