import type { ResumeMeta } from '@/types/resume';

import type { ImageStyleOptions } from './types';

/**
 * Get CSS styles for HTML images based on the theme metadata.
 */
export function getImageStylesHTML(meta: ResumeMeta, options: ImageStyleOptions = {}) {
  const {
    width = '100%',
    borderColor = 'rgba(255,255,255,0.2)',
    borderWidth = 0, // Default to 0, border should be on container
    hasBorder = false, // Default to false
    shadow,
    background,
  } = options;
  const shape = meta?.theme?.params?.imageShape || 'square';

  return {
    width,
    height: 'auto',
    objectFit: 'cover' as const,
    borderRadius: shape === 'square' ? '0' : '50%',
    display: 'block',
    margin: '0 auto',
    overflow: 'hidden' as const,
    ...(hasBorder && { border: `${borderWidth}px solid ${borderColor}` }),
    ...(shadow && {
      boxShadow: typeof shadow === 'string' ? shadow : '0 4px 12px rgba(0,0,0,0.1)',
    }),
    ...(background && { background }),
  };
}

/**
 * Get CSS styles for image containers (frames/borders) in HTML.
 */
export function getImageContainerStylesHTML(meta: ResumeMeta, options: ImageStyleOptions = {}) {
  const {
    width = '120px',
    borderWidth = 4,
    borderColor = '#e5e7eb',
    background = '#ffffff',
    hasBorder = true,
  } = options;
  const shape = meta?.theme?.params?.imageShape || 'square';

  return {
    width,
    padding: `${borderWidth}px`,
    backgroundColor: hasBorder ? borderColor : background,
    overflow: 'hidden' as const,
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    borderRadius: shape === 'square' ? '0' : '50%',
    display: 'inline-block',
    lineHeight: 0,
    boxSizing: 'border-box' as const,
  };
}
