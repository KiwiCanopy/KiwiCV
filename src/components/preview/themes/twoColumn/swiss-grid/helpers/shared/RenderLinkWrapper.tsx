import React from 'react';

import type { SwissGridPalette } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/types';
import { ExternalLink } from 'lucide-react';

export const RenderLinkWrapper = ({
  url,
  children,
  p,
  fontScale,
  style = {},
  showIcon = true,
}: {
  url?: string;
  children: React.ReactNode;
  p: SwissGridPalette;
  fontScale: number;
  style?: React.CSSProperties;
  showIcon?: boolean;
}) => {
  if (!url)
    return <div style={{ display: 'flex', alignItems: 'center', ...style }}>{children}</div>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        ...style,
      }}
    >
      {children}
      {showIcon && (
        <ExternalLink size={12 * fontScale} style={{ color: p.primary, marginLeft: '6px' }} />
      )}
    </a>
  );
};
