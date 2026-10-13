import React from 'react';

import type { SwissGridPalette } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';

export const sectionLabelStyle = (p: SwissGridPalette): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-end',
  fontSize: '1.5em',
  fontWeight: 900,
  textTransform: 'uppercase',
  marginBottom: '24px',
  borderBottom: `3px solid ${p.textMain}`,
  paddingBottom: '8px',
  width: '100%',
});

export const sectionNumStyle = (p: SwissGridPalette): React.CSSProperties => ({
  color: p.primary,
  fontSize: '2em',
  // The serializer's face and weight ("bold"): JetBrains Mono ships only 400 and
  // 700, and bare `monospace` has no PDF face.
  fontWeight: 700,
  fontFamily: "'JetBrains Mono', monospace",
  marginRight: '16px',
});

export const sidebarHeaderStyle = (p: SwissGridPalette): React.CSSProperties => ({
  fontSize: '0.8125em',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '8px',
  marginTop: '32px',
  display: 'block',
  borderBottom: `3px solid ${p.primary}`,
  paddingBottom: '4px',
  width: '100%',
  color: p.textMain,
});

export const getMainSectionNumber = (index: number, aboutExists: boolean) => {
  const offset = aboutExists ? 2 : 1;
  const num = index + offset;
  return num < 10 ? `0${num}` : `${num}`;
};
